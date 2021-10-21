import React, { useState } from "react";
import { ActionButton } from "@canonical/react-components";
import { useMutation } from "react-query";
import * as Sentry from "@sentry/react";

import { BuyButtonProps } from "../../../PurchaseModal/utils/utils";
import { usePurchase } from "../../hooks/usePurchase";

const BuyButton = ({
  areTermsChecked,
  isUsingFreeTrial,
  setTermsChecked,
  setError,
  setStep,
}: BuyButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const purchaseMutation = usePurchase();

  const {
    data: pendingPurchase,
    setPendingPurchaseID,
    error: purchaseError,
  } = usePendingPurchase();

  const onPayClick = () => {
    setIsLoading(true);

    purchaseMutation.mutate(undefined, {
      onSuccess: (data) => {
        //start polling
        setPendingPurchaseID(data);
      },
      onError: (error) => {
        setIsLoading(false);
        if (
          error instanceof Error &&
          error.message.includes("can only make one purchase at a time")
        ) {
          setError(
            <>
              You already have a pending purchase. Please go to{" "}
              <a href="/account/payment-methods">payment methods</a> to retry.
            </>
          );
        } else {
          Sentry.captureException(error);
          setError(
            <>
              Sorry, there was an unknown error with with the payment. Check the
              details and try again. Contact{" "}
              <a href="https://ubuntu.com/contact-us">Canonical sales</a> if the
              problem persists.
            </>
          );
        }
      },
    });
  };

  return (
    <ActionButton
      className="col-small-2 col-medium-2 col-3 u-no-margin"
      appearance="positive"
      aria-label="Buy"
      style={{ textAlign: "center" }}
      disabled={!areTermsChecked || isLoading}
      loading={isLoading}
      onClick={onPayClick}
    >
      Buy
    </ActionButton>
  );
};

export default BuyButton;
