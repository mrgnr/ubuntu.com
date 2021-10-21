import React, { useState } from "react";
import { ActionButton, Button, Modal } from "@canonical/react-components";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import PurchaseModal from "../../../PurchaseModal";
import Summary from "../Summary";
import BuyButton from "../BuyButton";

type Props = {
  product: string;
};

const CubePurchase = ({ product }: Props) => {
  const [modalOpen, setModalOpen] = useState(false);
  const closeHandler = () => setModalOpen(false);

  const stripePromise = loadStripe(window.stripePublishableKey ?? "");
  const oneHour = 1000 * 60 * 60;
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: oneHour,
        retryOnMount: false,
      },
    },
  });

  // TODO: link to terms of service
  const termsLabel = (
    <>I agree to the terms Certified Ubuntu Engineer (CUBE) service terms</>
  );
  const summary = () => <Summary product={product} />;
  const quantity = 1;

  console.log("!!! acountId: ", window.accountId);

  return (
    <div>
      <Button appearance={"positive"} onClick={() => setModalOpen(true)}>
        Purchase
      </Button>
      {modalOpen ? (
        <QueryClientProvider client={queryClient}>
          <Elements stripe={stripePromise}>
            <Modal
              className="p-modal--ua-payment"
              style={{ textAlign: "initial" }}
              close={closeHandler}
            >
              <PurchaseModal
                modalTitle="Complete purchase"
                marketplace="canonical-cube"
                termsLabel={termsLabel}
                isFreeTrialApplicable={false}
                product={product}
                quantity={quantity}
                closeModal={closeHandler}
                Summary={summary}
                BuyButton={BuyButton}
              />
            </Modal>
          </Elements>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      ) : null}
    </div>
  );
};

export default CubePurchase;
