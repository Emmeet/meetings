import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // 使用原始SQL查询来获取statistics视图的数据
    const statistics = await prisma.$queryRaw`
      SELECT
        customer_info.id AS \`Invoice ID\`,
        customer_info.title AS \`Title\`,
        customer_info.first_name AS \`First name\`,
        customer_info.middle_name AS \`Middle name\`,
        customer_info.last_name AS \`Last name\`,
        customer_info.attendee_name AS \`Attendee Name\`,
        customer_info.email AS \`Email\`,
        customer_info.affiliation AS \`Affiliation\`,
        CASE
          WHEN customer_info.type = 1 THEN 'Paper Author Registration'
          WHEN customer_info.type = 2 THEN 'Poster Author Registration'
          WHEN customer_info.type = 3 THEN 'Student Registration'
          WHEN customer_info.type = 4 THEN 'Regular Registration'
          ELSE 'N/A'
        END AS \`Registration Type\`,
        CASE
          WHEN customer_info.type = 1 THEN 'Paper ID & Title'
          WHEN customer_info.type = 2 THEN 'Poster ID & Title (to be entered by the poster author)'
          WHEN customer_info.type = 3 THEN 'Student ID'
          ELSE NULL
        END AS \`Identifier Type\`,
        customer_info.paper_number AS \`Identifier Number\`,
        CASE
          WHEN customer_info.status = 1 THEN 'Paid'
          WHEN customer_info.status = 0 THEN 'Unpaid'
          ELSE 'N/A'
        END AS \`Payment Status\`,
        CONCAT_WS(', ',
          NULLIF(customer_info.line1, ''),
          NULLIF(customer_info.line2, ''),
          NULLIF(customer_info.city, ''),
          NULLIF(customer_info.state, ''),
          NULLIF(customer_info.postal_code, ''),
          NULLIF(customer_info.country, '')
        ) AS \`Address\`,
        customer_info.dietary_requirements AS \`Dietary requirements\`,
        DATE_FORMAT(STR_TO_DATE(customer_info.create_date, '%Y-%m-%d'), '%d/%m/%Y') AS \`Created at\`
      FROM customer_info
      ORDER BY customer_info.create_date DESC
    `;

    // 转换BigInt为字符串以避免序列化错误
    const convertedData = JSON.parse(
      JSON.stringify(statistics, (_key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    return NextResponse.json({
      data: convertedData,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching export data:", error);
    return NextResponse.json(
      { error: "Error fetching export data", success: false },
      { status: 500 }
    );
  }
}
