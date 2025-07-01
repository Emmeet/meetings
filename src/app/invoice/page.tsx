"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Download, Eye } from "lucide-react";
import { AustralianInvoice } from "@/components/AustralianInvoice";

// 示例发票数据
const sampleInvoiceData = {
  invoiceNumber: "INV-2024-001",
  invoiceDate: "2024-01-15",
  dueDate: "2024-02-14",
  abn: "12 345 678 901",
  companyName: "Your Business Name Pty Ltd",
  companyAddress: "123 Business Street, Sydney NSW 2000, Australia",
  companyPhone: "+61 2 1234 5678",
  companyEmail: "info@yourbusiness.com.au",
  clientName: "Client Company Pty Ltd",
  clientAddress: "456 Client Avenue, Melbourne VIC 3000, Australia",
  clientEmail: "accounts@clientcompany.com.au",
  items: [
    {
      description: "Web Development Services",
      quantity: 40,
      unitPrice: 150.0,
      amount: 6000.0,
    },
    {
      description: "UI/UX Design",
      quantity: 20,
      unitPrice: 120.0,
      amount: 2400.0,
    },
    {
      description: "Project Management",
      quantity: 10,
      unitPrice: 180.0,
      amount: 1800.0,
    },
  ],
  subtotal: 10200.0,
  gst: 1020.0,
  total: 11220.0,
  paymentTerms:
    "Payment is due within 30 days of invoice date. Late payments may incur additional charges.",
  bankDetails: {
    accountName: "Your Business Name Pty Ltd",
    bsb: "123-456",
    accountNumber: "12345678",
  },
};

export default function InvoicePage() {
  const [invoiceData, setInvoiceData] = useState(sampleInvoiceData);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const handleSendEmail = async () => {
    if (!recipientEmail) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/send-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceData,
          recipientEmail,
        }),
      });
      if (response.ok) {
        setRecipientEmail("");
      } else {
        throw new Error("发送失败");
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };
  const handleDownloadPDF = async () => {
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceData,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Invoice-${invoiceData.invoiceNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error("PDF生成失败");
      }
    } catch (error) {
    } finally {
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">澳洲标准发票系统</h1>

        {/* 控制面板 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>发票操作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button
                onClick={() => setShowPreview(!showPreview)}
                variant="outline"
              >
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? "隐藏预览" : "显示预览"}
              </Button>
              <Button onClick={handleDownloadPDF} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                下载PDF
              </Button>
            </div>

            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="email">收件人邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="client@example.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                />
              </div>
              <Button
                onClick={handleSendEmail}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Mail className="w-4 h-4 mr-2" />
                {isLoading ? "发送中..." : "发送邮件"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 发票预览 */}
      {showPreview && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <AustralianInvoice data={invoiceData} />
        </div>
      )}
    </div>
  );
}
