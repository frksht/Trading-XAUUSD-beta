export function calculatePositionSize({
  account_balance, risk_percent = 1, entry, stop_loss, instrument = 'XAUUSD'
}) {
  const riskAmount = account_balance * (risk_percent / 100);
  const pipSize = 0.1;
  const stopDistancePips = Math.abs(entry - stop_loss) / pipSize;

  if (stopDistancePips <= 0) {
    return { error: 'Stop loss distance must be greater than 0.', volume: 0, risk_amount: 0 };
  }

  const volume = Math.round((riskAmount / stopDistancePips) * 100) / 100;

  return {
    account_balance,
    risk_percent,
    risk_amount: Math.round(riskAmount * 100) / 100,
    stop_distance_pips: Math.round(stopDistancePips * 100) / 100,
    volume: Math.max(volume, 0.01),
    instrument,
  };
}

export function calculateRR({ entry, stop_loss, take_profit }) {
  const risk = Math.abs(entry - stop_loss);
  const reward = Math.abs(take_profit - entry);

  if (risk === 0) return { ratio: 0, valid: false };

  const ratio = Math.round((reward / risk) * 100) / 100;
  return {
    ratio,
    valid: ratio >= 2,
    min_required: 2,
  };
}
