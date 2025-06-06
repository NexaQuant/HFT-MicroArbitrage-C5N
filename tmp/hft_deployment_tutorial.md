# HFT微套利系统 - 编程小白保姆级部署教程

## 🎯 部署目标
在你的Ubuntu服务器(IP: 52.69.119.217)上部署HFT微套利交易系统

## 📋 准备工作检查清单

### 必需信息
- [ ] 服务器IP地址: 52.69.119.217 ✅
- [ ] 币安API密钥 (需要你自己申请)
- [ ] 币安API秘钥 (需要你自己申请)
- [ ] SSH连接工具 (如PuTTY、Terminal等)

### 申请币安API密钥步骤
1. 登录币安官网 (binance.com)
2. 进入「API管理」页面
3. 创建新的API密钥
4. **重要**: 只勾选「现货交易」权限，不要勾选「提现」权限
5. 记录下API Key和Secret Key

---

## 🚀 第一步：连接到服务器

### 在你的电脑上打开终端

**Windows用户:**
- 按 `Win + R` 键
- 输入 `cmd` 然后按回车
- 在黑色窗口中输入以下命令:

```bash
ssh root@52.69.119.217
```

**Mac/Linux用户:**
- 按 `Cmd + 空格` (Mac) 或 `Ctrl + Alt + T` (Linux)
- 在终端中输入:

```bash
ssh root@52.69.119.217
```

### 如果连接失败
- 检查网络连接
- 确认服务器IP地址正确
- 联系服务器提供商确认SSH访问权限

---

## 🔧 第二步：安装必要软件

### 2.1 更新系统 (在服务器终端中输入)

```bash
# 更新软件包列表
sudo apt update

# 升级已安装的软件包
sudo apt upgrade -y
```

**等待时间**: 大约3-5分钟

### 2.2 安装Docker (容器管理工具)

```bash
# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 启动Docker服务
sudo systemctl start docker
sudo systemctl enable docker

# 验证Docker安装
docker --version
```

**预期输出**: 应该显示类似 `Docker version 24.0.x`

### 2.3 安装Docker Compose (多容器管理工具)

```bash
# 下载Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 设置执行权限
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker-compose --version
```

**预期输出**: 应该显示类似 `Docker Compose version v2.x.x`

### 2.4 安装Git (代码下载工具)

```bash
# 安装Git
sudo apt install git -y

# 验证安装
git --version
```

**预期输出**: 应该显示类似 `git version 2.x.x`

---

## 📥 第三步：下载项目代码

### 3.1 创建工作目录

```bash
# 进入用户主目录
cd ~

# 创建项目目录
mkdir -p /home/hft-trading
cd /home/hft-trading

# 确认当前位置
pwd
```

**预期输出**: `/home/hft-trading`

### 3.2 下载项目代码

```bash
# 下载代码
git clone https://github.com/NexaQuant/HFT-MicroArbitrage-C5N.git

# 进入项目目录
cd HFT-MicroArbitrage-C5N

# 查看项目文件
ls -la
```

**预期输出**: 应该看到很多文件，包括 `Dockerfile`, `docker-compose.c5n.yml` 等

---

## ⚙️ 第四步：配置交易参数

### 4.1 复制配置文件模板

```bash
# 确保在项目目录中
cd /home/hft-trading/HFT-MicroArbitrage-C5N

# 复制配置文件
cp configs/.env.c5n.testing .env

# 查看配置文件
cat .env
```

### 4.2 编辑配置文件 (重要步骤)

```bash
# 使用nano编辑器打开配置文件
nano .env
```

**在编辑器中修改以下内容:**

找到这些行并修改:
```
BINANCE_API_KEY=your_api_key_here
BINANCE_API_SECRET=your_api_secret_here
```

改为:
```
BINANCE_API_KEY=你的实际API密钥
BINANCE_API_SECRET=你的实际API秘钥
```

**保存文件的方法:**
1. 按 `Ctrl + X`
2. 按 `Y` (确认保存)
3. 按 `Enter` (确认文件名)

### 4.3 验证配置

```bash
# 检查配置是否正确
grep "BINANCE_API" .env
```

**预期输出**: 应该显示你刚才设置的API密钥 (部分隐藏)

---

## 🚀 第五步：启动系统

### 5.1 构建和启动容器

```bash
# 确保在正确目录
cd /home/hft-trading/HFT-MicroArbitrage-C5N

# 启动系统 (第一次会比较慢，需要下载很多东西)
docker-compose -f docker-compose.c5n.yml up -d
```

**等待时间**: 第一次启动大约需要10-15分钟

### 5.2 检查启动状态

```bash
# 查看容器状态
docker-compose -f docker-compose.c5n.yml ps
```

