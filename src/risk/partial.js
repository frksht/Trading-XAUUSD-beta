export function calculatePartialTP({
  direction, entry, stop_loss, risk_reward_ratio, tp1_ratio = 1, tp2_ratio, volume = 1
}) {
  const pipSize = 0.1;
  const riskPips = Math.abs(entry - stop_loss) / pipSize;
  const tp1Distance = riskPips * tp1_ratio;

  let tp1, tp2;

  if (direction === 'long') {
    tp1 = entry + (tp1Distance * pipSize);
    tp2 = tp2_ratio ? entry + (riskPips * tp2_ratio * pipSize) : null;
  } else {
    tp1 = entry - (tp1Distance * pipSize);
    tp2 = tp2_ratio ? entry - (riskPips * tp2_ratio * pipSize) : null;
  }

  const tp1Volume = Math.round((volume * 0.5) * 100) / 100;
  const tp2Volume = Math.round((volume * 0.5) * 100) / 100;

  return {
    tp1: Math.round(tp1 * 100) / 100,
    tp1_volume: tp1Volume,
    tp2: tp2 ? Math.round(tp2 * 100) / 100 : null,
    tp2_volume: tp2Volume,
    tp1_ratio,
    tp2_ratio: tp2_ratio || null,
    breakeven_sl: entry,
  };
}
