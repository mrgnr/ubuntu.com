import React from "react";
import { render, screen } from "@testing-library/react";
import "whatwg-fetch";
import MicrocertificationsTable from "./MicrocertificationsTable";
import useMicrocertsData from "../../hooks/useMicrocertsData";
import { server } from "../../../../../../tests/mocks/server";

const validStatuses = [
  "Enrolled",
  "Not Enrolled",
  "Passed",
  "Failed",
  "In Progress",
];

const App = () => {
  const { modules, studyLabs, isLoading, error } = useMicrocertsData();
  return (
    <MicrocertificationsTable
      modules={modules}
      studyLabs={studyLabs}
      isLoading={isLoading}
      error={error}
    />
  );
};

// Configure server for mocking endpoints
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("MicrocertificationsTable", () => {
  it("renders enrollment statuses", async () => {
    render(<App />);

    const statusCells = await screen.findAllByLabelText("Status");
    statusCells.forEach((statusCell, index) => {
      expect(statusCell).toHaveTextContent(validStatuses[index]);
    });
  });
});
