import LoginForm from '@/app/_component/auth/LoginForm';

export const metadata = {
  title: 'Login - Pet4u',
  description: 'Sign in to your Pet4u account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <LoginForm />
    </div>
  );
}
