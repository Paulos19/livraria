import RegisterForm from "./registerForm";

export default function RegisterPageContainer() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4 md:p-8">
      <RegisterForm />
    </div>
  );
}