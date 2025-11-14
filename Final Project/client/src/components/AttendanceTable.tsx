import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface AttendanceRecord {
  id: string;
  employeeName: string;
  employeeId: string;
  sessionName: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  duration: string | null;
}

interface AttendanceTableProps {
  records: AttendanceRecord[];
  onExportCSV: () => void;
  onExportPDF: () => void;
}

export default function AttendanceTable({ records, onExportCSV, onExportPDF }: AttendanceTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Attendance Logs</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onExportCSV} data-testid="button-export-csv">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={onExportPDF} data-testid="button-export-pdf">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Employee ID</TableHead>
              <TableHead>Session</TableHead>
              <TableHead>Check-In</TableHead>
              <TableHead>Check-Out</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No attendance records found
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow key={record.id} data-testid={`row-attendance-${record.id}`}>
                  <TableCell className="font-medium" data-testid={`cell-name-${record.id}`}>
                    {record.employeeName}
                  </TableCell>
                  <TableCell className="font-mono text-sm" data-testid={`cell-empid-${record.id}`}>
                    {record.employeeId}
                  </TableCell>
                  <TableCell data-testid={`cell-session-${record.id}`}>{record.sessionName}</TableCell>
                  <TableCell className="font-mono text-sm" data-testid={`cell-checkin-${record.id}`}>
                    {record.checkInTime ? new Date(record.checkInTime).toLocaleString() : '-'}
                  </TableCell>
                  <TableCell className="font-mono text-sm" data-testid={`cell-checkout-${record.id}`}>
                    {record.checkOutTime ? new Date(record.checkOutTime).toLocaleString() : '-'}
                  </TableCell>
                  <TableCell data-testid={`cell-duration-${record.id}`}>
                    {record.duration || '-'}
                  </TableCell>
                  <TableCell data-testid={`cell-status-${record.id}`}>
                    {record.checkInTime && record.checkOutTime ? (
                      <Badge variant="default">Complete</Badge>
                    ) : record.checkInTime ? (
                      <Badge variant="secondary">Checked In</Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
