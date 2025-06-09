import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = () => {
  const [scannedData, setScannedData] = useState(null);
  const [scanStatus, setScanStatus] = useState(''); // To show status messages
  const [residentInfo, setResidentInfo] = useState(null); // To store resident data

  const onScanSuccess = async (decodedText) => {
    try {
      setScanStatus('Verifying...');
      setScannedData(decodedText);
      
      const response = await axios.post(
        'http://localhost:5001/api/scanner/verify',
        { qrData: decodedText }
      );
      
      if (response.data.success) {
        // etScanStatus('Verification successful!');
        const action = response.data.action === 'enter' ? 'Welcome!' : 'Goodbye!';
        setScanStatus(`${action} (${response.data.message})`);
        setResidentInfo(response.data.resident);
      } else {
        setScanStatus('Verification failed');
      }
    } catch (error) {
      console.error("Error in QRScanner:", error);
      let errorMessage = 'Error verifying QR code';
      
      if (error.response) {
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
        if (error.response.status === 401) {
          errorMessage = 'Unauthorized - Please login again';
        }
        if (error.response.status === 404) {
          errorMessage = 'Resident not found';
        }
      }
      
      setScanStatus(errorMessage);
      setResidentInfo(null);
    }
  };

  const onScanError = (errorMessage) => {
    console.warn(`QR Scan error: ${errorMessage}`);
    setScanStatus(`Scan error: ${errorMessage}`);
  };

  useEffect(() => {
    let scanner;
  
    const initializeScanner = () => {
      scanner = new Html5QrcodeScanner('qr-reader', {
        fps: 10,
        qrbox: 250,
      });
  
      scanner.render(onScanSuccessWrapper, onScanError);
    };
  
    const onScanSuccessWrapper = async (decodedText, decodedResult) => {
      await onScanSuccess(decodedText);
  
      // Clear and reinitialize the scanner after a short delay
      scanner.clear().then(() => {
        setTimeout(() => {
          initializeScanner();
        }, 1500); // Adjust delay if needed
      }).catch((err) => {
        console.error("Failed to clear scanner:", err);
      });
    };
  
    initializeScanner();
  
    return () => {
      if (scanner) {
        scanner.clear().catch((err) => console.error("Error clearing scanner on unmount", err));
      }
    };
  }, []);
  

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white border border-gray-300 rounded-md shadow-md p-8">
        <h2 className="text-xl font-serif font-bold text-gray-800 text-center mb-6">
          QR Code Scanner
        </h2>
  
        <div
          id="qr-reader"
          className="border border-gray-400 rounded-sm p-2 bg-gray-50 font-serif"
          style={{ width: '100%' }}
        ></div>
  
        <div className="mt-6 text-sm text-gray-700 font-serif">
          {scanStatus && (
            <p className={`mb-3 p-3 border rounded text-center ${
              scanStatus.includes('Welcome') ? 'bg-green-50 border-green-300 text-green-700' :
              scanStatus.includes('Goodbye') ? 'bg-yellow-50 border-yellow-300 text-yellow-700' :
              scanStatus.includes('failed') || scanStatus.includes('error') ? 'bg-red-50 border-red-300 text-red-700' :
              'bg-gray-50 border-gray-300 text-gray-600'
            }`}>
              <strong>Status:</strong> {scanStatus}
            </p>
          )}
  
          {scannedData && (
            <p className="mb-2"><strong>Scanned Data:</strong> {scannedData}</p>
          )}
  
          {residentInfo && (
            <div className="mt-4 border border-gray-300 rounded p-4 bg-gray-50">
              <h3 className="font-semibold text-gray-800 mb-2">Resident Information</h3>
              <ul className="space-y-1">
                <li><strong>Name:</strong> {residentInfo.userId?.name}</li>
                <li><strong>Resident ID:</strong> {residentInfo.residentId}</li>
                <li><strong>Apartment:</strong> {residentInfo.apartment?.apartment_name}</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
};

export default QRScanner;