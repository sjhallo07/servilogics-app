param(
    [switch]$Help,
    [switch]$NoInstall,
    [switch]$BackendOnly,
    [switch]$FrontendOnly
)

# Color definitions
$Colors = @{
    Red = 'Red'
    Green = 'Green'
    Yellow = 'Yellow'
    Blue = 'Cyan'
}

function Show-Banner {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
    Write-Host "║                   ECME LITE QUICKSTART                      ║" -ForegroundColor Blue
    Write-Host "║            Full-Stack Development Environment Setup          ║" -ForegroundColor Blue
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Blue
    Write-Host ""
}

function Show-Help {
    Write-Host "quickstart.ps1 - Install dependencies and run frontend + backend servers." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Cyan
    Write-Host "  .\quickstart.ps1 [options]"
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Cyan
    Write-Host "  -Help           Show this help message"
    Write-Host "  -NoInstall      Skip npm install (use existing dependencies)"
    Write-Host "  -BackendOnly    Start only the backend API server"
    Write-Host "  -FrontendOnly   Start only the frontend dev server"
    Write-Host ""
    Write-Host "Environment Variables:" -ForegroundColor Cyan
    Write-Host "  PORT            Backend port (default: 3001)"
    Write-Host "  FRONTEND_PORT   Frontend port (default: 5173)"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Cyan
    Write-Host "  .\quickstart.ps1                      # Install & start both servers"
    Write-Host "  `$env:PORT=4000; .\quickstart.ps1     # Start backend on port 4000"
    Write-Host "  `$env:FRONTEND_PORT=5175; .\quickstart.ps1  # Start frontend on port 5175"
    Write-Host "  .\quickstart.ps1 -FrontendOnly        # Start only frontend"
    Write-Host "  .\quickstart.ps1 -BackendOnly         # Start only backend"
    Write-Host ""
    Write-Host "Notes:" -ForegroundColor Cyan
    Write-Host "  - Requires Node.js 18+ and npm"
    Write-Host "  - Backend default: http://localhost:3001"
    Write-Host "  - Frontend default: http://localhost:5173"
    Write-Host "  - Press Ctrl+C to stop all services"
    Write-Host ""
}

if ($Help) {
    Show-Help
    exit 0
}

function Require-Cmd {
    param([string]$Name)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Missing required command: $Name" -ForegroundColor Red
        exit 1
    }
}

function Check-NodeVersion {
    try {
        $versionString = (& node -v) -replace '^v',''
        $major = [int]($versionString.Split('.')[0])
        if ($major -lt 18) {
            Write-Host "❌ Node.js 18+ is required. Found v$versionString." -ForegroundColor Red
            exit 1
        }
        Write-Host "✅ Node.js $versionString is installed" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error checking Node.js version: $_" -ForegroundColor Red
        exit 1
    }
}

function Install-IfMissing {
    param([string]$Dir, [string]$Name)
    if (-not (Test-Path "$Dir/node_modules")) {
        Write-Host "📦 Installing dependencies in $Name ..." -ForegroundColor Blue
        Push-Location $Dir
        try {
            npm install
            Write-Host "✅ Dependencies installed in $Name" -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to install dependencies in $Name" -ForegroundColor Red
            exit 1
        } finally {
            Pop-Location
        }
    } else {
        Write-Host "✅ Dependencies already present in $Name" -ForegroundColor Green
    }
}

function Ensure-Env {
    param([string]$Target, [string]$Example)
    if (Test-Path $Target) {
        Write-Host "✅ Found $(Split-Path $Target -Leaf)" -ForegroundColor Green
    } elseif (Test-Path $Example) {
        Copy-Item $Example $Target -Force
        Write-Host "✅ Created $(Split-Path $Target -Leaf) from $(Split-Path $Example -Leaf)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Missing $Target and no example present" -ForegroundColor Yellow
    }
}

