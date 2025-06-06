# HFT微套利系统 - C5N实例迭代开发部署方案

## 硬件分析

### C5N实例规格
- **CPU**: 2vCPU (Intel Xeon Platinum)
- **内存**: 5.3GB RAM
- **网络**: 高达25Gbps网络性能
- **存储**: EBS优化，高IOPS
- **特点**: 计算优化，适合CPU密集型应用

### 资源分配策略

#### 内存分配 (5.3GB总量)
```
系统预留:     0.8GB  (15%)
应用主进程:   2.0GB  (38%)
PostgreSQL:   1.2GB  (23%)
Redis:        0.5GB  (9%)
Prometheus:   0.3GB  (6%)
Grafana:      0.2GB  (4%)
其他服务:     0.3GB  (5%)
```

#### CPU分配策略
```
应用主进程:   1.0 CPU (50%)
数据库:       0.6 CPU (30%)
监控服务:     0.2 CPU (10%)
系统预留:     0.2 CPU (10%)
```

## 多环境管理

### 环境配置

#### 1. 测试环境 (Testing)
```bash
# 配置文件: configs/.env.c5n.testing
# 特点: 保守参数，安全测试
TRADING_MODE=paper
MAX_POSITION_SIZE=0.001
RISK_LIMIT=0.02
API_ENDPOINT=testnet
```

#### 2. 预发布环境 (Staging)
```bash
# 配置文件: configs/.env.c5n.staging
# 特点: 接近生产，小额真实交易
TRADING_MODE=live
MAX_POSITION_SIZE=0.01
RISK_LIMIT=0.05
API_ENDPOINT=production
```

#### 3. 生产环境 (Production)
```bash
# 配置文件: configs/.env.c5n.production
# 特点: 完整功能，实际交易
TRADING_MODE=live
MAX_POSITION_SIZE=0.1
RISK_LIMIT=0.1
API_ENDPOINT=production
```

### 环境切换

```bash
# 切换到测试环境
.\deploy_c5n.bat --env=testing --mode=normal

# 切换到预发布环境
.\deploy_c5n.bat --env=staging --mode=rolling

# 切换到生产环境
.\deploy_c5n.bat --env=production --mode=rolling
```

## 热更新机制

### 1. 代码热重载 (开发模式)

```yaml
# docker-compose.c5n.yml 开发配置
app-dev:
  build:
    context: .
    target: development
  volumes:
    - ./src:/app/src:ro
    - ./config:/app/config:ro
  environment:
    - RUST_ENV=development
    - HOT_RELOAD=true
  command: cargo watch -x run
```

### 2. 配置热更新

```bash
# 更新配置不重启容器
docker exec hft-app-1 kill -HUP 1

# 或使用API热更新
curl -X POST http://localhost:8080/admin/reload-config
```

### 3. 滚动更新

```bash
# 零停机时间更新
.\deploy_c5n.bat --mode=rolling --version=v1.2.0
```

## 版本管理

### Git工作流

```bash
# 功能分支开发
git checkout -b feature/new-strategy
git commit -m "feat: 添加新的套利策略"
git push origin feature/new-strategy

# 合并到开发分支
git checkout develop
git merge feature/new-strategy

# 部署到测试环境
.\deploy_c5n.bat --env=testing --mode=dev
```

### 版本标签

```bash
# 创建版本标签
git tag -a v1.2.0 -m "版本 1.2.0: 新增多交易对支持"
git push origin v1.2.0

# 部署特定版本
.\deploy_c5n.bat --version=v1.2.0 --mode=rolling
```

## 快速迭代流程

### 1. 开发阶段

```bash
# 启动开发环境
.\deploy_c5n.bat --mode=dev

# 代码修改后自动重载
# 无需手动重启
```

### 2. 测试阶段

```bash
# 部署到测试环境
.\deploy_c5n.bat --env=testing --mode=normal

# 运行自动化测试
cargo test

# 性能测试
.\benchmark.bat
```

### 3. 发布阶段

```bash
# 预发布验证
.\deploy_c5n.bat --env=staging --mode=rolling

# 生产环境发布
.\deploy_c5n.bat --env=production --mode=rolling
```

## 监控与调试

### 实时监控

```bash
# 启动监控面板
.\monitor_c5n.bat

# 自定义监控间隔
.\monitor_c5n.bat --interval 3 --logs 50
```

### 性能分析

```bash
# CPU性能分析
docker exec hft-app-1 perf top

# 内存分析
docker exec hft-app-1 valgrind --tool=massif ./hft_client

# 网络分析
docker exec hft-app-1 ss -tuln
```

### 日志分析

```bash
# 实时日志
docker compose -f docker-compose.c5n.yml logs -f app

# 错误日志
docker compose -f docker-compose.c5n.yml logs app | grep ERROR

# 交易日志
curl http://localhost:8080/api/logs/trades
```

