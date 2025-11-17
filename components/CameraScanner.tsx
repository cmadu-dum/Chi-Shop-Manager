import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface CameraScannerProps {
  onScanSuccess: (barcode: string) => void;
  onClose: () => void;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ onScanSuccess, onClose }) => {
  const [error, setError] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasScannedRef = useRef(false);

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          const cameraList = devices.map((device) => ({
            id: device.id,
            label: device.label || `Camera ${device.id}`,
          }));
          setCameras(cameraList);
          const backCamera = devices.find((device) =>
            device.label.toLowerCase().includes('back')
          );
          setSelectedCamera(backCamera?.id || devices[0].id);
        } else {
          setError('No cameras found on this device');
        }
      })
      .catch((err) => {
        console.error('Error getting cameras:', err);
        setError('Unable to access camera. Please check permissions.');
      });

    return () => {
      stopScanning();
    };
  }, []);

  useEffect(() => {
    if (selectedCamera && !isScanning) {
      startScanning(selectedCamera);
    }
  }, [selectedCamera]);

  const startScanning = async (cameraId: string) => {
    try {
      hasScannedRef.current = false;
      const scanner = new Html5Qrcode('camera-preview');
      scannerRef.current = scanner;

      await scanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          if (!hasScannedRef.current) {
            hasScannedRef.current = true;
            onScanSuccess(decodedText);
            stopScanning();
          }
        },
        undefined
      );

      setIsScanning(true);
      setError('');
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      setError(err.message || 'Failed to start camera');
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  const handleClose = async () => {
    await stopScanning();
    onClose();
  };

  const handleCameraSwitch = async (newCameraId: string) => {
    await stopScanning();
    setSelectedCamera(newCameraId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full overflow-hidden shadow-2xl">
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Scan Barcode with Camera</h3>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {cameras.length > 1 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Camera
              </label>
              <select
                value={selectedCamera}
                onChange={(e) => handleCameraSwitch(e.target.value)}
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {cameras.map((camera) => (
                  <option key={camera.id} value={camera.id}>
                    {camera.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="relative bg-black rounded-lg overflow-hidden">
            <div id="camera-preview" className="w-full min-h-[300px]"></div>
            {!isScanning && !error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            )}
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-slate-600">
              Position the barcode within the frame to scan
            </p>
          </div>
        </div>

        <div className="bg-slate-50 p-4 flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraScanner;
