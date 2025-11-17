export function generateUniqueBarcode(): string {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const barcode = `${timestamp.slice(-8)}${random}`;
  return barcode.slice(0, 12);
}

export function generateEAN13Barcode(): string {
  let barcode = '';
  for (let i = 0; i < 12; i++) {
    barcode += Math.floor(Math.random() * 10);
  }

  let oddSum = 0;
  let evenSum = 0;

  for (let i = 0; i < 12; i++) {
    const digit = parseInt(barcode[i]);
    if (i % 2 === 0) {
      oddSum += digit;
    } else {
      evenSum += digit;
    }
  }

  const total = oddSum + (evenSum * 3);
  const checkDigit = (10 - (total % 10)) % 10;

  return barcode + checkDigit;
}

export function isValidBarcode(barcode: string | undefined): boolean {
  if (!barcode) return false;
  return barcode.length >= 8 && /^\d+$/.test(barcode);
}
