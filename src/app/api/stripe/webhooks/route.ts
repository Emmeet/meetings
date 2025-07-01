import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

async function savePaymentLog(content: string, type: number) {
  try {
    await prisma.payment_log.create({
      data: {
        content,
        type,
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

async function updateCustomerInfo(
  clientReferenceId: string,
  email: string,
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
      if (session.payment_link === (process.env.PAYMENT_LINK_id as string)) {
        console.log("报名费用处理");
        // 保存报名费用的支付日志
        await savePaymentLog(JSON.stringify(session), 1);

        // 获取客户信息
        const clientReferenceId = session.client_reference_id;
        const customerDetails: CustomerDetails = session.customer_details || {
          email: null,
          address: null,
        };
        const email = customerDetails.email || "";
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

        if (!attendeeName && clientReferenceId) {
          // 如果没有自定义字段中的姓名，从数据库中获取并组合姓名
          const customer = await prisma.customer_info.findUnique({
            where: {
              id: parseInt(clientReferenceId),
            },
          });
          if (customer) {
            const middleName = customer.middle_name
              ? ` ${customer.middle_name} `
              : " ";
            attendeeName = `${customer.first_name || ""}${middleName}${
              customer.last_name || ""
            }`;
          }
        }

        // 更新客户信息
        if (clientReferenceId && attendeeName) {
          await updateCustomerInfo(
            clientReferenceId,
            email,
            address,
            attendeeName
          );
        }
      }
      // 处理完成的结账会话
      break;
    // 添加其他你需要的事件类型
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
