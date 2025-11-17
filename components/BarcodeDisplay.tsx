import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeDisplayProps {
  value: string;
  productName: string;
  displayValue?: boolean;
  width?: number;
  height?: number;
  format?: string;
}

const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({
  value,
  productName,
  displayValue = true,
  width = 2,
  height = 100,
  format = 'CODE128'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: format,
          width: width,
          height: height,
          displayValue: displayValue,
          fontSize: 14,
          margin: 10
        });
      } catch (error) {
        console.error('Error generating barcode:', error);
      }
    }
  }, [value, displayValue, width, height, format]);

  const handleDownloadPNG = () => {
    if (!canvasRef.current || !svgRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const img = new Image();
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height + 60;

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.fillText(productName, canvas.width / 2, 25);

      ctx.drawImage(img, 0, 40);

      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement('a');
          link.download = `barcode-${productName.replace(/\s+/g, '-')}-${value}.png`;
          link.href = URL.createObjectURL(blob);
          link.click();
        }
      });

      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  const handleDownloadSVG = () => {
    if (!svgRef.current) return;

    const svgElement = svgRef.current.cloneNode(true) as SVGSVGElement;

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '50%');
    text.setAttribute('y', '20');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '16');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('fill', 'black');
    text.textContent = productName;

    svgElement.insertBefore(text, svgElement.firstChild);

    const currentViewBox = svgElement.getAttribute('viewBox');
    if (currentViewBox) {
      const [x, y, w, h] = currentViewBox.split(' ').map(Number);
      svgElement.setAttribute('viewBox', `${x} ${y - 30} ${w} ${h + 30}`);
    }

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = `barcode-${productName.replace(/\s+/g, '-')}-${value}.svg`;
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !svgRef.current) return;

    const svgData = new XMLSerializer().serializeToString(svgRef.current);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Barcode - ${productName}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            h2 {
              margin: 0 0 20px 0;
              font-family: Arial, sans-serif;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <h2>${productName}</h2>
          ${svgData}
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 100);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="barcode-display">
      <svg ref={svgRef}></svg>
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

      <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={handleDownloadPNG}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Download PNG
        </button>
        <button
          onClick={handleDownloadSVG}
          style={{
            padding: '8px 16px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Download SVG
        </button>
        <button
          onClick={handlePrint}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Print
        </button>
      </div>
    </div>
  );
};

export default BarcodeDisplay;
