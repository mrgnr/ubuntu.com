import os
import flask
import talisker.requests
import talisker.sentry
import yaml
import json

from pathlib import Path
from urllib.parse import quote_plus
from flask import g
from requests import Session
from webargs.fields import String
from webapp.advantage.decorators import advantage_decorator
from webapp.advantage.flaskparser import use_kwargs
from webapp.cube.api import BadgrAPI, EdxAPI
from webapp.decorators import login_required
from webapp.login import user_info

CUBE_CONTENT = yaml.load(
    Path("webapp/cube/content/cube.yaml").read_text(), Loader=yaml.Loader
)

QA_BADGR_ISSUER = "36ZEJnXdTjqobw93BJElog"
QA_CERTIFIED_BADGE = "x9kzmcNhSSyqYhZcQGz0qg"
QA_STUDY_LABS = "course-v1:ubuntu+cubereview+coursecommandsdev"

BADGR_ISSUER = "eTedPNzMTuqy1SMWJ05UbA"
CERTIFIED_BADGE = "hs8gVorCRgyO2mNUfeXaLw"

badgr_session = Session()
talisker.requests.configure(badgr_session),
badgr_api = BadgrAPI(
    os.getenv("BADGR_URL"),
    os.getenv("BAGDR_USER"),
    os.getenv("BADGR_PASSWORD"),
    badgr_session,
)

# This API lives under a sub-domain of ubuntu.com but requests to it
# still need proxying, so we configure the session manually to avoid
# it loading the configurations from environment variables, since those
# default to not proxy requests for ubuntu.com sub-domains and that is
# the intended behaviour for most of our apps
proxies = {"http": os.getenv("HTTP_PROXY"), "https": os.getenv("HTTPS_PROXY")}
edx_session = Session()
edx_session.proxies.update(proxies)
talisker.requests.configure(edx_session)

edx_api = EdxAPI(
    os.getenv("CUBE_EDX_URL"),
    os.getenv("CUBE_EDX_CLIENT_ID"),
    os.getenv("CUBE_EDX_CLIENT_SECRET"),
    edx_session,
)


