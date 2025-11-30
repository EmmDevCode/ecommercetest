// src/app/login/page.tsx
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthForm } from '@/components/auth/AuthForm';

export default function LoginPage() {
  return (
    <AuthLayout>
      <AuthForm />
    </AuthLayout>
  );
}