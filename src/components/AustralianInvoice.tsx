interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  abn: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  items: InvoiceItem[];
  subtotal: number;
  gst: number;
  total: number;
  paymentTerms: string;
  bankDetails: {
    accountName: string;
    bsb: string;
    accountNumber: string;
  };
}

interface EmailInvoiceProps {
  data: InvoiceData;
}

export function AustralianInvoice({ data }: EmailInvoiceProps) {
  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "40px 20px",
        backgroundColor: "#ffffff",
        fontFamily: "Arial, sans-serif",
        color: "#333333",
        lineHeight: "1.6",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "40px",
          borderBottom: "3px solid #2563eb",
          paddingBottom: "20px",
        }}
      >
        <div style={{ flex: "1" }}>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#2563eb",
              margin: "0 0 15px 0",
            }}
          >
            {data.companyName}
          </h1>
          <div
            style={{ fontSize: "14px", color: "#666666", lineHeight: "1.5" }}
          >
            <p style={{ margin: "0 0 5px 0" }}>{data.companyAddress}</p>
            <p style={{ margin: "0 0 5px 0" }}>Phone: {data.companyPhone}</p>
            <p style={{ margin: "0 0 5px 0" }}>Email: {data.companyEmail}</p>
            <p style={{ margin: "10px 0 0 0", fontWeight: "bold" }}>
              ABN: {data.abn}
            </p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              margin: "0 0 20px 0",
              color: "#333333",
            }}
          >
            Tax Invoice
          </h2>
          <div style={{ fontSize: "14px", lineHeight: "1.5" }}>
            <p style={{ margin: "0 0 5px 0" }}>
              <strong>Invoice #:</strong> {data.invoiceNumber}
            </p>
            <p style={{ margin: "0 0 5px 0" }}>
              <strong>Date:</strong> {data.invoiceDate}
            </p>
            <p style={{ margin: "0 0 5px 0" }}>
              <strong>Due Date:</strong> {data.dueDate}
            </p>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div style={{ marginBottom: "30px" }}>
        <h3
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            margin: "0 0 15px 0",
            color: "#2563eb",
          }}
        >
          Bill To:
        </h3>
        <div style={{ fontSize: "14px", lineHeight: "1.5" }}>
          <p style={{ margin: "0 0 5px 0", fontWeight: "bold" }}>
            {data.clientName}
          </p>
          <p style={{ margin: "0 0 5px 0" }}>{data.clientAddress}</p>
          <p style={{ margin: "0 0 5px 0" }}>{data.clientEmail}</p>
        </div>
      </div>

      {/* Items Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "30px",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f8fafc" }}>
            <th
              style={{
                textAlign: "left",
                padding: "15px",
                fontWeight: "bold",
                fontSize: "14px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              Description
            </th>
            <th
              style={{
                textAlign: "center",
                padding: "15px",
                fontWeight: "bold",
                fontSize: "14px",
                borderBottom: "1px solid #e5e7eb",
                width: "80px",
              }}
            >
              Qty
            </th>
            <th
              style={{
                textAlign: "right",
                padding: "15px",
                fontWeight: "bold",
                fontSize: "14px",
                borderBottom: "1px solid #e5e7eb",
                width: "100px",
              }}
            >
              Unit Price
            </th>
            <th
              style={{
                textAlign: "right",
                padding: "15px",
                fontWeight: "bold",
                fontSize: "14px",
                borderBottom: "1px solid #e5e7eb",
                width: "100px",
              }}
            >
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr
              key={index}
              style={{
                borderBottom:
                  index < data.items.length - 1 ? "1px solid #f3f4f6" : "none",
              }}
            >
              <td style={{ padding: "15px", fontSize: "14px" }}>
                {item.description}
              </td>
              <td
                style={{
                  padding: "15px",
                  fontSize: "14px",
                  textAlign: "center",
                }}
              >
                {item.quantity}
              </td>
              <td
                style={{
                  padding: "15px",
                  fontSize: "14px",
                  textAlign: "right",
                }}
              >
                ${item.unitPrice.toFixed(2)}
              </td>
              <td
                style={{
                  padding: "15px",
                  fontSize: "14px",
                  textAlign: "right",
                }}
              >
                ${item.amount.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "30px",
        }}
      >
        <div style={{ width: "300px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              fontSize: "14px",
            }}
          >
            <span>Subtotal:</span>
            <span>${data.subtotal.toFixed(2)}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              fontSize: "14px",
            }}
          >
            <span>GST (10%):</span>
            <span>${data.gst.toFixed(2)}</span>
          </div>
          <div
            style={{
              borderTop: "2px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              padding: "15px 0 10px 0",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            <span>Total (AUD):</span>
            <span>${data.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
