import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { invoiceData } = await req.json();
  // 复用 AustralianInvoice 的所有样式和结构，直接拼接 HTML
  const html = `
    <div style="max-width:800px;margin:0 auto;padding:40px 20px;background-color:#ffffff;font-family:Arial,sans-serif;color:#333333;line-height:1.6;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;border-bottom:3px solid #2563eb;padding-bottom:20px;">
        <div style="flex:1;">
          <h1 style="font-size:28px;font-weight:bold;color:#2563eb;margin:0 0 15px 0;">${
            invoiceData.companyName
          }</h1>
          <div style="font-size:14px;color:#666666;line-height:1.5;">
            <p style="margin:0 0 5px 0;">${invoiceData.companyAddress}</p>
            <p style="margin:0 0 5px 0;">Phone: ${invoiceData.companyPhone}</p>
            <p style="margin:0 0 5px 0;">Email: ${invoiceData.companyEmail}</p>
            <p style="margin:10px 0 0 0;font-weight:bold;">ABN: ${
              invoiceData.abn
            }</p>
          </div>
        </div>
        <div style="text-align:right;">
          <h2 style="font-size:24px;font-weight:bold;margin:0 0 20px 0;color:#333333;">Tax Invoice</h2>
          <div style="font-size:14px;line-height:1.5;">
            <p style="margin:0 0 5px 0;"><strong>Invoice #:</strong> ${
              invoiceData.invoiceNumber
            }</p>
            <p style="margin:0 0 5px 0;"><strong>Date:</strong> ${
              invoiceData.invoiceDate
            }</p>
            <p style="margin:0 0 5px 0;"><strong>Due Date:</strong> ${
              invoiceData.dueDate
            }</p>
          </div>
        </div>
      </div>
      <div style="margin-bottom:30px;">
        <h3 style="font-size:18px;font-weight:bold;margin:0 0 15px 0;color:#2563eb;">Bill To:</h3>
        <div style="font-size:14px;line-height:1.5;">
          <p style="margin:0 0 5px 0;font-weight:bold;">${
            invoiceData.clientName
          }</p>
          <p style="margin:0 0 5px 0;">${invoiceData.clientAddress}</p>
          <p style="margin:0 0 5px 0;">${invoiceData.clientEmail}</p>
        </div>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:30px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
        <thead>
          <tr style="background-color:#f8fafc;">
            <th style="text-align:left;padding:15px;font-weight:bold;font-size:14px;border-bottom:1px solid #e5e7eb;">Description</th>
            <th style="text-align:center;padding:15px;font-weight:bold;font-size:14px;border-bottom:1px solid #e5e7eb;width:80px;">Qty</th>
            <th style="text-align:right;padding:15px;font-weight:bold;font-size:14px;border-bottom:1px solid #e5e7eb;width:100px;">Unit Price</th>
            <th style="text-align:right;padding:15px;font-weight:bold;font-size:14px;border-bottom:1px solid #e5e7eb;width:100px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoiceData.items
            .map(
              (item: any, index: number) => `
            <tr style="border-bottom:${
              index < invoiceData.items.length - 1
                ? "1px solid #f3f4f6"
                : "none"
            };">
              <td style="padding:15px;font-size:14px;">${item.description}</td>
              <td style="padding:15px;font-size:14px;text-align:center;">${
                item.quantity
              }</td>
              <td style="padding:15px;font-size:14px;text-align:right;">$${Number(
                item.unitPrice
              ).toFixed(2)}</td>
              <td style="padding:15px;font-size:14px;text-align:right;">$${Number(
                item.amount
              ).toFixed(2)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      <div style="display:flex;justify-content:flex-end;margin-bottom:30px;">
        <div style="width:300px;">
          <div style="display:flex;justify-content:space-between;padding:10px 0;font-size:14px;">
            <span>Subtotal:</span>
            <span>$${Number(invoiceData.subtotal).toFixed(2)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;font-size:14px;">
            <span>GST (10%):</span>
            <span>$${Number(invoiceData.gst).toFixed(2)}</span>
          </div>
          <div style="border-top:2px solid #e5e7eb;display:flex;justify-content:space-between;padding:15px 0 10px 0;font-size:18px;font-weight:bold;">
            <span>Total (AUD):</span>
            <span>$${Number(invoiceData.total).toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div style="margin-top:30px;font-size:14px;">
        <strong>Payment Terms:</strong> ${invoiceData.paymentTerms}
      </div>
      <div style="margin-top:20px;font-size:14px;">
        <strong>Bank Details:</strong><br/>
        Account Name: ${invoiceData.bankDetails.accountName}<br/>
        BSB: ${invoiceData.bankDetails.bsb}<br/>
        Account Number: ${invoiceData.bankDetails.accountNumber}
      </div>
    </div>
  `;
  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}
