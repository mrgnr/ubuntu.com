import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import MicrocertificationsTable from "./components/MicrocertificationsTable";
import PrepareButton from "./components/PrepareButton";
import useMicrocertsData from "./hooks/useMicrocertsData";

const App = () => {
  const { modules, studyLabs, isLoading, error } = useMicrocertsData();

  useEffect(() => {
    ReactDOM.render(
      <PrepareButton
        studyLabURL={String(studyLabs["take_url"])}
        productName={String(studyLabs["name"])}
        productListingId={String(studyLabs["product_listing_id"])}
        isEnrolled={studyLabs["status"] === "enrolled"}
        buttonAppearance="positive"
      />,

      document.getElementById("prepare-button-react")
    );
  });

  return (
    <section className="p-strip">
      <div className="u-fixed-width">
        <h2>Microcertifications</h2>
        <MicrocertificationsTable
          modules={modules}
          studyLabs={studyLabs}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </section>
  );
};

ReactDOM.render(
  <App />,
  document.getElementById("micro-certification-table-app")
);