@advantage_decorator(permission=None, response="html")
def cube_microcerts():

    sso_user = user_info(flask.session)

    account = None
    if sso_user:
        try:
            account = g.api.get_purchase_account()
            print(account)
        #except UAContractsUserHasNoAccount:
        except Exception as e:
            import traceback
            print('!!! exception: ', traceback.format_exc())
            # There is no purchase account yet for this user.
            # One will need to be created later; expected condition.
            pass

    edx_url = (
        f"{edx_api.base_url}/auth/login/tpa-saml/"
        "?auth_entry=login&idp=ubuntuone&next="
    )

    edx_user = edx_api.get_user(sso_user["email"]) if sso_user else None
    product_listings = g.api.get_product_listings("canonical-cube")[
        "productListings"
    ]
    study_labs = None
    assertions = {}
    enrollments = []
    passed_courses = 0

    if edx_user:
        assertions = {
            assertion["badgeclass"]: assertion
            for assertion in badgr_api.get_assertions(
                BADGR_ISSUER, edx_user["email"]
            )["result"]
        }

        enrollments = [
            enrollment["course_details"]["course_id"]
            for enrollment in edx_api.get_enrollments(edx_user["username"])
            if enrollment["is_active"]
        ]

    certified_badge = {}
    if CERTIFIED_BADGE in assertions:
        assertion = assertions.pop(CERTIFIED_BADGE)
        if not assertion["revoked"]:
            certified_badge["image"] = assertion["image"]
            certified_badge["share_url"] = assertion["openBadgeId"]

    courses = []
    for product_list in product_listings:
        attempts = []

        course_id = [
            edx_id
            for edx_id in product_list["externalIDs"]
            if edx_id["origin"] == "EdX"
        ][0]["IDs"][0]

        course = {
            "id": course_id,
            "product_listing_id": product_list["id"],
            "value": product_list["price"]["value"],
        }

        # Get UA Contracts content
        if "metadata" in product_list:
            for course_meta in product_list["metadata"]:
                if course_meta["key"] == "topics":
                    course_meta["value"] = json.loads(course_meta["value"])

                course[course_meta["key"]] = course_meta["value"]

            if edx_user:
                # Get Edx content
                attempts = edx_api.get_course_attempts(
                    course["id"], edx_user["username"]
                )["proctored_exam_attempts"]

        else:
            # study lab
            study_labs = [
                ids["IDs"]
                for ids in product_list["externalIDs"]
                if ids["origin"] == "EdX"
            ][0][0]

        # This codition skips study labs
        # Which don't have badgr data
        if "badge-class" in course:
            assertion = assertions.get(course["badge-class"])
            course["status"] = "not-enrolled"
            if assertion and not assertion["revoked"]:
                course["badge_url"] = assertion["image"]
                course["status"] = "passed"
                passed_courses += 1
            elif attempts:
                course["status"] = (
                    "in-progress"
                    if not attempts[0]["completed_at"]
                    else "failed"
                )
            elif course["id"] in enrollments:
                course["status"] = "enrolled"

            course_id = course["id"]
            courseware_name = course_id.split("+")[1]

            course["take_url"] = edx_url + quote_plus(
                f"/courses/{course_id}/courseware/2020/start/?child=first"
            )

            course["study_lab"] = edx_url + quote_plus(
                f"/courses/{study_labs}"
                f"/courseware/{courseware_name}/?child=first"
            )

            study_labs_url = edx_url + quote_plus(
                f"/courses/{study_labs}/course/"
            )

            courses.append(course)

    return flask.render_template(
        "cube/microcerts.html",
        **{
            "edx_user": edx_user,
            "edx_register_url": f"{edx_url}%2F",
            "sso_user": sso_user,
            "certified_badge": certified_badge or None,
            "modules": courses,
            "passed_courses": passed_courses,
            "has_enrollments": len(enrollments) > 0,
            "has_study_labs": study_labs in enrollments,
            "study_labs_url": study_labs_url,
            "account": account,
        },
    )


