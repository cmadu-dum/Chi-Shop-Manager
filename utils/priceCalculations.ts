export function calculateWeightedAverage(
  currentStock: number,
  currentAvgCost: number,
  addedQuantity: number,
  newPurchasePrice: number
): number {
  if (currentStock === 0) {
    return newPurchasePrice;
  }

  const currentValue = currentStock * currentAvgCost;
  const addedValue = addedQuantity * newPurchasePrice;
  const totalValue = currentValue + addedValue;
  const totalQuantity = currentStock + addedQuantity;

  return totalQuantity > 0 ? totalValue / totalQuantity : 0;
}

export function calculateProfitMargin(sellingPrice: number, costPrice: number): number {
  if (sellingPrice === 0) return 0;
  return ((sellingPrice - costPrice) / sellingPrice) * 100;
}

export function adjustSellingPriceByMargin(
  newCostPrice: number,
  targetMarginPercent: number
): number {
  return newCostPrice / (1 - targetMarginPercent / 100);
}
