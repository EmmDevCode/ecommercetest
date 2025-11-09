// src/app/@modal/(...)register/page.tsx
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthForm } from '@/components/auth/AuthForm';

export default function RegisterModal() {
  return (
    <AuthLayout>
      <AuthForm />
    </AuthLayout>
  );
}