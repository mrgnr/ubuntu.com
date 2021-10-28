import React from "react";
import CubePurchase from "../CubePurchase";

type Props = {
  studyLabURL: string;
  productName: string;
  productListingId: string;
  isEnrolled: boolean;
  buttonAppearance?: "neutral" | "positive";
};

const PrepareButton = ({
  studyLabURL,
  productName,
  productListingId,
  isEnrolled,
  buttonAppearance = "neutral",
}: Props) => {
  return (
    <>
      {isEnrolled ? (
        <a
          className={`p-button--${buttonAppearance} u-no-margin--right`}
          href={studyLabURL}
        >
          Prepare
        </a>
      ) : (
        <CubePurchase
          productName={productName}
          productListingId={productListingId}
          buttonText="Prepare"
          buttonAppearance={buttonAppearance}
        />
      )}
    </>
  );
};

export default PrepareButton;