@advantage_decorator(permission=None, response="json")
def get_microcerts():

    sso_user = user_info(flask.session)

    edx_url = (
        f"{edx_api.base_url}/auth/login/tpa-saml/"
        "?auth_entry=login&idp=ubuntuone&next="
    )

    edx_user = edx_api.get_user(sso_user["email"]) if sso_user else None
    product_listings = g.api.get_product_listings("canonical-cube")[
        "productListings"
    ]
    study_labs = None
    assertions = {}
    enrollments = []
    passed_courses = 0

    if edx_user:
        assertions = {
            assertion["badgeclass"]: assertion
            for assertion in badgr_api.get_assertions(
                BADGR_ISSUER, edx_user["email"]
            )["result"]
        }

        enrollments = [
            enrollment["course_details"]["course_id"]
            for enrollment in edx_api.get_enrollments(edx_user["username"])
            if enrollment["is_active"]
        ]

    certified_badge = {}
    if CERTIFIED_BADGE in assertions:
        assertion = assertions.pop(CERTIFIED_BADGE)
        if not assertion["revoked"]:
            certified_badge["image"] = assertion["image"]
            certified_badge["share_url"] = assertion["openBadgeId"]

    courses = []
    for product_list in product_listings:
        attempts = []

        course_id = [
            edx_id
            for edx_id in product_list["externalIDs"]
            if edx_id["origin"] == "EdX"
        ][0]["IDs"][0]

        course = {
            "id": course_id,
            "product_listing_id": product_list["id"],
            "value": product_list["price"]["value"],
        }

        # Get UA Contracts content
        if "metadata" in product_list:
            for course_meta in product_list["metadata"]:
                if course_meta["key"] == "topics":
                    course_meta["value"] = json.loads(course_meta["value"])

                course[course_meta["key"]] = course_meta["value"]

            if edx_user:
                # Get Edx content
                attempts = edx_api.get_course_attempts(
                    course["id"], edx_user["username"]
                )["proctored_exam_attempts"]

        else:
            # study lab
            study_labs = [
                ids["IDs"]
                for ids in product_list["externalIDs"]
                if ids["origin"] == "EdX"
            ][0][0]

        # This codition skips study labs
        # Which don't have badgr data
        if "badge-class" in course:
            assertion = assertions.get(course["badge-class"])
            course["status"] = "not-enrolled"
            if assertion and not assertion["revoked"]:
                course["badge_url"] = assertion["image"]
                course["status"] = "passed"
                passed_courses += 1
            elif attempts:
                course["status"] = (
                    "in-progress"
                    if not attempts[0]["completed_at"]
                    else "failed"
                )
            elif course["id"] in enrollments:
                course["status"] = "enrolled"

            course_id = course["id"]
            courseware_name = course_id.split("+")[1]

            course["take_url"] = edx_url + quote_plus(
                f"/courses/{course_id}/courseware/2020/start/?child=first"
            )

            course["study_lab"] = edx_url + quote_plus(
                f"/courses/{study_labs}"
                f"/courseware/{courseware_name}/?child=first"
            )

            study_labs_url = edx_url + quote_plus(
                f"/courses/{study_labs}/course/"
            )

            courses.append(course)

        def getCourseIndex(course):
            for i, c in enumerate(CUBE_CONTENT["courses"]):
                if course["id"] == c["id"]:
                    return i
            return -1

        courses = sorted(courses, key=getCourseIndex)

    return flask.jsonify(
        {
            "edx_user": edx_user,
            "edx_register_url": f"{edx_url}%2F",
            "sso_user": sso_user,
            "certified_badge": certified_badge or None,
            "modules": courses,
            "passed_courses": passed_courses,
            "has_enrollments": len(enrollments) > 0,
            "has_study_labs": study_labs in enrollments,
            "study_labs_url": study_labs_url,
        }
    )


@advantage_decorator(permission=None, response="json")
@use_kwargs(
    {
        "account_id": String(required=True),
        "product_listing_id": String(required=True),
        "preview": String(),
    },
    location="json",
)
def post_microcerts_purchase(**kwargs):
    """
    Purchase preview and complete purchase
    for CUBE microcertifications
    """
    account_id = kwargs.get("account_id")
    # Only purchase of one item allowed at a time
    product_listing_id = kwargs.get("product_listing_id")
    preview = kwargs.get("preview")

    purchase_request = {
        "accountID": account_id,
        "purchaseItems": [
            {
                "productListingID": product_listing_id,
                "value": 1,
            }
        ],
    }

    if preview:
        purchase = g.api.preview_purchase_from_marketplace(
            marketplace="canonical-cube", purchase_request=purchase_request
        )
    else:
        purchase = g.api.purchase_from_marketplace(
            marketplace="canonical-cube", purchase_request=purchase_request
        )

    return flask.jsonify(purchase)


def cube_home():
    return flask.render_template("cube/index.html")


@login_required
def cube_study_labs_button():
    sso_user = user_info(flask.session)

    edx_user = edx_api.get_user(sso_user["email"])
    enrollments = [
        enrollment["course_details"]["course_id"]
        for enrollment in edx_api.get_enrollments(edx_user["username"])
        if enrollment["is_active"]
    ]

    text = "Purchase study labs access"
    redirect_url = "/cube/microcerts"

    if CUBE_CONTENT["study-labs"] in enrollments:
        text = "Access study labs"
        prepare_materials_path = quote_plus(
            f"/courses/{CUBE_CONTENT['study-labs']}/course/"
        )
        redirect_url = (
            f"{edx_api.base_url}/auth/login/tpa-saml/"
            f"?auth_entry=login&idp=ubuntuone&next={prepare_materials_path}"
        )

    return flask.jsonify({"text": text, "redirect_url": redirect_url})
