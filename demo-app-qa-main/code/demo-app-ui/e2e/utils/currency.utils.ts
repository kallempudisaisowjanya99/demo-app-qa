/** Money as the UI shows it, e.g. `$1,234.50`. */
export function formatUiCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}
