import RegisterForm from "../RegisterForm";

export default function RegisterFormExample() {
  return (
    <div className="max-w-md mx-auto p-6">
      <RegisterForm
        onSubmit={(data) => console.log("Register:", data)}
        onSwitchToLogin={() => console.log("Switch to login")}
      />
    </div>
  );
}
