function AppLayout({
  profile,
  activePage,
  setActivePage,
  handleLogout,
  errorMessage,
  successMessage,
  children,
}) {
  const menuItems = getMenuItemsByRole(profile?.role);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">K</div>
          <div>
            <h2>Mini ERP</h2>
            <p>Gạch V1</p>
          </div>
        </div>

        <nav className="menu">
          {menuItems.map((item) => (
            <button
              key={item.key}
              className={activePage === item.key ? "menu-item active" : "menu-item"}
              onClick={() => setActivePage(item.key)}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>{getPageTitle(activePage)}</h1>
            <p className="muted">Mini ERP ngành gạch — bản lõi đầu tiên</p>
          </div>

          <div className="user-box">
            <div>
              <strong>{profile?.full_name || profile?.email || "User"}</strong>
              <p>
                {profile?.role || "unknown"} · {profile?.status || "unknown"}
              </p>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>
        </header>

        {errorMessage && <div className="error-box">{errorMessage}</div>}
        {successMessage && <div className="success-box">{successMessage}</div>}

        {children}
      </main>
    </div>
  );
}

function getMenuItemsByRole(role) {
  const baseMenu = [{ key: "dashboard", label: "Dashboard", icon: "📊" }];

  if (["admin", "manager"].includes(role)) {
    baseMenu.push({
      key: "reports",
      label: "Báo cáo",
      icon: "📈",
    });
  }

  if (["admin", "manager", "sales"].includes(role)) {
    baseMenu.push({
      key: "kpi",
      label: "KPI",
      icon: "🎯",
    });
  }

  baseMenu.push(
    { key: "customers", label: "Khách hàng", icon: "👥" },
    { key: "products", label: "Sản phẩm", icon: "🧱" },
    { key: "orders", label: "Đơn hàng", icon: "🧾" }
  );

  if (["admin", "manager", "sales"].includes(role)) {
    baseMenu.push({
      key: "payments",
      label: "Công nợ",
      icon: "💰",
    });
  }

  if (["admin", "manager", "warehouse"].includes(role)) {
    baseMenu.push({
      key: "stock",
      label: "Kho",
      icon: "📦",
    });
  }

  if (["admin", "manager"].includes(role)) {
    baseMenu.push({
      key: "staff",
      label: "Nhân sự",
      icon: "🧑‍💼",
    });
  }

  if (role === "warehouse") {
    return baseMenu.filter((item) =>
      ["dashboard", "products", "orders", "stock"].includes(item.key)
    );
  }

  return baseMenu;
}

function getPageTitle(activePage) {
  const titles = {
    dashboard: "Dashboard",
    reports: "Báo cáo",
    kpi: "KPI",
    customers: "Khách hàng",
    products: "Sản phẩm",
    orders: "Đơn hàng",
    payments: "Công nợ",
    stock: "Kho",
    staff: "Nhân sự",
  };

  return titles[activePage] || "Dashboard";
}

export default AppLayout;