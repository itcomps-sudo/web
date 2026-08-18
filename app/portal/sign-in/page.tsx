"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("That email and password don't match an account. Please try again.");
      return;
    }
    router.push("/portal");
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-display text-3xl font-semibold text-ink">Sign In</h1>
      <p className="mt-3 text-lg text-ink/80">
        Sign in to see your plan, your computer, and get help.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="block text-lg font-medium text-ink" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-lg border border-mist px-4 py-3 text-lg"
            required
          />
        </div>
        <div>
          <label className="block text-lg font-medium text-ink" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-lg border border-mist px-4 py-3 text-lg"
            required
          />
        </div>
        {error && <p className="text-clay">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-full bg-ink px-6 py-4 text-lg font-semibold text-paper hover:bg-ink/90"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
