@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM ========================================
REM HFT微套利系统 - C5N实例一键部署脚本
REM 支持多环境、热更新、滚动部署
REM ========================================

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    HFT微套利系统 - C5N部署                    ║
echo ║                   2vCPU 5.3GB 高性能部署方案                  ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM 设置默认参数
set "ENV=testing"
set "MODE=normal"
set "VERSION=latest"
set "SKIP_BUILD=false"
set "SKIP_VALIDATION=false"
set "COMPOSE_FILE=docker-compose.c5n.yml"
set "CONFIG_FILE=configs\.env.c5n.testing"

REM 解析命令行参数
:parse_args
if "%~1"=="" goto :args_done
if "%~1"=="--env" (
    set "ENV=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="--mode" (
    set "MODE=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="--version" (
    set "VERSION=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="--skip-build" (
    set "SKIP_BUILD=true"
    shift
    goto :parse_args
)
if "%~1"=="--skip-validation" (
    set "SKIP_VALIDATION=true"
    shift
    goto :parse_args
)
if "%~1"=="--help" (
    goto :show_help
)
shift
goto :parse_args

:args_done

REM 显示当前配置
echo 🚀 部署配置:
echo    环境: %ENV%
echo    模式: %MODE%
echo    版本: %VERSION%
echo    配置文件: %CONFIG_FILE%
echo.

REM 检查必要条件
echo 🔍 检查部署环境...

REM 检查Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker未安装或未启动
    echo 请先安装Docker Desktop: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
echo ✅ Docker已就绪

REM 检查Docker Compose
docker compose version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose未安装
    echo 请更新到最新版本的Docker Desktop
    pause
    exit /b 1
)
echo ✅ Docker Compose已就绪

REM 检查配置文件
if not exist "%CONFIG_FILE%" (
    echo ❌ 配置文件不存在: %CONFIG_FILE%
    echo 正在创建默认配置文件...
    call :create_default_config
)
echo ✅ 配置文件已就绪

REM 验证配置
if "%SKIP_VALIDATION%"=="false" (
    echo 🔍 验证配置文件...
    call :validate_config
    if errorlevel 1 (
        echo ❌ 配置验证失败
        pause
        exit /b 1
    )
    echo ✅ 配置验证通过
)

REM 创建必要目录
echo 📁 创建必要目录...
if not exist "logs" mkdir logs
if not exist "data" mkdir data
if not exist "backups" mkdir backups
if not exist "config" mkdir config
echo ✅ 目录创建完成

REM 根据模式执行部署
echo.
echo 🚀 开始部署 [%MODE%模式]...
echo.

if "%MODE%"=="normal" (
    call :deploy_normal
) else if "%MODE%"=="rolling" (
    call :deploy_rolling
) else if "%MODE%"=="hotfix" (
    call :deploy_hotfix
) else if "%MODE%"=="dev" (
    call :deploy_dev
) else (
    echo ❌ 未知部署模式: %MODE%
    goto :show_help
)

if errorlevel 1 (
    echo ❌ 部署失败
    pause
    exit /b 1
)

echo.
echo ✅ 部署完成！
echo.
echo 📊 访问地址:
echo    应用主页: http://localhost:8080
echo    健康检查: http://localhost:8080/health
echo    Grafana监控: http://localhost:3000 (admin/admin123_test)
echo    Prometheus: http://localhost:9090
echo.
echo 🔧 常用命令:
echo    查看状态: docker compose -f %COMPOSE_FILE% ps
echo    查看日志: docker compose -f %COMPOSE_FILE% logs -f app
echo    停止服务: docker compose -f %COMPOSE_FILE% down
echo    重启服务: docker compose -f %COMPOSE_FILE% restart app
echo.
echo 📈 监控命令:
echo    实时监控: .\monitor.bat
echo    性能测试: .\benchmark.bat
echo    故障排除: .\troubleshoot.bat
echo.
pause
exit /b 0

