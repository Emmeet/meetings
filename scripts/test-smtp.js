// SMTP连接测试脚本
const nodemailer = require("nodemailer");
require("dotenv").config({ path: ".env" });

async function testSMTPConnection() {
  console.log("🔍 测试SMTP连接...");

  // 检查环境变量
  const requiredEnvVars = ["SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD"];
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.error("❌ 缺少必要的环境变量:", missingVars.join(", "));
    console.log("请在 .env.local 文件中配置这些变量");
    return;
  }

  try {
    // 创建传输器
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // 验证连接
    await transporter.verify();
    console.log("✅ SMTP连接成功!");
    console.log(
      `📧 邮件服务器: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`
    );
    console.log(`👤 用户: ${process.env.SMTP_USER}`);
  } catch (error) {
    console.error("❌ SMTP连接失败:", error);
    console.log("\n🔧 常见解决方案:");
    console.log("1. 检查SMTP服务器地址和端口");
    console.log("2. 确认用户名和密码正确");
    console.log("3. 如果使用Gmail，确保使用应用专用密码");
    console.log("4. 检查防火墙设置");
  }
}

testSMTPConnection();
