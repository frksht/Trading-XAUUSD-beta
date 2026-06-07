import { logTrade } from './journal.js';

const DEFAULT_BALANCE = 10000;

let state = {
  balance: DEFAULT_BALANCE,
  equity: DEFAULT_BALANCE,
  position: null,
  trades: [],
  session_start: null,
};

export function resetPaperAccount(balance = DEFAULT_BALANCE) {
  state = {
    balance,
    equity: balance,
    position: null,
    trades: [],
    session_start: new Date().toISOString(),
  };
  return getAccountSummary();
}

export function getAccountSummary() {
  const openPnl = state.position
    ? calculateUnrealizedPnl(state.position.current_price)
    : 0;

  return {
    balance: Math.round(state.balance * 100) / 100,
    equity: Math.round((state.balance + openPnl) * 100) / 100,
    open_pnl: Math.round(openPnl * 100) / 100,
    open_position: state.position
      ? { direction: state.position.direction, volume: state.position.volume, entry: state.position.entry }
      : null,
    total_trades: state.trades.length,
    session_start: state.session_start,
  };
}

export function openPaperTrade({ direction, entry, stop_loss, take_profit_1, take_profit_2, volume, risk_reward, confidence, reasoning }) {
  if (state.position) {
    return { error: 'Position already open', position: state.position };
  }

  state.position = {
    direction,
    entry,
    stop_loss,
    take_profit_1,
    take_profit_2,
    volume,
    risk_reward,
    confidence,
    reasoning,
    opened_at: new Date().toISOString(),
    current_price: entry,
  };

  const record = {
    direction,
    entry,
    stop_loss,
    take_profit_1,
    take_profit_2,
    volume,
    risk_reward,
    confidence,
    reasoning,
    status: 'open',
    pnl: null,
    pnl_pct: null,
    paper: true,
  };

  logTrade({ ...record, type: 'paper_open' });
  return { success: true, position: state.position };
}

export function closePaperTrade(exit_price) {
  if (!state.position) {
    return { error: 'No open position' };
  }

  const pos = state.position;
  const pipSize = 0.1;
  const priceDiff = pos.direction === 'long'
    ? (exit_price - pos.entry)
    : (pos.entry - exit_price);
  const pnl = priceDiff * pos.volume * 100;
  const pnlPct = (pnl / state.balance) * 100;

  state.balance += pnl;
  state.position = null;

  const record = {
    direction: pos.direction,
    entry: pos.entry,
    exit_price,
    volume: pos.volume,
    pnl: Math.round(pnl * 100) / 100,
    pnl_pct: Math.round(pnlPct * 100) / 100,
    risk_reward: pos.risk_reward,
    confidence: pos.confidence,
    status: 'closed',
    paper: true,
    paper_balance: Math.round(state.balance * 100) / 100,
  };

  state.trades.push(record);
  logTrade({ ...record, type: 'paper_close' });

  return {
    success: true,
    pnl: Math.round(pnl * 100) / 100,
    pnl_pct: Math.round(pnlPct * 100) / 100,
    new_balance: Math.round(state.balance * 100) / 100,
  };
}

export function updatePaperPrice(current_price) {
  if (state.position) {
    state.position.current_price = current_price;
  }
  return getAccountSummary();
}

export function getPaperHistory() {
  return state.trades;
}

function calculateUnrealizedPnl(currentPrice) {
  if (!state.position) return 0;
  const pos = state.position;
  const priceDiff = pos.direction === 'long'
    ? (currentPrice - pos.entry)
    : (pos.entry - currentPrice);
  return priceDiff * pos.volume * 100;
}
