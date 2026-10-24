import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { Logo } from "@/components/brand/Logo";

export default function LoginPage() {
  const enabled = !!process.env.ADMIN_PASSWORD;
  return (
    <main className="grid min-h-dvh place-items-center bg-gradient-to-br from-navy-700 to-lake-500 p-6">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-lift">
        <Logo className="mx-auto h-14 w-auto text-lake-400" />
        <h1 className="mt-6 text-center font-display text-2xl text-navy-700">Admin</h1>
        {enabled ? (
          <LoginForm />
        ) : (
          <p className="mt-4 rounded-2xl bg-gold-400/20 p-4 text-sm text-navy-800">
            The admin area is disabled. Set the <code>ADMIN_PASSWORD</code> (and <code>SESSION_SECRET</code>) environment variables in Vercel to enable it.
          </p>
        )}
        <p className="mt-6 text-center text-sm">
          <Link href="/hu" className="font-bold text-navy-600 hover:underline">
            ← Back to the website
          </Link>
        </p>
      </div>
    </main>
  );
}
