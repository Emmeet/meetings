import { type NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";
import { AustralianInvoice } from "@/components/AustralianInvoice";
import nodemailer from "nodemailer";
import { pdfService } from "@/lib/pdf-service";

// 创建SMTP传输器
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number.parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

export async function POST(request: NextRequest) {
  try {
    const { invoiceData, recipientEmail } = await request.json();

    // 验证必要的环境变量
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASSWORD
    ) {
      return NextResponse.json(
        { error: "SMTP配置不完整，请检查环境变量" },
        { status: 500 }
      );
    }

    // 将React组件渲染为HTML
    const emailHtml = render(AustralianInvoice({ data: invoiceData }));

    // 创建传输器
    const transporter = createTransporter();

    // 验证SMTP连接
    try {
      await transporter.verify();
    } catch (error) {
      console.error("SMTP连接验证失败:", error);
      return NextResponse.json(
        { error: "SMTP服务器��接失败" },
        { status: 500 }
      );
    }

    // 邮件选项
    const mailOptions = {
      from: {
        name: invoiceData.companyName,
        address: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
      },
      to: recipientEmail,
      subject: `Invoice ${invoiceData.invoiceNumber} from ${invoiceData.companyName}`,
      html: emailHtml,
      text: `Please find attached invoice ${
        invoiceData.invoiceNumber
      } for ${invoiceData.total.toFixed(2)} AUD.`, // 纯文本版本
      // attachments: [
      //   {
      //     filename: `Invoice-${invoiceData.invoiceNumber}.pdf`,
      //     content: pdfBuffer,
      //     contentType: "application/pdf",
      //   },
      // ],
    };

    // 发送邮件
    const info = await transporter.sendMail(mailOptions);

    console.log("邮件发送成功:", info.messageId);

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      response: info.response,
    });
  } catch (error) {
    console.error("邮件发送错误:", error);
    return NextResponse.json(
      {
        error: "邮件发送失败",
        details: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 }
    );
  }
}
