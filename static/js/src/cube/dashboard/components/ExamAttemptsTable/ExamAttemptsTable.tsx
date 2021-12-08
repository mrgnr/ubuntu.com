import React from "react";
import { Card, MainTable } from "@canonical/react-components";
import DownloadCSVButton from "../DownloadCSVButton";
import useExamAttempts from "../../hooks/useExamAttempts";

type Props = {
  courses: string[];
};

const ExamAttemptsTable = ({ courses }: Props) => {
  const { examAttempts, isLoading } = useExamAttempts({ courses });
  const rows = examAttempts ? examAttempts : [];

  return (
    <Card title="Exam attempts">
      <DownloadCSVButton data={rows} />
      <MainTable
        headers={[
          { content: "Course ID", sortKey: "course_id" },
          { content: "Start", sortKey: "started_at" },
          { content: "End", sortKey: "completed_at" },
          { content: "Status", sortKey: "status" },
          { content: "Username", sortKey: "username" },
        ]}
        rows={rows.map(
          ({ course_id, started_at, completed_at, status, username }) => ({
            columns: [
              { content: course_id },
              { content: started_at },
              { content: completed_at },
              { content: status },
              { content: username },
            ],
            sortData: {
              course_id: course_id,
              started_at: new Date(started_at),
              completed_at: new Date(completed_at),
              status: status,
              username: username,
            },
          })
        )}
        sortable
        paginate={20}
        emptyStateMsg={
          isLoading ? (
            <i className="p-icon--spinner u-animation--spin"></i>
          ) : (
            <i>No data could be fetched</i>
          )
        }
      />
    </Card>
  );
};

export default ExamAttemptsTable;
