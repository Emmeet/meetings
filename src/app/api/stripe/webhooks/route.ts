import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

async function savePaymentLog(
  content: string,
  type: number,
  customer_id: number
) {
  try {
    await prisma.payment_log.create({
      data: {
        content,
        type,
        customer_id,
        create_time: new Date(),
      },
    });
  } catch (error) {
    console.error("Error saving payment log:", error);
  }
}

interface StripeAddress {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
}

interface CustomerDetails {
  email: string | null;
  address: StripeAddress | null;
}

interface PaymentItem {
  name: string;
  amount: string;
  quantity: number;
}

interface InvoiceData {
  invoiceNumber: string;
  name: string;
  email: string | null;
  country: string;
  state: string;
  city: string;
  postalCode: string;
  addressLine1: string;
  addressLine2: string;
  payments: PaymentItem[];
  subTotal: string;
  tax: string;
  total: string;
}

async function updateCustomerInfo(
  clientReferenceId: string,
  address: StripeAddress,
  attendeeName: string
) {
  try {
    await prisma.customer_info.update({
      where: {
        id: parseInt(clientReferenceId),
      },
      data: {
        status: 1,
        line1: address.line1 || null,
        line2: address.line2 || null,
        city: address.city || null,
        state: address.state || null,
        postal_code: address.postal_code || null,
        country: address.country || null,
        attendee_name: attendeeName,
      },
    });
  } catch (error) {
    console.error("Error updating customer info:", error);
  }
}

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

  // 获取请求体和签名
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") || "";

  let event;
  try {
    // 验证 webhook 签名
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // 处理不同类型的 webhook 事件
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log("PaymentIntent succeeded:", paymentIntent.id);
      // 处理成功的支付
      break;
    case "checkout.session.completed":
      const session = event.data.object;
      console.log("Checkout session completed:", session.id);
      console.log("报名费用处理");

      // 获取客户信息
      const clientReferenceId = session.client_reference_id;

      const customerDetails: CustomerDetails = session.customer_details || {
        email: null,
        address: null,
      };
      const address = customerDetails.address || {};

      // 获取参会者姓名
      let attendeeName = "";
      if (
        session.custom_fields &&
        session.custom_fields.length > 0 &&
        session.custom_fields[0].text
      ) {
        // 如果有自定义字段，使用自定义字段中的姓名
        attendeeName = session.custom_fields[0].text.value || "";
      }

      if (clientReferenceId) {
        // 保存报名费用的支付日志
        await savePaymentLog(
          JSON.stringify(session),
          1,
          parseInt(clientReferenceId)
        );
        // 如果没有自定义字段中的姓名，从数据库中获取并组合姓名
        const customer = await prisma.customer_info.findUnique({
          where: {
            id: parseInt(clientReferenceId),
          },
        });
        if (customer) {
          // 更新客户信息
          await updateCustomerInfo(clientReferenceId, address, attendeeName);
          // 查询付款详情
          const lineItems = await stripe.checkout.sessions.listLineItems(
            session.id
          );
          // 计算总金额（以分为单位）
          let totalAmountInCents = 0;
          if (lineItems.data.length > 0) {
            lineItems.data.forEach((item) => {
              totalAmountInCents +=
                (item.amount_total || 0) * (item.quantity || 1);
            });
          }

          // 计算税前金额、税额和总金额
          const totalAmountInDollars = totalAmountInCents / 100;
          const subtotalInDollars = totalAmountInDollars / 1.1; // 从含税价格反推税前价格
          const taxInDollars = totalAmountInDollars - subtotalInDollars;

          // 格式化金额
          const formatCurrency = (amount: number) => {
            return new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(amount);
          };

          let invoiceData: InvoiceData = {
            invoiceNumber: clientReferenceId,
            name: `${customer.first_name}${
              customer.middle_name ? " " + customer.middle_name : ""
            } ${customer.last_name}`,
            email: customer.email,
            country: address.country || "",
            state: address.state || "",
            city: address.city || "",
            postalCode: address.postal_code || "",
            addressLine1: address.line1 || "",
            addressLine2: address.line2 || "",
            payments: [],
            subTotal: formatCurrency(subtotalInDollars),
            tax: formatCurrency(taxInDollars),
            total: formatCurrency(totalAmountInDollars),
          };

          if (lineItems.data.length > 0) {
            await savePaymentLog(
              JSON.stringify(lineItems),
              4,
              parseInt(clientReferenceId)
            );
            lineItems.data.forEach((item) => {
              // 将 Stripe 金额（以分为单位）转换为美元并格式化
              const amountInDollars = (item.amount_total || 0) / 100;
              const formattedAmount = formatCurrency(amountInDollars);

              invoiceData.payments.push({
                name: item.description || "",
                amount: formattedAmount,
                quantity: item.quantity || 0,
              });
            });
          }

          // 发送发票数据到邮件服务
          try {
            const response = await fetch(
              "https://email-service.anseninnov.au/send/invoice",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(invoiceData),
              }
            );

            if (!response.ok) {
              console.error(
                "Failed to send invoice:",
                response.status,
                response.statusText
              );
            } else {
              console.log("Invoice sent successfully");
            }
          } catch (error) {
            console.error("Error sending invoice:", error);
          }
        }
      }
      // 处理完成的结账会话
      break;
    // 添加其他你需要的事件类型
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true, status: 200 });
}
