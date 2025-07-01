import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// 注册字体（可选，用于更好的中文支持）
// Font.register({
//   family: 'Roboto',
//   src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf'
// });

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

interface InvoicePDFProps {
  data: InvoiceData;
}

// 创建样式
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 3,
    borderBottomColor: "#2563eb",
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 10,
  },
  companyDetails: {
    fontSize: 9,
    color: "#666666",
    lineHeight: 1.4,
  },
  invoiceInfo: {
    alignItems: "flex-end",
  },
  invoiceTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333333",
  },
  invoiceDetails: {
    fontSize: 9,
    lineHeight: 1.4,
  },
  billTo: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2563eb",
  },
  clientInfo: {
    fontSize: 9,
    lineHeight: 1.4,
  },
  table: {
    marginBottom: 25,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#333333",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableCell: {
    fontSize: 9,
    color: "#333333",
  },
  descriptionCell: {
    flex: 3,
  },
  quantityCell: {
    flex: 1,
    textAlign: "center",
  },
  priceCell: {
    flex: 1,
    textAlign: "right",
  },
  amountCell: {
    flex: 1,
    textAlign: "right",
  },
  totalsContainer: {
    alignItems: "flex-end",
    marginBottom: 25,
  },
  totalsBox: {
    width: 200,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    fontSize: 9,
  },
  totalRowFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: "bold",
    borderTopWidth: 2,
    borderTopColor: "#e5e7eb",
    marginTop: 5,
  },
  paymentTerms: {
    marginBottom: 25,
  },
  paymentText: {
    fontSize: 9,
    color: "#666666",
    lineHeight: 1.4,
  },
  bankDetails: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: 5,
    padding: 15,
    marginBottom: 25,
  },
  bankInfo: {
    fontSize: 9,
    lineHeight: 1.4,
    marginBottom: 3,
  },
  footer: {
    textAlign: "center",
    fontSize: 8,
    color: "#9ca3af",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 15,
    lineHeight: 1.4,
  },
});

export function InvoicePDF({ data }: InvoicePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{data.companyName}</Text>
            <View style={styles.companyDetails}>
              <Text>{data.companyAddress}</Text>
              <Text>Phone: {data.companyPhone}</Text>
              <Text>Email: {data.companyEmail}</Text>
              <Text style={{ marginTop: 5, fontWeight: "bold" }}>
                ABN: {data.abn}
              </Text>
            </View>
          </View>
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <View style={styles.invoiceDetails}>
              <Text>Invoice #: {data.invoiceNumber}</Text>
              <Text>Date: {data.invoiceDate}</Text>
              <Text>Due Date: {data.dueDate}</Text>
            </View>
          </View>
        </View>

        {/* Bill To */}
        <View style={styles.billTo}>
          <Text style={styles.sectionTitle}>Bill To:</Text>
          <View style={styles.clientInfo}>
            <Text style={{ fontWeight: "bold" }}>{data.clientName}</Text>
            <Text>{data.clientAddress}</Text>
            <Text>{data.clientEmail}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.descriptionCell]}>
              Description
            </Text>
            <Text style={[styles.tableHeaderCell, styles.quantityCell]}>
              Qty
            </Text>
            <Text style={[styles.tableHeaderCell, styles.priceCell]}>
              Unit Price
            </Text>
            <Text style={[styles.tableHeaderCell, styles.amountCell]}>
              Amount
            </Text>
          </View>

          {/* Table Rows */}
          {data.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.descriptionCell]}>
                {item.description}
              </Text>
              <Text style={[styles.tableCell, styles.quantityCell]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableCell, styles.priceCell]}>
                ${item.unitPrice.toFixed(2)}
              </Text>
              <Text style={[styles.tableCell, styles.amountCell]}>
                ${item.amount.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text>Subtotal:</Text>
              <Text>${data.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text>GST (10%):</Text>
              <Text>${data.gst.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRowFinal}>
              <Text>Total (AUD):</Text>
              <Text>${data.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Terms */}
        <View style={styles.paymentTerms}>
          <Text style={styles.sectionTitle}>Payment Terms:</Text>
          <Text style={styles.paymentText}>{data.paymentTerms}</Text>
        </View>

        {/* Bank Details */}
        <View style={styles.bankDetails}>
          <Text style={styles.sectionTitle}>Bank Details:</Text>
          <Text style={styles.bankInfo}>
            Account Name: {data.bankDetails.accountName}
          </Text>
          <Text style={styles.bankInfo}>BSB: {data.bankDetails.bsb}</Text>
          <Text style={styles.bankInfo}>
            Account Number: {data.bankDetails.accountNumber}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            This invoice was generated electronically and is valid without
            signature.
          </Text>
          <Text>
            Please include the invoice number in your payment reference.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
