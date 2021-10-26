import React from "react";
import { Row, Col } from "@canonical/react-components";
import usePreview from "../../hooks/usePreview";

type Props = {
  productName: string;
  productListingId: string;
};

const Summary = ({ productName, productListingId }: Props) => {
  const { data: preview } = usePreview(productListingId);
  console.log("!!! preview: ", preview);

  return (
    <>
      <section
        id="summary-section"
        className="p-strip is-shallow u-no-padding--top"
      >
        <Row className="u-no-padding u-sv1">
          <Col size={4}>
            <div className="u-text-light">Product:</div>
          </Col>
          <Col size={8}>
            <div>CUBE - Microcertification ({productName})</div>
          </Col>
        </Row>
        <Row className="u-no-padding u-sv1">
          <Col size={4}>
            <div className="u-text-light">Subtotal:</div>
          </Col>
          <Col size={8}>
            <div>$100</div>
          </Col>
        </Row>
      </section>
    </>
  );
};

export default Summary;
