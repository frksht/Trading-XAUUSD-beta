param(
  [int]$Port = 9222,
  [int]$IntervalSeconds = 30,
  [string]$TradingViewPath = "$env:LOCALAPPDATA\TradingView\TradingView.exe"
)

$ErrorActionPreference = "Stop"

function Test-CDP {
  try {
    $response = curl.exe -s "http://localhost:$Port/json/version"
    if ($response -match '"chrome"') { return $true }
  } catch { }
  return $false
}

function Restart-TradingView {
  Write-Host "[$(Get-Date -Format 'HH:mm:ss')] CDP port $Port ne répond pas. Redémarrage de TradingView..."
  try {
    $processes = Get-Process -Name "TradingView" -ErrorAction SilentlyContinue
    if ($processes) { $processes | Stop-Process -Force }
    Start-Sleep -Seconds 5
    Start-Process -FilePath $TradingViewPath -ArgumentList "--remote-debugging-port=$Port"
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] TradingView relancé."
  } catch {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ERREUR: $_"
  }
}

Write-Host "=== Watchdog CDP ==="
Write-Host "Port: $Port | Intervalle: ${IntervalSeconds}s | Path: $TradingViewPath"
Write-Host "Surveillance démarrée. Ctrl+C pour arrêter."
Write-Host ""

while ($true) {
  $alive = Test-CDP
  if (-not $alive) {
    Restart-TradingView
  } else {
    $time = Get-Date -Format 'HH:mm:ss'
    Write-Host "[$time] CDP OK" -ForegroundColor Green
  }
  Start-Sleep -Seconds $IntervalSeconds
}
