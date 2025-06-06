@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM ========================================
REM HFT微套利系统 - C5N实例实时监控
REM 2vCPU 5.3GB 专用监控脚本
REM ========================================

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    HFT微套利系统 - C5N监控                    ║
echo ║                   实时性能与交易状态监控                      ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

set "COMPOSE_FILE=docker-compose.c5n.yml"
set "REFRESH_INTERVAL=5"
set "LOG_LINES=20"

REM 解析命令行参数
:parse_args
if "%~1"=="" goto :start_monitor
if "%~1"=="--interval" (
    set "REFRESH_INTERVAL=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="--logs" (
    set "LOG_LINES=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="--help" (
    goto :show_help
)
shift
goto :parse_args

:start_monitor
echo 🚀 启动C5N实例监控 (刷新间隔: %REFRESH_INTERVAL%秒)
echo 按 Ctrl+C 退出监控
echo.

:monitor_loop
cls
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    HFT微套利系统 - C5N监控                    ║
echo ║                   %date% %time:~0,8%                    ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM 系统概览
echo 📊 系统概览
echo ────────────────────────────────────────────────────────────────
echo 🖥️  C5N实例规格: 2vCPU / 5.3GB RAM / 高性能网络
echo 🕒 监控时间: %date% %time:~0,8%
echo 🔄 刷新间隔: %REFRESH_INTERVAL%秒
echo.

REM 容器状态
echo 🐳 容器状态
echo ────────────────────────────────────────────────────────────────
docker compose -f %COMPOSE_FILE% ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
echo.

REM 资源使用情况 (C5N特定指标)
echo 💾 资源使用情况 (C5N优化)
echo ────────────────────────────────────────────────────────────────
echo 📈 实时资源统计:
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}"
echo.

REM C5N网络性能指标
echo 🌐 C5N网络性能
echo ────────────────────────────────────────────────────────────────
echo 📡 网络连接状态:
netstat -an | findstr :8080 | findstr ESTABLISHED | find /c "ESTABLISHED" > temp_conn.txt
set /p connections=<temp_conn.txt
del temp_conn.txt >nul 2>&1
echo    活跃连接数: %connections%

REM 检查网络延迟
ping -n 1 8.8.8.8 | findstr "时间" > temp_ping.txt 2>nul
if exist temp_ping.txt (
    set /p ping_result=<temp_ping.txt
    echo    网络延迟: !ping_result!
    del temp_ping.txt >nul 2>&1
) else (
    echo    网络延迟: 检测中...
)
echo.

REM 应用健康状态
echo 🏥 应用健康状态
echo ────────────────────────────────────────────────────────────────
curl -s http://localhost:8080/health >nul 2>&1
if not errorlevel 1 (
    echo ✅ 主应用: 健康
    
    REM 获取详细健康信息
    curl -s http://localhost:8080/health 2>nul | findstr "status\|uptime\|version" >nul 2>&1
    if not errorlevel 1 (
        echo 📊 详细状态:
        curl -s http://localhost:8080/health 2>nul
    )
) else (
    echo ❌ 主应用: 异常
)

REM 检查数据库连接
curl -s http://localhost:8080/health/db >nul 2>&1
if not errorlevel 1 (
    echo ✅ 数据库: 连接正常
) else (
    echo ❌ 数据库: 连接异常
)

REM 检查Redis连接
curl -s http://localhost:8080/health/redis >nul 2>&1
if not errorlevel 1 (
    echo ✅ Redis: 连接正常
) else (
    echo ❌ Redis: 连接异常
)
echo.

REM 交易统计
echo 📈 交易统计
echo ────────────────────────────────────────────────────────────────
curl -s http://localhost:8080/api/stats 2>nul | findstr "trades\|profit\|volume" >nul 2>&1
if not errorlevel 1 (
    echo 💰 实时交易数据:
    curl -s http://localhost:8080/api/stats 2>nul
) else (
    echo ⏳ 交易数据获取中...
)
echo.

REM 最近日志
echo 📋 最近日志 (最新%LOG_LINES%行)
echo ────────────────────────────────────────────────────────────────
docker compose -f %COMPOSE_FILE% logs --tail=%LOG_LINES% app 2>nul | findstr /v "^$"
echo.

REM 详细信息选项
echo 🔧 详细信息
echo ────────────────────────────────────────────────────────────────
echo [1] 查看完整日志    [2] 性能分析    [3] 错误日志    [4] 交易详情
echo [5] 系统资源详情    [6] 网络连接    [7] 数据库状态  [8] 配置检查
echo [9] 重启服务        [0] 停止监控
echo.

REM 自动刷新或等待用户输入
echo ⏰ %REFRESH_INTERVAL%秒后自动刷新，或按任意键查看详细信息...
choice /c 1234567890 /t %REFRESH_INTERVAL% /d r /n >nul 2>&1
set "user_choice=%errorlevel%"

if %user_choice%==1 goto :show_full_logs
if %user_choice%==2 goto :show_performance
if %user_choice%==3 goto :show_error_logs
if %user_choice%==4 goto :show_trading_details
if %user_choice%==5 goto :show_system_details
if %user_choice%==6 goto :show_network_details
if %user_choice%==7 goto :show_database_status
if %user_choice%==8 goto :show_config_check
if %user_choice%==9 goto :restart_services
if %user_choice%==10 goto :exit_monitor

REM 自动刷新
goto :monitor_loop

:show_full_logs
cls
echo 📋 完整应用日志
echo ════════════════════════════════════════════════════════════════
docker compose -f %COMPOSE_FILE% logs --tail=100 app
echo.
echo 按任意键返回监控...
pause >nul
goto :monitor_loop

