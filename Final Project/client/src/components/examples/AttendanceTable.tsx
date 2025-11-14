import AttendanceTable from "../AttendanceTable";

export default function AttendanceTableExample() {
  const mockRecords = [
    {
      id: "1",
      employeeName: "John Doe",
      employeeId: "EMP001",
      sessionName: "Morning Check-In",
      checkInTime: new Date(Date.now() - 28800000).toISOString(),
      checkOutTime: new Date(Date.now() - 3600000).toISOString(),
      duration: "7h 0m"
    },
    {
      id: "2",
      employeeName: "Jane Smith",
      employeeId: "EMP002",
      sessionName: "Morning Check-In",
      checkInTime: new Date(Date.now() - 27000000).toISOString(),
      checkOutTime: null,
      duration: null
    },
    {
      id: "3",
      employeeName: "Bob Johnson",
      employeeId: "EMP003",
      sessionName: "Afternoon Check-In",
      checkInTime: new Date(Date.now() - 14400000).toISOString(),
      checkOutTime: new Date(Date.now() - 7200000).toISOString(),
      duration: "2h 0m"
    }
  ];

  return (
    <div className="p-6">
      <AttendanceTable
        records={mockRecords}
        onExportCSV={() => console.log("Export CSV")}
        onExportPDF={() => console.log("Export PDF")}
      />
    </div>
  );
}
