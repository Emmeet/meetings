import InvitationLetterTable from "../component/InvitationLetterTable";

export default function CustomersPage() {
  return (
    <>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            AsiaCrypt 2025 - Visa Invitation Letter
          </h1>
        </div>
        <InvitationLetterTable />
      </div>
    </>
  );
}
