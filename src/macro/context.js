export const MACRO_RULES = {
  dxy: {
    bullish_bias: 'bearish',
    bearish_bias: 'bullish',
    rule: 'If DXY is strongly bullish, bias XAUUSD bearish. If DXY is weakening, bias XAUUSD bullish.',
  },
  us10y: {
    rising_bias: 'bearish',
    falling_bias: 'bullish',
    rule: 'Rising US10Y yields are bearish pressure on Gold. Falling yields support Gold.',
  },
};

export function determineBiasFromMacro({ dxy_trend, us10y_trend }) {
  const signals = [];

  if (dxy_trend === 'bullish') signals.push('bearish');
  else if (dxy_trend === 'bearish') signals.push('bullish');

  if (us10y_trend === 'rising') signals.push('bearish');
  else if (us10y_trend === 'falling') signals.push('bullish');

  if (signals.length === 0) return 'neutral';

  const bullish = signals.filter(s => s === 'bullish').length;
  const bearish = signals.filter(s => s === 'bearish').length;

  if (bullish > bearish) return 'bullish';
  if (bearish > bullish) return 'bearish';
  return 'neutral';
}

export function getMacroSummary({ dxy_trend, dxy_momentum, us10y_trend }) {
  const sections = [];

  if (dxy_trend && dxy_momentum) {
    sections.push(`DXY is ${dxy_trend} with ${dxy_momentum} momentum`);
  }
  if (us10y_trend) {
    sections.push(`US10Y yields are ${us10y_trend}`);
  }

  if (sections.length === 0) return 'No macro data available.';
  return sections.join('. ') + '.';
}
