export function calculateTrailingStop({
  direction, entry, current_price, stop_loss, highest_price, lowest_price, activation_pips
}) {
  const pipSize = 0.1;
  const priceDiff = Math.abs(current_price - entry) / pipSize;

  if (direction === 'long') {
    const high = Math.max(highest_price || current_price, current_price);
    const movedFromEntry = (high - entry) / pipSize;

    if (movedFromEntry < activation_pips) {
      return { stop_loss, activated: false };
    }

    const newStop = high - (activation_pips * pipSize);
    return {
      stop_loss: Math.max(newStop, stop_loss),
      activated: true,
      locked_pips: Math.round((high - Math.max(newStop, stop_loss)) / pipSize),
    };
  }

  if (direction === 'short') {
    const low = Math.min(lowest_price || current_price, current_price);
    const movedFromEntry = (entry - low) / pipSize;

    if (movedFromEntry < activation_pips) {
      return { stop_loss, activated: false };
    }

    const newStop = low + (activation_pips * pipSize);
    return {
      stop_loss: Math.min(newStop, stop_loss),
      activated: true,
      locked_pips: Math.round((Math.min(newStop, stop_loss) - low) / pipSize),
    };
  }

  return { stop_loss, activated: false };
}
