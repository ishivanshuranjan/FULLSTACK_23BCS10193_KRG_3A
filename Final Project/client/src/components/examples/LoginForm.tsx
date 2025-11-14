import LoginForm from "../LoginForm";

export default function LoginFormExample() {
  return (
    <div className="max-w-md mx-auto p-6">
      <LoginForm
        onSubmit={(email, password) => console.log("Login:", email, password)}
        onSwitchToRegister={() => console.log("Switch to register")}
      />
    </div>
  );
}
