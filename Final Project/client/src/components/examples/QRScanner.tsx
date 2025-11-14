import QRScanner from "../QRScanner";

export default function QRScannerExample() {
  return (
    <div className="max-w-lg mx-auto p-6">
      <QRScanner onScan={(data) => console.log("Scanned:", data)} />
    </div>
  );
}
