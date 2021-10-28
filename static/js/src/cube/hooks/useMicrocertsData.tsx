import { useEffect, useState } from "react";

const useMicrocertsData = () => {
  const [modules, setModules] = useState([]);
  const [studyLabs, setStudyLabs] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getModules = async () => {
      try {
        const queryString = window.location.search;
        const response = await fetch(`/cube/microcerts.json${queryString}`);

        if (response.status === 200) {
          const responseJson = await response.json();
          const { study_labs_listing: studyLabs } = responseJson;
          let { modules } = responseJson;
          modules = modules.map((module: Record<string, unknown>) => ({
            name: module["name"],
            badgeURL: module["badge-url"],
            topics: module["topics"],
            studyLabURL: module["study_lab_url"],
            takeURL: module["take_url"],
            status: module["status"],
            productListingId: module["product_listing_id"],
          }));

          setModules(modules);
          setStudyLabs(studyLabs);
        }
      } catch {
        const errorMessage = "An error occurred while loading the microcerts";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    getModules();
  }, []);

  return { modules, studyLabs, isLoading, error };
};

export default useMicrocertsData;
