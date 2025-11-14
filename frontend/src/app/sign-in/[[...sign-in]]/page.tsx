import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8 glow-text">Welcome to Whistle</h1>
        <SignIn />
      </div>
    </div>
  );
}
