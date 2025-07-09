FROM node:22-alpine3.19 AS base
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

WORKDIR /app

# 只复制依赖相关文件，提升缓存利用率
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/

# 安装所有依赖（包括devDependencies，保证prisma可用）
RUN pnpm install --frozen-lockfile

# 复制全部源代码
COPY . .

# 声明构建参数
ARG NEXT_PUBLIC_STRIPE_POST_PAYMENT_LINK1
ARG NEXT_PUBLIC_STRIPE_POST_PAYMENT_LINK2
ARG NEXT_PUBLIC_STRIPE_PAPER_PAYMENT_LINK1
ARG NEXT_PUBLIC_STRIPE_PAPER_PAYMENT_LINK2
ARG NEXT_PUBLIC_STRIPE_STUDENT_PAYMENT_LINK1
ARG NEXT_PUBLIC_STRIPE_STUDENT_PAYMENT_LINK2

# 设置环境变量（让 Next.js 构建时可用）
ENV NEXT_PUBLIC_STRIPE_POST_PAYMENT_LINK1=$NEXT_PUBLIC_STRIPE_POST_PAYMENT_LINK1
ENV NEXT_PUBLIC_STRIPE_POST_PAYMENT_LINK2=$NEXT_PUBLIC_STRIPE_POST_PAYMENT_LINK2
ENV NEXT_PUBLIC_STRIPE_PAPER_PAYMENT_LINK1=$NEXT_PUBLIC_STRIPE_PAPER_PAYMENT_LINK1
ENV NEXT_PUBLIC_STRIPE_PAPER_PAYMENT_LINK2=$NEXT_PUBLIC_STRIPE_PAPER_PAYMENT_LINK2
ENV NEXT_PUBLIC_STRIPE_STUDENT_PAYMENT_LINK1=$NEXT_PUBLIC_STRIPE_STUDENT_PAYMENT_LINK1
ENV NEXT_PUBLIC_STRIPE_STUDENT_PAYMENT_LINK2=$NEXT_PUBLIC_STRIPE_STUDENT_PAYMENT_LINK2


# 生成 Prisma 客户端
RUN pnpm exec prisma generate

# 构建应用
RUN pnpm run build

# 生产镜像
FROM node:22-alpine3.19 AS runner
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

WORKDIR /app

ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 只复制生产依赖
COPY --from=base /app/node_modules ./node_modules
# 复制构建产物和必要文件
COPY --from=base /app/public ./public
RUN mkdir .next
RUN chown nextjs:nodejs .next
COPY --from=base --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=base --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=base /app/prisma ./prisma

USER nextjs

EXPOSE 4000
ENV PORT 4000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]