**预期输出**: 所有容器的状态都应该是 `Up` 或 `running`

### 5.3 查看日志 (确认系统正常运行)

```bash
# 查看应用日志
docker-compose -f docker-compose.c5n.yml logs app
```

**正常输出应该包含:**
- "Application started successfully"
- "Connected to Binance API"
- "WebSocket connection established"

---

## 📊 第六步：访问监控界面

### 6.1 检查服务是否运行

```bash
# 检查端口是否开放
ss -tlnp | grep :3000
ss -tlnp | grep :9090
```

### 6.2 在浏览器中访问

**Grafana监控面板:**
- 地址: `http://52.69.119.217:3000`
- 用户名: `admin`
- 密码: `admin123`

**Prometheus指标:**
- 地址: `http://52.69.119.217:9090`

**如果无法访问:**
1. 检查防火墙设置
2. 确认容器正在运行
3. 联系服务器提供商开放端口

---

## 🔍 第七步：验证系统运行

### 7.1 检查交易连接

```bash
# 查看实时日志
docker-compose -f docker-compose.c5n.yml logs -f app
```

**按 `Ctrl + C` 退出日志查看**

### 7.2 检查系统健康状态

```bash
# 检查应用健康状态
curl http://localhost:8080/health
```

**预期输出**: `{"status":"healthy"}`

### 7.3 查看系统资源使用

```bash
# 查看容器资源使用情况
docker stats --no-stream
```

---

## 🛠️ 日常管理命令

### 启动系统
```bash
cd /home/hft-trading/HFT-MicroArbitrage-C5N
docker-compose -f docker-compose.c5n.yml up -d
```

### 停止系统
```bash
cd /home/hft-trading/HFT-MicroArbitrage-C5N
docker-compose -f docker-compose.c5n.yml down
```

### 重启系统
```bash
cd /home/hft-trading/HFT-MicroArbitrage-C5N
docker-compose -f docker-compose.c5n.yml restart
```

### 查看日志
```bash
cd /home/hft-trading/HFT-MicroArbitrage-C5N
docker-compose -f docker-compose.c5n.yml logs -f app
```

### 更新系统
```bash
cd /home/hft-trading/HFT-MicroArbitrage-C5N
git pull
docker-compose -f docker-compose.c5n.yml down
docker-compose -f docker-compose.c5n.yml up -d --build
```

---

## 🚨 紧急回退方案

### 如果系统出现问题

#### 方案1: 重启所有服务
```bash
cd /home/hft-trading/HFT-MicroArbitrage-C5N
docker-compose -f docker-compose.c5n.yml down
docker-compose -f docker-compose.c5n.yml up -d
```

#### 方案2: 完全重置
```bash
cd /home/hft-trading/HFT-MicroArbitrage-C5N
docker-compose -f docker-compose.c5n.yml down -v
docker system prune -f
docker-compose -f docker-compose.c5n.yml up -d
```

#### 方案3: 恢复到初始状态
```bash
# 停止所有容器
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)

# 删除项目目录
rm -rf /home/hft-trading

# 重新开始部署 (从第三步开始)
```

### 如果API连接失败
1. 检查API密钥是否正确
2. 确认币安账户状态正常
3. 检查网络连接
4. 重新编辑 `.env` 文件

### 如果内存不足
```bash
# 清理Docker缓存
docker system prune -f

# 重启系统
sudo reboot
```

---

## 📞 获取帮助

### 查看系统状态
```bash
# 查看所有容器状态
docker ps -a

# 查看系统资源
free -h
df -h
```

### 常见错误解决

**错误1: "Permission denied"**
```bash
sudo chmod +x deploy_c5n.bat
```

**错误2: "Port already in use"**
```bash
sudo netstat -tlnp | grep :8080
sudo kill -9 <进程ID>
```

**错误3: "Out of memory"**
```bash
docker system prune -f
sudo reboot
```

---

## ✅ 部署完成检查清单

- [ ] SSH成功连接到服务器
- [ ] Docker和Docker Compose安装成功
- [ ] 项目代码下载完成
- [ ] API密钥配置正确
- [ ] 所有容器启动成功
- [ ] 监控界面可以访问
- [ ] 系统健康检查通过
- [ ] 日志显示正常运行

**恭喜！你的HFT微套利系统已经成功部署并运行！**

---

## 📚 重要提醒

1. **安全提醒**: 定期更改API密钥，不要分享给他人
2. **监控提醒**: 每天检查系统运行状态和交易日志
3. **备份提醒**: 定期备份配置文件和重要数据
4. **更新提醒**: 定期更新系统代码获取最新功能

**记住**: 这是一个自动交易系统，请在充分理解风险的情况下使用！