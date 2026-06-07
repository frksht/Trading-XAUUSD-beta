# Trading — XAUUSD SMC Scalping

## MCP Server Setup

- **Repo**: `./tradingview-mcp` — cloned from `github.com/tradesdontlie/tradingview-mcp`
- **OpenCode config**: `.opencode/config.json` — MCP server `tradingview` configured (local scope)
- **Rules**: `./tradingview-mcp/rules.json` — XAUUSD SMC scalping rules

## Launch & Verify

```powershell
# Launch TradingView with CDP (if not already running)
start "" "%LOCALAPPDATA%\TradingView\TradingView.exe" --remote-debugging-port=9222

# Verify CDP
curl.exe -s http://localhost:9222/json/version
```

## Key Paths

| What | Where |
|---|---|
| MCP server entry | `./tradingview-mcp/src/server.js` |
| Rules file | `./tradingview-mcp/rules.json` |
| SMC indicators on chart | Money Flow Profile, BOS/CHOCH, Order Block, FVG, Sessions, EMA |
| Default symbol/timeframe | OANDA:XAUUSD / 15M |

## Project Modules

| Module | Path | Purpose |
|---|---|---|
| Trade Journal | `src/journal.js` | Logs every session and trade in NDJSON files under `trades/logs/` |
| Session Manager | `src/session.js` | Orchestrates analysis sessions, coordinates journal + rules |
| Macro News | `src/macro/news.js` | Economic calendar check (NFP/CPI/FOMC/PCE) with auto-block |
| Macro Context | `src/macro/context.js` | DXY/US10Y rules and bias calculation |
| Trailing Stop | `src/risk/trailing.js` | Structure-based trailing stop logic |
| Partial TP | `src/risk/partial.js` | 50% partial TP at 1:1, rest at target, breakeven SL |
| Position Sizing | `src/risk/sizing.js` | 1% risk-based volume calculation + R:R validation |
| Paper Trading | `src/paper.js` | Simulated account with P&L tracking |
| Dashboard | `dashboard/index.html` | Live performance dashboard (open in browser) |
| Watchdog | `scripts/watchdog.ps1` | Monitors CDP port 9222, auto-restarts TradingView on failure |
| Setup E2E | `scripts/setup_e2e.ps1` | Launches TV, waits for CDP, runs E2E tests |

## Notes

- `node ./tradingview-mcp/src/server.js` is registered as a stdio MCP server.
- TradingView Desktop is required. Download from `https://www.tradingview.com/desktop/`.
- CDP port is `9222`.
- OpenCode must be installed. The local `.opencode/config.json` is auto-detected when opening this folder.
- Trade logs are stored as NDJSON in `trades/logs/` — open `dashboard/index.html` in a browser to view them.
