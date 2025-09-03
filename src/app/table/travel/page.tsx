import StudentTravelTable from "../component/StudentTravelTable";

export default function Page() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          AsiaCrypt 2025 - Student Travel Stipend Request
        </h1>
      </div>
      <StudentTravelTable />
    </div>
  );
}
