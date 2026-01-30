param([switch]$Verbose)

$distDir = "C:\Users\ASUS\.docker\Ecme-lite-cesar\dist\android"
$apkFile = Join-Path $distDir "app-debug.apk"
$buildInfoFile = Join-Path $distDir "build-info.json"

Write-Host "Checking APK Build..." -ForegroundColor Cyan

if (-not (Test-Path $distDir)) {
    Write-Host "Build directory not found: $distDir" -ForegroundColor Red
    exit 1
}

# Check APK
if (Test-Path $apkFile) {
    $apkSize = (Get-Item $apkFile).Length
    $apkSizeMB = [math]::Round($apkSize / 1MB, 2)
    $apkSizeKB = [math]::Round($apkSize / 1KB, 2)
    
    Write-Host "`nAPK Build Successful!" -ForegroundColor Green
    Write-Host "File: $(Split-Path $apkFile -Leaf)"
    Write-Host "Size: $apkSizeMB MB ($apkSizeKB KB)"
    Write-Host "Modified: $(Get-Item $apkFile | Select-Object -ExpandProperty LastWriteTime)"
    
    # Show file hash
    $hash = Get-FileHash $apkFile -Algorithm SHA256
    Write-Host "SHA256: $($hash.Hash.Substring(0, 16))..."
} else {
    Write-Host "`nAPK not found - build may still be running" -ForegroundColor Yellow
}

# Check build info
if (Test-Path $buildInfoFile) {
    Write-Host "`nBuild Information:" -ForegroundColor Cyan
    $buildInfo = Get-Content $buildInfoFile | ConvertFrom-Json
    $buildInfo | Format-List
} else {
    Write-Host "`nBuild info not found yet" -ForegroundColor Yellow
}

# List all files in dist
Write-Host "`nFiles in dist/android:" -ForegroundColor Cyan
Get-ChildItem $distDir -File | Format-Table Name, @{Label="Size (MB)"; Expression={[math]::Round($_.Length/1MB, 2)}}, LastWriteTime -AutoSize