:show_performance
cls
echo 📊 性能分析 (C5N优化)
echo ════════════════════════════════════════════════════════════════
echo 🔍 CPU使用率趋势:
docker stats --no-stream --format "{{.Container}}: CPU {{.CPUPerc}} | 内存 {{.MemUsage}} ({{.MemPerc}})"
echo.
echo 💾 内存使用详情:
docker exec hft-app-1 cat /proc/meminfo 2>nul | findstr "MemTotal\|MemFree\|MemAvailable" 2>nul
echo.
echo 🌐 网络I/O统计:
docker stats --no-stream --format "{{.Container}}: 网络 {{.NetIO}} | 磁盘 {{.BlockIO}}"
echo.
echo 按任意键返回监控...
pause >nul
goto :monitor_loop

:show_error_logs
cls
echo ❌ 错误日志分析
echo ════════════════════════════════════════════════════════════════
echo 🔍 应用错误:
docker compose -f %COMPOSE_FILE% logs app 2>nul | findstr /i "error\|exception\|failed\|panic"
echo.
echo 🔍 系统错误:
docker compose -f %COMPOSE_FILE% logs 2>nul | findstr /i "error\|failed"
echo.
echo 按任意键返回监控...
pause >nul
goto :monitor_loop

:show_trading_details
cls
echo 💰 交易详情分析
echo ════════════════════════════════════════════════════════════════
echo 📊 实时交易统计:
curl -s http://localhost:8080/api/stats/detailed 2>nul
echo.
echo 📈 最近交易记录:
curl -s http://localhost:8080/api/trades/recent 2>nul
echo.
echo 💹 盈亏分析:
curl -s http://localhost:8080/api/pnl/summary 2>nul
echo.
echo 按任意键返回监控...
pause >nul
goto :monitor_loop

:show_system_details
cls
echo 🖥️ 系统资源详情 (C5N实例)
echo ════════════════════════════════════════════════════════════════
echo 💻 CPU信息:
wmic cpu get name,numberofcores,numberoflogicalprocessors /format:list | findstr /v "^$"
echo.
echo 💾 内存信息:
wmic computersystem get totalpysicalmemory /format:list | findstr /v "^$"
wmic OS get freephysicalmemory,totalvisiblememorysize /format:list | findstr /v "^$"
echo.
echo 💿 磁盘使用:
wmic logicaldisk get size,freespace,caption /format:list | findstr /v "^$"
echo.
echo 🐳 Docker资源:
docker system df
echo.
echo 按任意键返回监控...
pause >nul
goto :monitor_loop

:show_network_details
cls
echo 🌐 网络连接详情 (C5N网络优化)
echo ════════════════════════════════════════════════════════════════
echo 📡 活跃连接:
netstat -an | findstr :8080
echo.
echo 🔗 Docker网络:
docker network ls
echo.
echo 📊 网络统计:
netstat -s | findstr "TCP\|UDP"
echo.
echo 按任意键返回监控...
pause >nul
goto :monitor_loop

:show_database_status
cls
echo 🗄️ 数据库状态检查
echo ════════════════════════════════════════════════════════════════
echo 📊 PostgreSQL状态:
docker exec hft-db-1 pg_isready -U hft_user 2>nul
echo.
echo 📈 数据库连接数:
docker exec hft-db-1 psql -U hft_user -d hft_db -c "SELECT count(*) as active_connections FROM pg_stat_activity;" 2>nul
echo.
echo 💾 数据库大小:
docker exec hft-db-1 psql -U hft_user -d hft_db -c "SELECT pg_size_pretty(pg_database_size('hft_db')) as database_size;" 2>nul
echo.
echo 🔍 Redis状态:
docker exec hft-redis-1 redis-cli ping 2>nul
echo.
echo 按任意键返回监控...
pause >nul
goto :monitor_loop

:show_config_check
cls
echo ⚙️ 配置检查
echo ════════════════════════════════════════════════════════════════
echo 📋 环境变量检查:
docker exec hft-app-1 env | findstr "BINANCE\|DATABASE\|REDIS" 2>nul
echo.
echo 📁 配置文件:
if exist "configs\.env.c5n.testing" (
    echo ✅ 配置文件存在: configs\.env.c5n.testing
    echo 📊 配置摘要:
    type "configs\.env.c5n.testing" | findstr /v "SECRET\|PASSWORD\|KEY" | findstr /v "^#" | findstr /v "^$"
) else (
    echo ❌ 配置文件不存在
)
echo.
echo 按任意键返回监控...
pause >nul
goto :monitor_loop

:restart_services
cls
echo 🔄 重启服务
echo ════════════════════════════════════════════════════════════════
echo ⚠️  即将重启HFT微套利服务
set /p "confirm=确认重启？(y/N): "
if /i not "%confirm%"=="y" goto :monitor_loop

echo 🛑 停止服务...
docker compose -f %COMPOSE_FILE% restart app
echo ✅ 服务重启完成
echo.
echo 按任意键返回监控...
pause >nul
goto :monitor_loop

:exit_monitor
echo.
echo 👋 监控已停止
exit /b 0

:show_help
echo.
echo 用法: %~nx0 [选项]
echo.
echo 选项:
echo   --interval ^<秒^>     刷新间隔 (默认: 5秒)
echo   --logs ^<行数^>       显示日志行数 (默认: 20行)
echo   --help             显示此帮助信息
echo.
echo 示例:
echo   %~nx0 --interval 10 --logs 50
echo   %~nx0 --interval 3
echo.
echo 功能说明:
echo   - 实时监控C5N实例资源使用情况
echo   - 显示容器状态和健康检查
echo   - 监控网络性能和连接状态
echo   - 查看交易统计和应用日志
echo   - 提供详细的系统分析工具
echo.
exit /b 0