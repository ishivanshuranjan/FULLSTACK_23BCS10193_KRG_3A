import CreateSessionDialog from "../CreateSessionDialog";

export default function CreateSessionDialogExample() {
  return (
    <div className="p-6">
      <CreateSessionDialog
        onCreateSession={(data) => console.log("Create session:", data)}
      />
    </div>
  );
}
