import { useState } from "react";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function handleSelectPage(pageKey) {
    setActivePage(pageKey);
    setIsMobileMenuOpen(false);
  }

  function handleMobileLogout() {
    setIsMobileMenuOpen(false);
    handleLogout();
  }

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
              onClick={() => handleSelectPage(item.key)}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button
            className="hamburger-btn"
            type="button"
            aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((current) => !current)}
          >
            <span />
            <span />
            <span />
          </button>

          <div className="topbar-title">
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

        {isMobileMenuOpen && (
          <button
            className="mobile-menu-backdrop"
            type="button"
            aria-label="Đóng menu"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <aside
          className={isMobileMenuOpen ? "mobile-drawer open" : "mobile-drawer"}
          aria-hidden={!isMobileMenuOpen}
        >
          <div className="mobile-drawer-head">
            <div className="brand">
              <div className="brand-icon">K</div>
              <div>
                <h2>Mini ERP</h2>
                <p>Gáº¡ch V1</p>
              </div>
            </div>

            <button
              className="drawer-close-btn"
              type="button"
              aria-label="Đóng menu"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              ×
            </button>
          </div>

          <nav className="menu mobile-drawer-menu">
            {menuItems.map((item) => (
              <button
                key={item.key}
                className={activePage === item.key ? "menu-item active" : "menu-item"}
                onClick={() => handleSelectPage(item.key)}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mobile-drawer-user">
            <strong>{profile?.full_name || profile?.email || "User"}</strong>
            <p>
              {profile?.role || "unknown"} · {profile?.status || "unknown"}
            </p>
            <button className="logout-btn" onClick={handleMobileLogout}>
              Đăng xuất
            </button>
          </div>
        </aside>

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
