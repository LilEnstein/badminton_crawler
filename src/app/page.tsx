import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page">
      <div className="card">
        <h1>BadmintonFinder</h1>
        <p className="subtitle">Tìm buổi giao lưu cầu lông phù hợp trình độ của bạn.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Link href="/login" className="btn" style={{ textAlign: "center" }}>
            Đăng nhập
          </Link>
          <Link href="/register" className="btn btn-secondary" style={{ textAlign: "center" }}>
            Tạo tài khoản
          </Link>
        </div>
        <div className="footer">
          Không yêu cầu quyền Facebook — chỉ email của bạn.
        </div>
      </div>
    </main>
  );
}
