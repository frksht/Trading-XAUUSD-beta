param(
  [int]$Port = 9222,
  [string]$TradingViewPath = "$env:LOCALAPPDATA\TradingView\TradingView.exe",
  [int]$TimeoutSeconds = 60
)

$ErrorActionPreference = "Stop"

function Wait-For-CDP {
  param([int]$Timeout)
  $elapsed = 0
  $interval = 3

  Write-Host "Attente du port CDP $Port..." -NoNewline
  while ($elapsed -lt $Timeout) {
    try {
      $response = curl.exe -s "http://localhost:$Port/json/version"
      if ($response -match '"chrome"') {
        Write-Host " OK" -ForegroundColor Green
        return $true
      }
    } catch { }
    Start-Sleep -Seconds $interval
    $elapsed += $interval
    Write-Host "." -NoNewline
  }
  Write-Host ""
  return $false
}

# Étape 1 : Vérifier si TradingView est lancé
$tv = Get-Process -Name "TradingView" -ErrorAction SilentlyContinue
if (-not $tv) {
  Write-Host "Lancement de TradingView..."
  Start-Process -FilePath $TradingViewPath -ArgumentList "--remote-debugging-port=$Port"
} else {
  Write-Host "TradingView déjà en cours d'exécution."
}

# Étape 2 : Attendre le CDP
$cdpReady = Wait-For-CDP -Timeout $TimeoutSeconds
if (-not $cdpReady) {
  Write-Host "ERREUR: CDP pas disponible après ${TimeoutSeconds}s." -ForegroundColor Red
  exit 1
}

# Étape 3 : Vérifier l'état via l'API
try {
  $targets = curl.exe -s "http://localhost:$Port/json" | ConvertFrom-Json
  $chartTarget = $targets | Where-Object { $_.url -match "tradingview.com/chart" }
  if ($chartTarget) {
    Write-Host "Chart TradingView trouvé: $($chartTarget.title)" -ForegroundColor Green
  } else {
    Write-Host "ATTENTION: Aucun chart TradingView trouvé parmi les targets CDP." -ForegroundColor Yellow
  }
} catch {
  Write-Host "ATTENTION: Impossible de lister les targets CDP: $_" -ForegroundColor Yellow
}

# Étape 4 : Lancer les tests
Write-Host ""
Write-Host "=== Lancement des tests E2E ===" -ForegroundColor Cyan
Set-Location -LiteralPath "$PSScriptRoot\..\tradingview-mcp"
npm run test:e2e

if ($LASTEXITCODE -eq 0) {
  Write-Host "Tests E2E réussis." -ForegroundColor Green
} else {
  Write-Host "Tests E2E échoués (code: $LASTEXITCODE)." -ForegroundColor Red
}
exit $LASTEXITCODE
