# HFT微套利系统 - C5N实例优化版

## 项目简介

这是一个高频交易(HFT)微套利系统，专门针对AWS C5N实例(2vCPU, 5.3GB RAM)进行了优化。系统支持快速迭代开发、热更新部署，并提供完整的监控和管理工具。

## 主要特性

- 🚀 **高性能**: 基于Rust开发，支持SIMD优化和内存池管理
- 📊 **实时监控**: 集成Prometheus + Grafana监控系统
- 🔄 **热更新**: 支持配置热更新和滚动部署
- 🛡️ **风险控制**: 内置多层风险控制机制
- 📈 **多策略**: 支持订单簿不平衡、价差套利等多种策略
- 🐳 **容器化**: 完整的Docker部署方案

## 快速开始

### 环境要求

- Docker & Docker Compose
- 2vCPU + 5.3GB RAM (推荐C5N实例)
- Binance API密钥

### 一键部署

1. **克隆仓库**
```bash
git clone https://github.com/NexaQuant/HFT-MicroArbitrage-C5N.git
cd HFT-MicroArbitrage-C5N
```

2. **配置环境变量**
```bash
# 复制配置模板
cp configs/.env.c5n.testing .env
# 编辑.env文件，填入你的API密钥
vim .env
```

3. **启动系统**
```bash
# Windows
.\deploy_c5n.bat testing

# Linux/Mac
./start.sh
```

### 监控系统

部署完成后，可以通过以下地址访问监控界面：

- **Grafana监控面板**: http://localhost:3000 (admin/admin)
- **Prometheus指标**: http://localhost:9090
- **应用健康检查**: http://localhost:8080/health

## 部署选项

### 1. 测试环境部署
```bash
.\deploy_c5n.bat testing
```

### 2. 生产环境部署
```bash
.\deploy_c5n.bat production
```

### 3. 开发环境部署
```bash
.\deploy_c5n.bat dev
```

### 4. 热更新部署
```bash
.\deploy_c5n.bat hotfix
```

## 配置文件说明

- `configs/.env.c5n.testing` - C5N测试环境配置
- `docker-compose.c5n.yml` - C5N优化的Docker配置
- `config.simple.toml` - 简化的应用配置
- `docs/deploy_iterative.md` - 详细的迭代部署指南

## 监控和管理

### 实时监控
```bash
.\monitor_c5n.bat
```

### 查看日志
```bash
docker-compose logs -f app
```

### 故障排除
```bash
.\troubleshoot.bat
```

## 项目结构

```
├── src/                    # 源代码
│   ├── main.rs            # 主程序入口
│   ├── strategies/        # 交易策略
│   ├── order_book/        # 订单簿管理
│   └── binance_websocket/ # Binance WebSocket客户端
├── configs/               # 配置文件
├── monitoring/            # 监控配置
├── deploy_c5n.bat        # C5N部署脚本
├── monitor_c5n.bat       # C5N监控脚本
└── docker-compose.c5n.yml # C5N Docker配置
```

## 交易策略

1. **订单簿不平衡策略** - 基于买卖盘不平衡进行交易
2. **价差套利策略** - 利用价差进行套利
3. **成交量异常策略** - 基于成交量异常信号
4. **跟随交易策略** - 跟随大单交易

## 风险控制

- 最大持仓限制
- 单笔交易金额限制
- 日损失限制
- 实时风险监控

## 性能优化

### C5N实例优化
- 内存使用优化 (< 4GB)
- CPU使用优化 (< 80%)
- 网络优化 (利用C5N高网络性能)
- 存储优化 (SSD缓存策略)

### 代码优化
- SIMD指令优化
- 内存池管理
- 异步I/O优化
- 零拷贝数据处理

## 开发指南

### 本地开发
```bash
# 安装依赖
cargo build

# 运行测试
cargo test

# 性能测试
cargo bench
```

### 添加新策略
1. 在`src/strategies/`目录下创建新策略文件
2. 实现`Strategy` trait
3. 在`main.rs`中注册策略
4. 更新配置文件

## 故障排除

### 常见问题

1. **内存不足**
   - 检查Docker内存限制
   - 调整配置中的缓存大小

2. **API连接失败**
   - 检查API密钥配置
   - 验证网络连接

3. **性能问题**
   - 查看Grafana监控面板
   - 检查CPU和内存使用率

### 日志分析
```bash
# 查看应用日志
docker-compose logs app

# 查看数据库日志
docker-compose logs db

# 查看Redis日志
docker-compose logs redis
```

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

- 项目链接: [https://github.com/NexaQuant/HFT-MicroArbitrage-C5N](https://github.com/NexaQuant/HFT-MicroArbitrage-C5N)
- 问题反馈: [Issues](https://github.com/NexaQuant/HFT-MicroArbitrage-C5N/issues)

## 更新日志

### v0.1.1 (2024-12-06)
- 修正配置文件路径错误
- 更新快速开始指南
- 完善项目结构说明

### v0.1.0 (2024-12-06)
- 初始版本发布
- C5N实例优化
- 基础交易策略实现
- 监控系统集成
- 一键部署脚本