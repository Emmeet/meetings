import CustomerTable from "../raid/components/CustomerTable";

export default function CustomersPage() {
  return (
    <>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Customer Information Management
          </h1>
        </div>
        <CustomerTable />
      </div>
    </>
  );
}
