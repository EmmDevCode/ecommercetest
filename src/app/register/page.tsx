import { AuthForm } from "@/components/auth/AuthForm";
import { register } from "@/app/auth/actions"; // Importa la acción de registro

export default function RegisterPage() {
  return (
    <div>
      <h2>Crear Cuenta</h2>
      <AuthForm
        mode="register"
        action={register} // Pasa la Server Action al formulario
      />
    </div>
  );
}