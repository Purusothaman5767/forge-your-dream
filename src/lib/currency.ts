const EXCHANGE_RATE = 80;
const SYMBOL = '₹';

export function toINR(usd: number): number {
  return usd * EXCHANGE_RATE;
}

export function formatPrice(usd: number): string {
  return `${SYMBOL}${toINR(usd).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPriceRaw(usd: number): string {
  return toINR(usd).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export { SYMBOL, EXCHANGE_RATE };