REM ========================================
REM 部署函数
REM ========================================

:deploy_normal
echo 📦 标准部署模式

REM 停止现有服务
echo 🛑 停止现有服务...
docker compose -f %COMPOSE_FILE% down >nul 2>&1

REM 构建镜像
if "%SKIP_BUILD%"=="false" (
    echo 🔨 构建应用镜像...
    docker compose -f %COMPOSE_FILE% build app
    if errorlevel 1 (
        echo ❌ 镜像构建失败
        exit /b 1
    )
)

REM 启动服务
echo 🚀 启动服务...
docker compose -f %COMPOSE_FILE% --env-file %CONFIG_FILE% up -d
if errorlevel 1 (
    echo ❌ 服务启动失败
    exit /b 1
)

REM 等待服务就绪
echo ⏳ 等待服务启动...
timeout /t 30 /nobreak >nul

REM 健康检查
call :health_check
exit /b %errorlevel%

:deploy_rolling
echo 🔄 滚动部署模式

REM 构建新版本
if "%SKIP_BUILD%"=="false" (
    echo 📦 构建新版本镜像...
    docker build -t hft-app:%VERSION% .
    if errorlevel 1 (
        echo ❌ 新版本构建失败
        exit /b 1
    )
)

REM 启动新版本容器
echo 🆕 启动新版本容器...
docker run -d --name hft-app-new ^
    -p 8081:8080 ^
    --env-file %CONFIG_FILE% ^
    --network hft-network ^
    hft-app:%VERSION%

if errorlevel 1 (
    echo ❌ 新版本启动失败
    exit /b 1
)

REM 健康检查新版本
echo 🏥 检查新版本健康状态...
set "health_check_count=0"
:health_check_loop
set /a health_check_count+=1
curl -f http://localhost:8081/health >nul 2>&1
if not errorlevel 1 (
    echo ✅ 新版本健康检查通过
    goto :switch_traffic
)
if %health_check_count% geq 30 (
    echo ❌ 新版本健康检查失败，回滚
    docker stop hft-app-new >nul 2>&1
    docker rm hft-app-new >nul 2>&1
    exit /b 1
)
timeout /t 2 /nobreak >nul
goto :health_check_loop

:switch_traffic
echo 🔀 切换流量到新版本...
REM 停止旧版本
docker stop hft-app >nul 2>&1
docker rename hft-app hft-app-old >nul 2>&1
docker rename hft-app-new hft-app >nul 2>&1

REM 更新端口映射
docker stop hft-app >nul 2>&1
docker run -d --name hft-app-final ^
    -p 8080:8080 ^
    --env-file %CONFIG_FILE% ^
    --network hft-network ^
    hft-app:%VERSION%

docker stop hft-app >nul 2>&1
docker rm hft-app >nul 2>&1
docker rename hft-app-final hft-app >nul 2>&1

echo ✅ 滚动部署完成
exit /b 0

:deploy_hotfix
echo 🔥 热修复部署模式

REM 快速构建
echo ⚡ 快速构建热修复版本...
docker build --cache-from hft-app:latest -t hft-app:%VERSION% .
if errorlevel 1 (
    echo ❌ 热修复构建失败
    exit /b 1
)

REM 立即替换
echo 🚨 立即替换容器...
docker stop hft-app
docker run -d --name hft-app-hotfix ^
    -p 8080:8080 ^
    --env-file %CONFIG_FILE% ^
    --network hft-network ^
    hft-app:%VERSION%

REM 快速验证
echo ⚡ 快速验证...
timeout /t 5 /nobreak >nul
curl -f http://localhost:8080/health >nul 2>&1
if not errorlevel 1 (
    echo ✅ 热修复验证通过
    docker rm hft-app >nul 2>&1
    docker rename hft-app-hotfix hft-app >nul 2>&1
) else (
    echo ❌ 热修复失败，立即回滚
    docker stop hft-app-hotfix >nul 2>&1
    docker start hft-app >nul 2>&1
    exit /b 1
)

