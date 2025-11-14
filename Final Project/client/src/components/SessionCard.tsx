import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, QrCode, Edit, Trash2 } from "lucide-react";

interface SessionCardProps {
  id: string;
  name: string;
  type: "checkin" | "checkout";
  isActive: boolean;
  createdAt: string;
  onViewQR: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function SessionCard({
  id,
  name,
  type,
  isActive,
  createdAt,
  onViewQR,
  onEdit,
  onDelete
}: SessionCardProps) {
  return (
    <Card className="hover-elevate">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
        <h3 className="font-semibold text-lg" data-testid={`text-session-name-${id}`}>{name}</h3>
        <Badge variant={isActive ? "default" : "secondary"} data-testid={`badge-status-${id}`}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <QrCode className="w-4 h-4" />
          <span className="capitalize" data-testid={`text-type-${id}`}>{type}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span data-testid={`text-created-${id}`}>{new Date(createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span data-testid={`text-time-${id}`}>{new Date(createdAt).toLocaleTimeString()}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewQR(id)}
          data-testid={`button-view-qr-${id}`}
        >
          <QrCode className="w-4 h-4 mr-1" />
          QR Code
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(id)}
          data-testid={`button-edit-${id}`}
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(id)}
          data-testid={`button-delete-${id}`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
