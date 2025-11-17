import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export interface ImportedProduct {
  name: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  status: 'new' | 'update' | 'error';
  errorMessage?: string;
  existingProductId?: string;
}

export interface ParseResult {
  success: boolean;
  products: ImportedProduct[];
  errors: string[];
}

interface RawImportRow {
  name?: string;
  productName?: string;
  product?: string;
  purchasePrice?: number;
  purchase_price?: number;
  cost?: number;
  sellingPrice?: number;
  selling_price?: number;
  price?: number;
  stock?: number;
  quantity?: number;
  [key: string]: any;
}

function normalizeColumnName(key: string): string {
  return key.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

function extractValue(row: RawImportRow, possibleKeys: string[]): any {
  const normalizedRow: { [key: string]: any } = {};

  for (const key in row) {
    normalizedRow[normalizeColumnName(key)] = row[key];
  }

  for (const key of possibleKeys) {
    const normalizedKey = normalizeColumnName(key);
    if (normalizedRow[normalizedKey] !== undefined && normalizedRow[normalizedKey] !== null && normalizedRow[normalizedKey] !== '') {
      return normalizedRow[normalizedKey];
    }
  }

  return undefined;
}

function parseRow(row: RawImportRow, index: number): ImportedProduct {
  const name = extractValue(row, ['name', 'productName', 'product', 'productname', 'item', 'itemname']);
  const purchasePrice = extractValue(row, ['purchasePrice', 'purchase_price', 'cost', 'purchaseprice', 'buyprice']);
  const sellingPrice = extractValue(row, ['sellingPrice', 'selling_price', 'price', 'sellingprice', 'sellprice', 'saleprice']);
  const stock = extractValue(row, ['stock', 'quantity', 'qty', 'amount']);

  const errors: string[] = [];

  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push('Product name is required');
  }

  if (purchasePrice === undefined || purchasePrice === null || isNaN(Number(purchasePrice)) || Number(purchasePrice) < 0) {
    errors.push('Valid purchase price is required');
  }

  if (sellingPrice === undefined || sellingPrice === null || isNaN(Number(sellingPrice)) || Number(sellingPrice) < 0) {
    errors.push('Valid selling price is required');
  }

  if (stock === undefined || stock === null || isNaN(Number(stock)) || Number(stock) < 0 || !Number.isInteger(Number(stock))) {
    errors.push('Valid stock quantity (whole number) is required');
  }

  if (errors.length > 0) {
    return {
      name: name ? String(name).trim() : `Row ${index + 1}`,
      purchasePrice: 0,
      sellingPrice: 0,
      stock: 0,
      status: 'error',
      errorMessage: errors.join('; ')
    };
  }

  return {
    name: String(name).trim(),
    purchasePrice: Number(purchasePrice),
    sellingPrice: Number(sellingPrice),
    stock: Number(stock),
    status: 'new'
  };
}

export async function parseExcelFile(file: File): Promise<ParseResult> {
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });

    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData: RawImportRow[] = XLSX.utils.sheet_to_json(firstSheet);

    if (jsonData.length === 0) {
      return {
        success: false,
        products: [],
        errors: ['The file is empty or has no valid data']
      };
    }

    const products = jsonData.map((row, index) => parseRow(row, index));

    return {
      success: true,
      products,
      errors: []
    };
  } catch (error) {
    return {
      success: false,
      products: [],
      errors: [`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

export async function parseCSVFile(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const jsonData = results.data as RawImportRow[];

          if (jsonData.length === 0) {
            resolve({
              success: false,
              products: [],
              errors: ['The CSV file is empty or has no valid data']
            });
            return;
          }

          const products = jsonData.map((row, index) => parseRow(row, index));

          resolve({
            success: true,
            products,
            errors: []
          });
        } catch (error) {
          resolve({
            success: false,
            products: [],
            errors: [`Failed to parse CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`]
          });
        }
      },
      error: (error) => {
        resolve({
          success: false,
          products: [],
          errors: [`Failed to parse CSV file: ${error.message}`]
        });
      }
    });
  });
}

export async function parseImportFile(file: File): Promise<ParseResult> {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  if (fileExtension === 'csv') {
    return parseCSVFile(file);
  } else if (['xlsx', 'xls', 'xlsm'].includes(fileExtension || '')) {
    return parseExcelFile(file);
  } else {
    return {
      success: false,
      products: [],
      errors: ['Unsupported file format. Please upload a CSV or Excel file (.csv, .xlsx, .xls)']
    };
  }
}
