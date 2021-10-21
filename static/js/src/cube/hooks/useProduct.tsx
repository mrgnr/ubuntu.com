import { useQuery, useQueryClient } from "react-query";

const useProduct = () => {
  const buyButton = document.querySelector("#buy-now-button");
  const queryClient = useQueryClient();

  function handleProductChange() {
    queryClient.invalidateQueries("product");
  }

  //observerSet prevents us from creating a new observer on each render
  if (!window.listenersSet) {
    const observer = new MutationObserver(handleProductChange);
    observer.observe(buyButton, {
      attributes: true,
    });
    buyButton.addEventListener("click", () => {
      const product = JSON.parse(buyButton.dataset.product);
    });
    window.listenersSet = true;
  }
  const { data } = useQuery("product", async () => {
    return {
      product: JSON.parse(buyButton.dataset.product),
    };
  });

  return {
    product: data?.product,
    isLoading: !data,
  };
};

export default useProduct;
