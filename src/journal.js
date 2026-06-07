import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LOG_DIR = join(__dirname, '..', 'trades', 'logs');
const SESSION_FILE = join(LOG_DIR, 'sessions.ndjson');
const TRADE_FILE = join(LOG_DIR, 'trades.ndjson');

function ensureDir() {
  if (!existsSync(LOG_DIR)) {
    mkdirSync(LOG_DIR, { recursive: true });
  }
}

export function logSession(session) {
  ensureDir();
  const entry = {
    timestamp: new Date().toISOString(),
    type: 'session',
    ...session,
  };
  writeFileSync(SESSION_FILE, JSON.stringify(entry) + '\n', { flag: 'a' });
  return entry;
}

export function logTrade(trade) {
  ensureDir();
  const entry = {
    timestamp: new Date().toISOString(),
    type: 'trade',
    ...trade,
  };
  writeFileSync(TRADE_FILE, JSON.stringify(entry) + '\n', { flag: 'a' });
  return entry;
}

export function readSessions(limit = 50) {
  if (!existsSync(SESSION_FILE)) return [];
  const lines = readFileSync(SESSION_FILE, 'utf-8').trim().split('\n');
  return lines.filter(Boolean).slice(-limit).map(l => JSON.parse(l));
}

export function readTrades(limit = 50) {
  if (!existsSync(TRADE_FILE)) return [];
  const lines = readFileSync(TRADE_FILE, 'utf-8').trim().split('\n');
  return lines.filter(Boolean).slice(-limit).map(l => JSON.parse(l));
}

export function getStats() {
  const trades = readTrades(1000);
  if (trades.length === 0) return { total_trades: 0, win_rate: 0, avg_rr: 0 };

  const wins = trades.filter(t => t.pnl > 0);
  const win_rate = (wins.length / trades.length) * 100;
  const total_rr = trades.reduce((sum, t) => sum + (t.risk_reward || 0), 0);
  const avg_rr = total_rr / trades.length;

  return {
    total_trades: trades.length,
    wins: wins.length,
    losses: trades.length - wins.length,
    win_rate: Math.round(win_rate * 100) / 100,
    avg_rr: Math.round(avg_rr * 100) / 100,
  };
}
