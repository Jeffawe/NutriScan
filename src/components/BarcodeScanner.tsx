import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import { Barcode, X } from 'lucide-react';

// Retail product barcodes only — restricting formats makes decoding faster and avoids false reads
const PRODUCT_FORMATS = [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
];

const createReader = () => {
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, PRODUCT_FORMATS);
    return new BrowserMultiFormatReader(hints);
};

const BARCODE_PATTERN = /^\d{8}$|^\d{12,14}$/;

/** Returns the barcode found in an image file, or null if there isn't a readable one. */
export const decodeBarcodeFromFile = async (file: File): Promise<string | null> => {
    const url = URL.createObjectURL(file);
    try {
        const result = await createReader().decodeFromImageUrl(url);
        const text = result.getText();
        return BARCODE_PATTERN.test(text) ? text : null;
    } catch {
        return null; // NotFoundException etc. — no barcode in the picture
    } finally {
        URL.revokeObjectURL(url);
    }
};

interface BarcodeScannerProps {
    onDetected: (barcode: string) => void;
    onClose: () => void;
}

/** Full-screen live camera barcode scanner with a manual-entry fallback. */
const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onDetected, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [manualCode, setManualCode] = useState('');

    useEffect(() => {
        let controls: IScannerControls | null = null;
        let cancelled = false;
        let detected = false;

        const start = async () => {
            if (!navigator.mediaDevices?.getUserMedia) {
                setCameraError('Camera access is not available in this browser. Enter the barcode number below.');
                return;
            }
            try {
                controls = await createReader().decodeFromConstraints(
                    { video: { facingMode: 'environment' } },
                    videoRef.current!,
                    (result) => {
                        if (result && !detected && BARCODE_PATTERN.test(result.getText())) {
                            detected = true;
                            controls?.stop();
                            if (navigator.vibrate) navigator.vibrate(100);
                            onDetected(result.getText());
                        }
                    }
                );
                if (cancelled) controls.stop();
            } catch (err) {
                const name = err instanceof Error ? err.name : '';
                setCameraError(
                    name === 'NotAllowedError'
                        ? 'Camera permission was denied. Allow camera access, or enter the barcode number below.'
                        : 'Could not start the camera. Enter the barcode number below.'
                );
            }
        };

        start();
        return () => {
            cancelled = true;
            controls?.stop();
        };
    }, [onDetected]);

    const submitManual = (e: React.FormEvent) => {
        e.preventDefault();
        const digits = manualCode.replace(/\D/g, '');
        if (BARCODE_PATTERN.test(digits)) onDetected(digits);
    };

    const manualValid = BARCODE_PATTERN.test(manualCode.replace(/\D/g, ''));

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Scan barcode">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Barcode size={20} className="text-green-600" />
                        Scan a barcode
                    </h3>
                    <button onClick={onClose} aria-label="Close scanner" className="text-gray-500 hover:text-gray-800">
                        <X size={22} />
                    </button>
                </div>

                {cameraError ? (
                    <p className="m-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-sm text-yellow-800 rounded">{cameraError}</p>
                ) : (
                    <div className="relative bg-black aspect-[4/3]">
                        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                        {/* Aiming guide */}
                        <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-28 border-2 border-green-400 rounded-lg pointer-events-none">
                            <div className="absolute inset-x-2 top-1/2 h-0.5 bg-red-500/80 animate-pulse" />
                        </div>
                        <p className="absolute bottom-2 inset-x-0 text-center text-white text-sm drop-shadow">
                            Point your camera at the product's barcode
                        </p>
                    </div>
                )}

                <form onSubmit={submitManual} className="p-4 flex gap-2">
                    <input
                        type="text"
                        inputMode="numeric"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="Or type the barcode number"
                        className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                    <button
                        type="submit"
                        disabled={!manualValid}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 rounded-lg font-semibold"
                    >
                        Look up
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BarcodeScanner;
