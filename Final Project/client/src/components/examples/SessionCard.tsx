import SessionCard from "../SessionCard";

export default function SessionCardExample() {
  return (
    <div className="max-w-sm mx-auto p-6">
      <SessionCard
        id="1"
        name="Morning Check-In"
        type="checkin"
        isActive={true}
        createdAt={new Date().toISOString()}
        onViewQR={(id) => console.log("View QR:", id)}
        onEdit={(id) => console.log("Edit:", id)}
        onDelete={(id) => console.log("Delete:", id)}
      />
    </div>
  );
}
