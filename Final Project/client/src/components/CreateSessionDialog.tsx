import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface CreateSessionDialogProps {
  onCreateSession: (data: { name: string; type: "checkin" | "checkout" }) => void;
}

export default function CreateSessionDialog({ onCreateSession }: CreateSessionDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<"checkin" | "checkout">("checkin");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateSession({ name, type });
    setName("");
    setType("checkin");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-create-session">
          <Plus className="w-4 h-4 mr-2" />
          Create Session
        </Button>
      </DialogTrigger>
      <DialogContent data-testid="dialog-create-session">
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
          <DialogDescription>
            Create a new attendance session with a unique QR code
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sessionName" data-testid="label-session-name">Session Name</Label>
            <Input
              id="sessionName"
              placeholder="e.g., Morning Check-In"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              data-testid="input-session-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sessionType" data-testid="label-session-type">Type</Label>
            <Select value={type} onValueChange={(value: "checkin" | "checkout") => setType(value)}>
              <SelectTrigger id="sessionType" data-testid="select-session-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checkin">Check-In</SelectItem>
                <SelectItem value="checkout">Check-Out</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button type="submit" data-testid="button-submit">
              Create Session
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
