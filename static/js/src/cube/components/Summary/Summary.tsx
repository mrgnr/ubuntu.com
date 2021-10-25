import React from "react";
import { Row, Col } from "@canonical/react-components";

type Props = {
  product: string;
};

const Summary = ({ product }: Props) => {
  // TODO: use purchase preview

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
            <div>CUBE - Microcertification ({product})</div>
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
