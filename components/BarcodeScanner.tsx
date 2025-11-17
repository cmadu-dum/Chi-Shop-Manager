import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types';

interface BarcodeScannerProps {
  products: Product[];
  onProductScanned: (product: Product) => void;
  onError: (error: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ products, onProductScanned, onError }) => {
  const [scanBuffer, setScanBuffer] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const scanTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (scanBuffer.trim()) {
          handleBarcodeScan(scanBuffer.trim());
          setScanBuffer('');
        }
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const activeElement = document.activeElement as HTMLElement;
        const isInputFocused =
          activeElement?.tagName === 'INPUT' ||
          activeElement?.tagName === 'TEXTAREA' ||
          activeElement?.isContentEditable;

        if (!isInputFocused) {
          e.preventDefault();
          setIsScanning(true);
          setScanBuffer(prev => prev + e.key);

          if (scanTimeout.current) {
            clearTimeout(scanTimeout.current);
          }

          scanTimeout.current = setTimeout(() => {
            setScanBuffer('');
            setIsScanning(false);
          }, 100);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (scanTimeout.current) {
        clearTimeout(scanTimeout.current);
      }
    };
  }, [scanBuffer]);

  const handleBarcodeScan = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode);

    if (product) {
      if (product.stock <= 0) {
        onError(`Product "${product.name}" is out of stock`);
      } else {
        onProductScanned(product);
      }
    } else {
      onError(`No product found with barcode: ${barcode}`);
    }

    setIsScanning(false);
  };

  return (
    <div className={`fixed bottom-4 right-4 transition-opacity duration-200 ${isScanning ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <div className="animate-pulse">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        </div>
        <span className="text-sm font-medium">Scanning: {scanBuffer}</span>
      </div>
    </div>
  );
};

export default BarcodeScanner;
