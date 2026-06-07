import { readFileSync } from 'fs';
import { logSession, logTrade, getStats } from './journal.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const RULES_PATH = join(__dirname, '..', 'tradingview-mcp', 'rules.json');

let rules = null;
try {
  rules = JSON.parse(readFileSync(RULES_PATH, 'utf-8'));
} catch {
  rules = { asset: 'XAUUSD', strategy: 'SMC Scalping' };
}

export function getRules() {
  return { ...rules };
}

export function createSession() {
  const sessionId = `session_${Date.now()}`;
  const session = {
    id: sessionId,
    asset: rules.asset,
    strategy: rules.strategy,
    started_at: new Date().toISOString(),
    steps: [],
  };
  logSession(session);
  return session;
}

export function addStep(session, step) {
  step.timestamp = new Date().toISOString();
  session.steps.push(step);
  logSession({ id: session.id, step });
  return session;
}

export function finalizeSession(session, summary) {
  session.ended_at = new Date().toISOString();
  session.summary = summary;
  session.stats = getStats();
  logSession({ id: session.id, ended_at: session.ended_at, summary, stats: session.stats });
  return session;
}

export function createTradeRecord({
  session_id, direction, entry, stop_loss, take_profit_1, take_profit_2,
  risk_reward, confidence, bias, reasoning, setup_type
}) {
  const trade = {
    session_id,
    direction,
    entry,
    stop_loss,
    take_profit_1,
    take_profit_2,
    risk_reward,
    risk_percent: parseFloat(rules.risk_rules?.max_risk_per_trade || '1%'),
    confidence,
    bias,
    setup_type,
    reasoning,
    pnl: null,
    pnl_pct: null,
    status: 'open',
  };
  logTrade(trade);
  return trade;
}

export function closeTrade(trade, exit_price, pnl, pnl_pct) {
  trade.exit_price = exit_price;
  trade.pnl = pnl;
  trade.pnl_pct = pnl_pct;
  trade.status = 'closed';
  trade.closed_at = new Date().toISOString();
  logTrade({ ...trade, type: 'trade_close' });
  return trade;
}

export function checkNewsBlock() {
  return { blocked: false, reason: null };
}
