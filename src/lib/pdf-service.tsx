import React from "react";
import { pdf } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/InvoicePDF";

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
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
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

export class PDFService {
  private static instance: PDFService;

  private constructor() {}

  static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  async generateInvoicePDF(invoiceData: InvoiceData): Promise<Buffer> {
    try {
      // 传递JSX组件，确保类型正确
      const pdfDoc = pdf(<InvoicePDF data={invoiceData} />);
      const pdfBuffer = await pdfDoc.toBuffer();
      return pdfBuffer;
    } catch (error) {
      console.error("PDF生成错误:", error);
      throw new Error(
        `PDF生成失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  }

  // 生成PDF流（用于直接响应）
  async generateInvoicePDFStream(
    invoiceData: InvoiceData
  ): Promise<NodeJS.ReadableStream> {
    try {
      const pdfDoc = pdf(<InvoicePDF data={invoiceData} />);
      return pdfDoc.toBuffer();
    } catch (error) {
      console.error("PDF流生成错误:", error);
      throw new Error(
        `PDF流生成失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  }

  // 获取PDF的Blob URL（用于前端预览）
  async generateInvoicePDFBlob(invoiceData: InvoiceData): Promise<Blob> {
    try {
      const pdfDoc = pdf(<InvoicePDF data={invoiceData} />);
      return await pdfDoc.toBlob();
    } catch (error) {
      console.error("PDF Blob生成错误:", error);
      throw new Error(
        `PDF Blob生成失败: ${
          error instanceof Error ? error.message : "未知错误"
        }`
      );
    }
  }

  // 清理资源（@react-pdf/renderer不需要特殊清理）
  async closeBrowser(): Promise<void> {
    // @react-pdf/renderer不需要关闭浏览器
    return Promise.resolve();
  }
}

// 导出单例实例
export const pdfService = PDFService.getInstance();
