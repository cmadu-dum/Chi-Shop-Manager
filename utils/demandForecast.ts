import { Product, Transaction } from '../types';
import { startOfDay, subDays, isAfter, differenceInDays } from 'date-fns';

export interface ProductDemand {
  product: Product;
  totalSold: number;
  salesCount: number;
  avgQuantityPerSale: number;
  salesLast7Days: number;
  salesLast30Days: number;
  dailyAvgSales: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  daysUntilStockout: number | null;
  restockPriority: 'critical' | 'high' | 'medium' | 'low';
  restockSuggestion: number;
  totalRevenue: number;
  profitMargin: number;
  demandScore: number;
}

export function calculateProductDemand(
  products: Product[],
  transactions: Transaction[]
): ProductDemand[] {
  const now = new Date();
  const sevenDaysAgo = startOfDay(subDays(now, 7));
  const thirtyDaysAgo = startOfDay(subDays(now, 30));

  const productDemands = products.map((product) => {
    const productSales = transactions.filter(
      (t) => t.type === 'sale' && t.productId === product.id
    );

    const totalSold = productSales.reduce((sum, t) => sum + (t.quantity || 0), 0);
    const salesCount = productSales.length;
    const avgQuantityPerSale = salesCount > 0 ? totalSold / salesCount : 0;

    const salesLast7Days = productSales
      .filter((t) => isAfter(new Date(t.date), sevenDaysAgo))
      .reduce((sum, t) => sum + (t.quantity || 0), 0);

    const salesLast30Days = productSales
      .filter((t) => isAfter(new Date(t.date), thirtyDaysAgo))
      .reduce((sum, t) => sum + (t.quantity || 0), 0);

    const oldestSaleDate = productSales.length > 0
      ? new Date(Math.min(...productSales.map((t) => new Date(t.date).getTime())))
      : null;

    const daysSinceFirstSale = oldestSaleDate
      ? differenceInDays(now, oldestSaleDate)
      : 0;

    const dailyAvgSales = daysSinceFirstSale > 0 ? totalSold / daysSinceFirstSale : 0;

    const recentDailySales = salesLast7Days / 7;
    const olderDailySales = salesLast30Days > salesLast7Days
      ? (salesLast30Days - salesLast7Days) / 23
      : 0;

    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
    if (recentDailySales > olderDailySales * 1.2) {
      trend = 'increasing';
    } else if (recentDailySales < olderDailySales * 0.8) {
      trend = 'decreasing';
    }

    const daysUntilStockout = recentDailySales > 0
      ? Math.floor(product.stock / recentDailySales)
      : null;

    let restockPriority: 'critical' | 'high' | 'medium' | 'low' = 'low';
    if (daysUntilStockout !== null) {
      if (daysUntilStockout <= 3) {
        restockPriority = 'critical';
      } else if (daysUntilStockout <= 7) {
        restockPriority = 'high';
      } else if (daysUntilStockout <= 14) {
        restockPriority = 'medium';
      }
    } else if (product.stock === 0 && salesCount > 0) {
      restockPriority = 'critical';
    }

    const restockSuggestion = Math.max(
      Math.ceil(dailyAvgSales * 14),
      Math.ceil(recentDailySales * 14),
      5
    );

    const totalRevenue = productSales.reduce((sum, t) => sum + t.amount, 0);
    const profitMargin = product.sellingPrice > 0
      ? ((product.sellingPrice - (product.weightedAvgCost || product.purchasePrice)) / product.sellingPrice) * 100
      : 0;

    const demandScore = calculateDemandScore(
      salesLast7Days,
      salesLast30Days,
      trend,
      profitMargin,
      totalRevenue
    );

    return {
      product,
      totalSold,
      salesCount,
      avgQuantityPerSale,
      salesLast7Days,
      salesLast30Days,
      dailyAvgSales,
      trend,
      daysUntilStockout,
      restockPriority,
      restockSuggestion,
      totalRevenue,
      profitMargin,
      demandScore,
    };
  });

  return productDemands.sort((a, b) => b.demandScore - a.demandScore);
}

function calculateDemandScore(
  salesLast7Days: number,
  salesLast30Days: number,
  trend: 'increasing' | 'stable' | 'decreasing',
  profitMargin: number,
  totalRevenue: number
): number {
  let score = 0;

  score += salesLast7Days * 10;
  score += salesLast30Days * 2;

  if (trend === 'increasing') {
    score *= 1.5;
  } else if (trend === 'decreasing') {
    score *= 0.7;
  }

  score += profitMargin * 2;
  score += totalRevenue * 0.01;

  return Math.round(score);
}

export function getRestockRecommendations(demands: ProductDemand[]): {
  prioritize: ProductDemand[];
  deprioritize: ProductDemand[];
} {
  const prioritize = demands.filter(
    (d) =>
      d.restockPriority === 'critical' ||
      d.restockPriority === 'high' ||
      (d.demandScore > 100 && d.salesLast7Days > 0)
  );

  const deprioritize = demands.filter(
    (d) =>
      d.salesLast30Days === 0 ||
      (d.trend === 'decreasing' && d.salesLast7Days < 2) ||
      (d.product.stock > d.restockSuggestion * 2)
  );

  return { prioritize, deprioritize };
}
