import { AuthForm } from "@/components/auth/AuthForm";
import { login } from "@/app/auth/actions"; // Importa la acción de login

export default function LoginPage() {
  return (
    <div>
      <h2>Iniciar Sesión</h2>
      <AuthForm
        mode="login"
        action={login} // Pasa la Server Action al formulario
      />
    </div>
  );
}