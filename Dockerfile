# 多阶段构建 - 针对C5N实例优化
FROM rust:1.75-slim as builder

# 安装必要的系统依赖
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY Cargo.toml Cargo.lock ./

# 创建虚拟源文件以缓存依赖
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release && rm -rf src

# 复制源代码
COPY src ./src

# 构建应用
RUN cargo build --release

# 运行时镜像
FROM debian:bookworm-slim

# 安装运行时依赖
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 创建应用用户
RUN useradd -r -s /bin/false hftuser

# 设置工作目录
WORKDIR /app

# 复制构建的二进制文件
COPY --from=builder /app/target/release/hft_client /app/hft_client

# 创建必要目录
RUN mkdir -p /app/logs /app/data /app/config && \
    chown -R hftuser:hftuser /app

# 设置环境变量
ENV RUST_LOG=info
ENV RUST_BACKTRACE=1

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# 切换到应用用户
USER hftuser

# 暴露端口
EXPOSE 8080

# 启动应用
CMD ["/app/hft_client"]