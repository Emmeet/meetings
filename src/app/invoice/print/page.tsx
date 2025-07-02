import { AustralianInvoice } from "@/components/AustralianInvoice";

export default function PrintInvoicePage({
  searchParams,
}: {
  searchParams: any;
}) {
  const data = searchParams.data ? JSON.parse(searchParams.data) : null;
  if (!data) return <div>No data</div>;
  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <AustralianInvoice data={data} />
    </div>
  );
}
