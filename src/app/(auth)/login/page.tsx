"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { postJson, saveSession, type AuthUser } from "@/app/lib/auth-client";

interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  accessTokenExpiresIn: number;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await postJson<LoginResponse>("/api/v1/auth/login", { email, password });
    setLoading(false);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    saveSession(result.data.accessToken, result.data.user);
    router.push("/dashboard");
  }

  return (
    <main className="page">
      <form className="card" onSubmit={onSubmit}>
        <h1>Đăng nhập</h1>
        <p className="subtitle">Chào mừng bạn trở lại với BadmintonFinder.</p>

        {error && <div className="alert">{error}</div>}

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="password">Mật khẩu</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        <div className="footer">
          Chưa có tài khoản? <Link href="/register">Đăng ký</Link>
        </div>
      </form>
    </main>
  );
}
