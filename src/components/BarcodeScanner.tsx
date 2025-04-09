import { useZxing } from 'react-zxing';
import { useState } from 'react';
import { XMarkIcon, CameraIcon } from '@heroicons/react/24/outline';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [error, setError] = useState<string | null>(null);
  
  const { ref } = useZxing({
    onDecodeResult(result) {
      const barcode = result.getText();
      onScan(barcode);
    },
    onError(error) {
      setError('Failed to access camera. Please make sure you have granted camera permissions.');
    },
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Scan Barcode
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="relative aspect-[4/3] bg-black">
          <video
            ref={ref}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 border-2 border-blue-500/50 pointer-events-none">
            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-blue-500"></div>
            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-blue-500"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-blue-500"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-blue-500"></div>
          </div>
        </div>

        <div className="p-4">
          {error ? (
            <div className="text-red-500 text-sm flex items-center gap-2">
              <CameraIcon className="w-5 h-5" />
              {error}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Position the barcode within the frame to scan
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 