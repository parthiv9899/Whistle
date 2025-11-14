import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8 glow-text">Join Whistle</h1>
        <p className="text-foreground/70 mb-6">
          Your identity stays anonymous. Truth stays visible.
        </p>
        <SignUp />
      </div>
    </div>
  );
}
