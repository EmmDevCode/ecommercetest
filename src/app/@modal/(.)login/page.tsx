// src/app/@modal/(...)login/page.tsx
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthForm } from '@/components/auth/AuthForm';

export default function LoginModal() {
  return (
    <AuthLayout>
      <AuthForm />
    </AuthLayout>
  );
}