function Start-Backend {
    param([int]$Port = 3001)
    Write-Host "🚀 Starting backend API server (PORT=$Port)..." -ForegroundColor Blue
    
    $backendDir = Join-Path $PSScriptRoot 'backend'
    $env:PORT = $Port

    # Use npm.cmd on Windows for better compatibility
    $script:BackendProc = Start-Process "npm.cmd" `
        -ArgumentList "start" `
        -WorkingDirectory $backendDir `
        -PassThru `
        -NoNewWindow
    
    if ($script:BackendProc -and $script:BackendProc.Id) {
        Start-Sleep -Seconds 2
        Write-Host "✅ Backend started (PID: $($script:BackendProc.Id))" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ Failed to start backend" -ForegroundColor Red
        return $false
    }
}

function Start-Frontend {
    param([int]$Port = 5173)
    Write-Host "🌐 Starting frontend dev server (Vite, port $Port)..." -ForegroundColor Blue
    $frontendDir = $PSScriptRoot
    Push-Location $frontendDir
    try {
        & npm run dev -- --host --port $Port
    } finally {
        Pop-Location
    }
}

function Cleanup {
    Write-Host ""
    Write-Host "🛑 Cleaning up..." -ForegroundColor Yellow
    
    if ($script:BackendProc -and -not $script:BackendProc.HasExited) {
        Write-Host "Stopping backend (PID: $($script:BackendProc.Id))" -ForegroundColor Yellow
        try {
            Stop-Process -Id $script:BackendProc.Id -Force -ErrorAction SilentlyContinue
            Start-Sleep -Milliseconds 500
        } catch {}
    }
    
    Write-Host "✅ Cleanup complete" -ForegroundColor Green
}

# Set error action
$ErrorActionPreference = 'Stop'

# Main execution
Show-Banner

Write-Host "Checking requirements..." -ForegroundColor Blue
Require-Cmd node
Require-Cmd npm
Check-NodeVersion
Write-Host ""

Write-Host "Checking environment files..." -ForegroundColor Blue
Ensure-Env (Join-Path $PSScriptRoot '.env') (Join-Path $PSScriptRoot '.env.example')
Ensure-Env (Join-Path $PSScriptRoot 'backend/.env') (Join-Path $PSScriptRoot 'backend/.env.example')
Write-Host ""

if (-not $NoInstall) {
    Write-Host "Installing dependencies..." -ForegroundColor Blue
    Install-IfMissing (Join-Path $PSScriptRoot 'backend') "backend"
    Install-IfMissing $PSScriptRoot "frontend"
    Write-Host ""
} else {
    Write-Host "⏭️  Skipping dependency installation" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Starting services..." -ForegroundColor Blue
Write-Host ""

$script:BackendProc = $null

$backendPort = 3001
if ($env:PORT -match '^\d+$') { $backendPort = [int]$env:PORT }

$frontendPort = 5173
if ($env:FRONTEND_PORT -match '^\d+$') { $frontendPort = [int]$env:FRONTEND_PORT }

if (-not $FrontendOnly) {
    if (-not (Start-Backend -Port $backendPort)) {
        exit 1
    }
}

if ($BackendOnly) {
    Write-Host "✅ Backend started successfully!" -ForegroundColor Green
    Write-Host "  API URL: http://localhost:$backendPort" -ForegroundColor Green
    Write-Host ""
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Blue
    Write-Host ""
    
    try {
        while ($script:BackendProc -and -not $script:BackendProc.HasExited) {
            Start-Sleep -Seconds 1
        }
    } catch {
        # Handle Ctrl+C
    }
} else {
    Write-Host "✅ All services started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access your application:" -ForegroundColor Blue
    Write-Host "  Frontend:  http://localhost:$frontendPort" -ForegroundColor Green
    Write-Host "  Backend:   http://localhost:$backendPort" -ForegroundColor Green
    Write-Host "  Health:    http://localhost:$backendPort/api/health" -ForegroundColor Green
    Write-Host ""
    Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Blue
    Write-Host ""
    
    Start-Frontend -Port $frontendPort
}
