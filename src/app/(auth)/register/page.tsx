"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { postJson, saveSession, type AuthUser } from "@/app/lib/auth-client";

interface RegisterResponse {
  user: AuthUser;
  accessToken: string;
  accessTokenExpiresIn: number;
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await postJson<RegisterResponse>("/api/v1/auth/register", {
      email,
      password
    });
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
        <h1>Tạo tài khoản</h1>
        <p className="subtitle">Dùng email của bạn — không cần Facebook.</p>

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
          <label htmlFor="password">Mật khẩu (tối thiểu 8 ký tự)</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Đang tạo..." : "Đăng ký"}
        </button>

        <div className="footer">
          Đã có tài khoản? <Link href="/login">Đăng nhập</Link>
        </div>
      </form>
    </main>
  );
}
