function LoginPage({
  email,
  password,
  setEmail,
  setPassword,
  handleLogin,
  authLoading,
  errorMessage,
}) {
  return (
    <div className="page-center">
      <div className="card login-card">
        <div className="login-logo">K</div>
        <h1>Mini ERP Gạch V1</h1>
        <p className="muted">Đăng nhập để vào hệ thống nội bộ</p>

        <form onSubmit={handleLogin} className="login-form">
          <label>Email</label>
          <input
            type="email"
            placeholder="Nhập email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label>Mật khẩu</label>
          <input
            type="password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {errorMessage && <div className="error-box">{errorMessage}</div>}

          <button type="submit" disabled={authLoading}>
            {authLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;