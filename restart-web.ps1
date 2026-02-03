# 重启 Web 服务脚本
Write-Host "正在重启 Web 服务..." -ForegroundColor Green

# 1. 查找并停止占用 4173 端口的进程
$port = 4173
$process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($process) {
    Write-Host "正在停止占用端口 $port 的进程..." -ForegroundColor Yellow
    Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "进程已停止" -ForegroundColor Green
} else {
    Write-Host "端口 $port 未被占用" -ForegroundColor Cyan
}

# 2. 停止所有 Node 进程（可选，根据需要注释掉）
# Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# 3. 进入项目目录
Set-Location "d:/Hao-Data/Game/Kill-Line-Phone-Web"

# 4. 重新构建项目
Write-Host "正在构建项目..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "构建失败！" -ForegroundColor Red
    exit 1
}
Write-Host "构建完成！" -ForegroundColor Green

# 5. 启动预览服务器
Write-Host "正在启动预览服务器..." -ForegroundColor Yellow
Write-Host "服务将在 http://localhost:4173 启动" -ForegroundColor Cyan
Write-Host "按 Ctrl+C 停止服务" -ForegroundColor Magenta
npm run preview -- --host --port 4173
