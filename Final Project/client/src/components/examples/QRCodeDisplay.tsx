import QRCodeDisplay from "../QRCodeDisplay";

export default function QRCodeDisplayExample() {
  const expiresAt = Date.now() + 300000;
  
  return (
    <div className="max-w-md mx-auto p-6">
      <QRCodeDisplay
        sessionId="abc123-def456-ghi789"
        sessionName="Morning Attendance"
        type="checkin"
        expiresAt={expiresAt}
        onRegenerate={() => console.log("Regenerate QR")}
      />
    </div>
  );
}
