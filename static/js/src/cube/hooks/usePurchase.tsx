import { useMutation } from "react-query";

import { postPurchaseData } from "../api/purchase";

export const usePurchase = () => {
  const product = useProduct();

  const mutation = useMutation(async () => {
    if (!product) {
      throw new Error("Product missing");
    }

    if (!window.accountId) {
      throw new Error("Account ID missing");
    }

    const res = await postPurchaseData(
      window.accountId,
      product.listingId,
      false
    );

    if (res.errors) {
      throw new Error(res.errors);
    }

    return res.id;
  });

  return mutation;
};
