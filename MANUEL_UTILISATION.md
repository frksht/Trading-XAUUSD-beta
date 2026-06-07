# Manuel d'Utilisation — TradingView MCP + SMC XAUUSD

## 1. Démarrage

### Lancer TradingView avec CDP

```powershell
# Si TradingView n'est pas encore lancé :
start "" "%LOCALAPPDATA%\TradingView\TradingView.exe" --remote-debugging-port=9222

# Vérifier que le port CDP répond :
curl.exe -s http://localhost:9222/json/version
```

### Vérifier la connexion (via OpenCode)

Dans le chat, utilisez l'outil MCP :
```
tv_health_check
```

---

## 2. Outils MCP Disponibles

### Lecture du chart

| Commande | Description |
|---|---|
| `chart_get_state` | Symbol, timeframe, indicateurs + leurs IDs (à appeler en premier) |
| `quote_get` | Prix en temps réel (last, OHLC, volume) |
| `data_get_ohlcv` | Bougies OHLCV — toujours passer `summary=true` |
| `data_get_study_values` | Valeurs des indicateurs visibles (RSI, EMA, etc.) |

### Indicateurs SMC (Pine Script)

| Commande | Description |
|---|---|
| `data_get_pine_lines` | Niveaux de prix horizontaux (ex: Order Block, FVG) |
| `data_get_pine_labels` | Annotations textuelles avec prix |
| `data_get_pine_boxes` | Zones de prix {high, low} |

Toujours utiliser `study_filter` pour cibler un indicateur par nom (ex: `study_filter="Order Block"`).

### Navigation

| Commande | Description |
|---|---|
| `chart_set_symbol` | Changer le symbole |
| `chart_set_timeframe` | Changer l'unité de temps |
| `chart_manage_indicator` | Ajouter/supprimer un indicateur |
| `chart_scroll_to_date` | Aller à une date (format ISO) |

### Connexion & lancement

| Commande | Description |
|---|---|
| `tv_launch` | Auto-détecter et lancer TradingView avec CDP |
| `tv_health_check` | Vérifier l'état de la connexion |

### Autres

| Commande | Description |
|---|---|
| `capture_screenshot` | Capture d'écran (full, chart, strategy_tester) |
| `draw_shape` | Dessiner lignes, rectangles, texte |
| `batch_run` | Exécuter une action sur plusieurs symboles/timeframes |

---

## 3. Workflow d'Analyse SMC

### Étapes quotidiennes

1. **Contexte HT** (`chart_set_timeframe=60` puis `60`)
   - Déterminer la tendance 1H
   - Identifier les zones premium/discount

2. **Structure du marché** (`chart_set_timeframe=15` puis `15`)
   - Chercher les BOS (Break of Structure)
   - Chercher les CHOCH (Change of Character)
   - Identifier le MSS (Market Structure Shift) — **déclencheur principal**

3. **Liquidité**
   - Liquidité acheteur : plus hauts égaux, sommets au-dessus des niveaux clés
   - Liquidité vendeur : plus bas égaux, creux sous les niveaux clés
   - Liquidité déjà balayée ? Prochaine cible probable ?

4. **Setup d'entrée**
   - **Long** : Balayage liquidité vendeur → MSS haussier 15M → FVG/OB haussier → Retracement
   - **Short** : Balayage liquidité acheteur → MSS baissier 15M → FVG/OB baissier → Retracement
   - Ratio R/R minimum : **1:2**

5. **Filtre macro**
   - Vérifier NFP, CPI, Core PCE, FOMC, Fed Press Conference
   - Vérifier DXY (direction et momentum)
   - Vérifier US10Y (tendance des rendements)

### Règles de risque

- Risque max par trade : **1% du portefeuille**
- **Aucun trade** pendant les 30 minutes précédant une actualité à fort impact
- Si une actualité à fort impact est dans les 30 min → `NO TRADE — HIGH IMPACT NEWS RISK`

---

## 4. Format de Sortie Standard

Chaque analyse doit être rendue dans ce format :

```
──────────────────────────────────────
XAUUSD SCALPING ANALYSIS
──────────────────────────────────────
BIAS:
  Bullish / Bearish / Neutral

LIQUIDITY:
  Buy-side liquidity:   [prix]
  Sell-side liquidity:  [prix]
  Last liquidity sweep: [description]

MARKET STRUCTURE:
  BOS:   [niveau et direction]
  CHOCH: [niveau et direction]
  MSS:   [niveau et direction]

TRADE SETUP:
  Direction:     Long / Short / No Trade
  Entry:         [prix]
  Stop Loss:     [prix]
  Take Profit 1: [prix]
  Take Profit 2: [prix]
  Risk/Reward:   [ratio]

CONFIDENCE:
  Low / Medium / High

REASONING:
  [Explication concise basée sur le balayage de liquidité,
   la confirmation MSS, la structure du marché, la corrélation DXY,
   US10Y et les conditions macro. Si aucun setup valide, expliquer
   pourquoi et quoi attendre.]
──────────────────────────────────────
```

---

## 5. Symboles de la Watchlist

### Principaux
- `OANDA:XAUUSD` — XAUUSD (primary)
- `TVC:GOLD` — Gold Futures

### Filtres macro
- `TVC:DXY` — Dollar Index
- `TVC:US10Y` — US 10-Year Yield
- `ECONOMICS:USINTR` — US Interest Rate
- `CAPITALCOM:CPI_USFED` — US CPI

---

## 6. Indicateurs sur le Chart

Les indicateurs SMC suivants sont déjà chargés sur le chart 15M :

1. **Money Flow Profile [LuxAlgo]** — Profil de flux monétaire
2. **Key Levels SpacemanBTC IDWM** — Niveaux clés
3. **BOS/CHOCH Demand & Supply** — Rupture de structure
4. **Order Block Finder** — Blocs d'ordres
5. **FVG/iFVG (Nephew_Sam_)** — Fair Value Gaps
6. **HTF Power of Three°** — Power of Three (HTF)
7. **Sessions [LuxAlgo]** — Sessions de trading
8. **Moving Average Exponential** — EMA

---

## 7. Dépannage

| Problème | Solution |
|---|---|
| `tv_health_check` échoue | TradingView n'est pas lancé avec CDP. Lancer : `tv_launch` |
| Port 9222 ne répond pas | Lancer TradingView manuellement avec `--remote-debugging-port=9222` |
| `quote_get` ne retourne rien | Vérifier que le chart est ouvert sur un symbole valide |
| Les indicateurs SMC ne s'affichent pas | Les ajouter via `chart_manage_indicator` avec le nom complet |
| `study_filter` ne trouve rien | Vérifier que l'indicateur est **visible** sur le chart |

---

## 8. Raccourcis PowerShell

```powershell
# Lancer TradingView
start "" "$env:LOCALAPPDATA\TradingView\TradingView.exe" --remote-debugging-port=9222

# Vérifier CDP
curl.exe -s http://localhost:9222/json/version

# Obtenir la liste des targets CDP
curl.exe -s http://localhost:9222/json | ConvertFrom-Json | Select-Object -ExpandProperty url
```