echo ✅ 热修复完成
exit /b 0

:deploy_dev
echo 🛠️ 开发环境部署模式

REM 启动开发环境
echo 🚀 启动开发环境...
docker compose -f %COMPOSE_FILE% --env-file %CONFIG_FILE% --profile dev up -d
if errorlevel 1 (
    echo ❌ 开发环境启动失败
    exit /b 1
)

echo ✅ 开发环境部署完成
echo 📝 开发服务地址: http://localhost:8081
echo 🐛 调试端口: 9229
exit /b 0

REM ========================================
REM 辅助函数
REM ========================================

:health_check
echo 🏥 执行健康检查...
set "check_count=0"
:health_loop
set /a check_count+=1
curl -f http://localhost:8080/health >nul 2>&1
if not errorlevel 1 (
    echo ✅ 应用健康检查通过
    goto :check_services
)
if %check_count% geq 30 (
    echo ❌ 应用健康检查失败
    echo 📋 查看应用日志:
    docker compose -f %COMPOSE_FILE% logs --tail=20 app
    exit /b 1
)
echo ⏳ 等待应用启动... (%check_count%/30)
timeout /t 2 /nobreak >nul
goto :health_loop

:check_services
echo 🔍 检查所有服务状态...
docker compose -f %COMPOSE_FILE% ps
echo.
echo 📊 检查资源使用情况...
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
exit /b 0

:validate_config
echo 🔍 验证配置文件...

REM 检查必要的环境变量
for /f "tokens=1,2 delims==" %%a in ('type "%CONFIG_FILE%" ^| findstr /v "^#" ^| findstr /v "^$"') do (
    set "%%a=%%b"
)

REM 检查API密钥
if "%BINANCE_API_KEY%"=="your_testnet_api_key_here" (
    echo ⚠️  警告: 请设置真实的币安API密钥
    echo 编辑文件: %CONFIG_FILE%
    echo 设置 BINANCE_API_KEY 和 BINANCE_API_SECRET
    set /p "continue=是否继续部署？(y/N): "
    if /i not "!continue!"=="y" exit /b 1
)

REM 检查数据库密码
if "%POSTGRES_PASSWORD%"=="hft_password" (
    echo ⚠️  警告: 使用默认数据库密码，建议修改
)

exit /b 0

:create_default_config
echo 📝 创建默认配置文件...
copy "configs\.env.simple" "%CONFIG_FILE%" >nul
echo ✅ 默认配置文件已创建: %CONFIG_FILE%
echo ⚠️  请编辑配置文件设置API密钥
exit /b 0

:show_help
echo.
echo 用法: %~nx0 [选项]
echo.
echo 选项:
echo   --env ^<环境^>        部署环境 (testing/staging/production)
echo   --mode ^<模式^>       部署模式 (normal/rolling/hotfix/dev)
echo   --version ^<版本^>    应用版本标签
echo   --skip-build       跳过镜像构建
echo   --skip-validation  跳过配置验证
echo   --help             显示此帮助信息
echo.
echo 示例:
echo   %~nx0 --env=testing --mode=normal
echo   %~nx0 --env=production --mode=rolling --version=v1.2.0
echo   %~nx0 --mode=hotfix --skip-validation
echo   %~nx0 --mode=dev
echo.
echo 环境说明:
echo   testing    - 测试环境，使用保守参数
echo   staging    - 预发布环境，接近生产配置
echo   production - 生产环境，完整功能
echo.
echo 模式说明:
echo   normal  - 标准部署，停止旧服务后启动新服务
echo   rolling - 滚动部署，零停机时间更新
echo   hotfix  - 热修复，最快速度修复关键问题
echo   dev     - 开发模式，支持代码热重载
echo.
exit /b 0