## 故障排除

### 常见问题

#### 1. 内存不足

```bash
# 检查内存使用
docker stats --no-stream

# 优化内存配置
# 编辑 docker-compose.c5n.yml
mem_limit: 2g
mem_reservation: 1.5g
```

#### 2. CPU使用率过高

```bash
# 检查CPU使用
top -p $(docker inspect --format '{{.State.Pid}}' hft-app-1)

# 调整CPU限制
cpus: '1.5'
```

#### 3. 网络连接问题

```bash
# 检查网络连接
telnet api.binance.com 443

# 检查DNS解析
nslookup api.binance.com

# 重启网络
docker network prune
```

### 回滚机制

```bash
# 快速回滚到上一版本
docker tag hft-app:latest hft-app:backup
docker tag hft-app:previous hft-app:latest
docker compose -f docker-compose.c5n.yml up -d app

# 或使用脚本回滚
.\deploy_c5n.bat --version=previous --mode=hotfix
```

## 性能优化

### C5N实例优化

#### 1. 网络优化

```yaml
# docker-compose.c5n.yml
networks:
  hft-network:
    driver: bridge
    driver_opts:
      com.docker.network.driver.mtu: 9000
      com.docker.network.bridge.enable_ip_masquerade: 'true'
```

#### 2. 存储优化

```yaml
volumes:
  postgres_data:
    driver: local
    driver_opts:
      type: tmpfs
      device: tmpfs
      o: size=1g,uid=999,gid=999
```

#### 3. 应用优化

```toml
# config.toml
[performance]
worker_threads = 2
max_blocking_threads = 4
thread_stack_size = "2MB"

[network]
connection_pool_size = 10
request_timeout = "5s"
keepalive_timeout = "30s"
```

## 安全配置

### 1. 网络安全

```yaml
# 限制网络访问
networks:
  hft-network:
    internal: true
  public:
    external: true
```

### 2. 容器安全

```yaml
security_opt:
  - no-new-privileges:true
read_only: true
user: "1000:1000"
```

### 3. 密钥管理

```bash
# 使用Docker secrets
echo "your_api_key" | docker secret create binance_api_key -
```

## 备份策略

### 1. 数据备份

```bash
# 数据库备份
docker exec hft-db-1 pg_dump -U hft_user hft_db > backup_$(date +%Y%m%d).sql

# 配置备份
cp -r configs/ backups/configs_$(date +%Y%m%d)/
```

### 2. 镜像备份

```bash
# 保存镜像
docker save hft-app:latest > hft-app-backup.tar

# 恢复镜像
docker load < hft-app-backup.tar
```

## 自动化脚本

### 1. 健康检查

```bash
# health_check.bat
@echo off
curl -f http://localhost:8080/health || (
    echo "应用异常，尝试重启"
    docker compose -f docker-compose.c5n.yml restart app
)
```

### 2. 自动部署

```bash
# auto_deploy.bat
@echo off
git pull origin main
if %errorlevel% equ 0 (
    .\deploy_c5n.bat --mode=rolling
)
```

### 3. 性能监控

```bash
# performance_alert.bat
@echo off
for /f %%i in ('docker stats --no-stream --format "{{.MemPerc}}" hft-app-1') do (
    if %%i gtr 80 (
        echo "内存使用率过高: %%i"
        REM 发送告警
    )
)
```

## 最佳实践

### 1. 开发流程

1. **本地开发**: 使用 `--mode=dev` 进行快速迭代
2. **功能测试**: 部署到 `testing` 环境验证
3. **集成测试**: 使用 `staging` 环境进行完整测试
4. **生产发布**: 通过 `rolling` 模式零停机部署

### 2. 监控策略

1. **实时监控**: 使用 `monitor_c5n.bat` 持续监控
2. **告警设置**: 配置内存、CPU、网络告警
3. **日志分析**: 定期分析错误和性能日志
4. **性能基准**: 建立性能基准线，监控性能退化

### 3. 风险控制

1. **渐进式部署**: 先小规模测试，再全量部署
2. **快速回滚**: 保持上一版本镜像，支持快速回滚
3. **资源限制**: 严格限制容器资源使用
4. **安全配置**: 最小权限原则，网络隔离

## 总结

这个迭代开发部署方案专为C5N实例优化，提供了：

- **快速迭代**: 支持热更新和快速部署
- **多环境管理**: 测试、预发布、生产环境隔离
- **性能优化**: 针对C5N实例的资源优化
- **监控完善**: 实时监控和告警机制
- **安全可靠**: 完整的备份和回滚机制

通过这套方案，可以在C5N实例上高效地进行HFT微套利系统的开发、测试和部署。