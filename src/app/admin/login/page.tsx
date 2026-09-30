"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { request, Notice } from "@/components/admin/helpers";
export default function Login() {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <main className="login-page">
      <div className="login-panel">
        <Link className="wordmark" href="/">
          VAIDORA<span>OWNER STUDIO</span>
        </Link>
        <h1>Welcome back.</h1>
        <p>Sign in to manage your fragrance catalog.</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setMessage("");
            try {
              await request("/api/admin/session", { email, password });
              router.push("/admin");
              router.refresh();
            } catch (e) {
              setMessage((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          <Notice message={message} />
          <button className="button full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <Link className="text-link" href="/">
          Back to storefront
        </Link>
      </div>
    </main>
  );
}
