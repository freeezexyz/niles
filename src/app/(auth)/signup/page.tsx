"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);
  const router = useRouter();

  function getSupabase() {
    return createClient();
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await getSupabase().auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setConfirmSent(true);
      setLoading(false);
    }
  }

  if (confirmSent) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="text-center">
          <h1 className="font-display text-2xl font-bold text-gradient-gold">
            NILES
          </h1>
          <CardTitle className="text-lg">Check your email</CardTitle>
          <CardDescription className="text-[var(--text-muted)]">
            We sent a confirmation link to{" "}
            <strong className="text-foreground">{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link href="/login">
            <Button variant="ghost" className="text-gold-500 hover:text-gold-400">
              Back to login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="text-center space-y-2">
        <h1 className="font-display text-3xl font-bold text-gradient-gold">
          NILES
        </h1>
        <p className="text-xs text-[var(--text-muted)] tracking-wide uppercase">
          Powered by The Pharaoh&apos;s Pitch
        </p>
        <CardTitle className="text-lg pt-2">Create your account</CardTitle>
        <CardDescription className="text-[var(--text-muted)]">
          Start your journey with ancient sales wisdom
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="bg-[var(--input)]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-[var(--input)]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-[var(--input)]"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button
            type="submit"
            className="w-full bg-gold-500 text-background hover:bg-gold-600 font-semibold"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <p className="text-sm text-[var(--text-muted)]">
          Already have an account?{" "}
          <Link href="/login" className="text-gold-500 hover:text-gold-400 font-medium">
            Sign in
          </Link>
        </p>
        <p className="text-xs text-[var(--text-faint)] text-center">
          by Ivan Yong
        </p>
      </CardFooter>
    </Card>
  );
}
