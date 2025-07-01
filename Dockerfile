# 使用 Node.js 20 LTS 作为基础镜像
FROM node:20-alpine AS deps
# 添加必要的系统包
RUN apk add --no-cache libc6-compat

WORKDIR /app

# 复制 package 相关文件
COPY package.json package-lock.json* ./
# 仅安装生产依赖
RUN npm install -g pnpm

RUN pnpm install

# 构建阶段
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 设置环境变量为生产环境
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# 构建应用
RUN npm run build

# 生产阶段
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制必要文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 设置正确的权限
RUN chown -R nextjs:nodejs /app

USER nextjs

# 暴露端口 4500
EXPOSE 4500

ENV PORT 4500
ENV HOSTNAME "0.0.0.0"

# 启动命令
CMD ["node", "server.js"]