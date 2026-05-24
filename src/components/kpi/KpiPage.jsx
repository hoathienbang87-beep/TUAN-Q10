import { useMemo, useState } from "react";
import { buildSalesKpis } from "../../services/kpiService";
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
} from "../../utils/format";

function KpiPage({
  profile,
  staffProfiles,
  customers,
  activities,
  orders,
  kpiTargets,
  kpiTargetSaving,
  onSaveKpiTarget,
  onReloadKpiTargets,
}) {
  const canViewKpi = ["admin", "manager", "sales"].includes(profile?.role);
  const canManageTargets = ["admin", "manager"].includes(profile?.role);

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthValue());
  const [searchText, setSearchText] = useState("");

  const [targetForm, setTargetForm] = useState({
    sale_id: "",
    target_revenue: "",
    target_customers: "",
    target_activities: "",
    target_orders: "",
    note: "",
  });

  const kpis = useMemo(() => {
    return buildSalesKpis({
      profile,
      staffProfiles,
      customers,
      activities,
      orders,
      kpiTargets,
      selectedMonth,
    });
  }, [profile, staffProfiles, customers, activities, orders, kpiTargets, selectedMonth]);

  const filteredKpis = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) {
      return kpis;
    }

    return kpis.filter((item) => {
      return (
        item.sale_name?.toLowerCase().includes(keyword) ||
        item.sale_email?.toLowerCase().includes(keyword) ||
        item.role?.toLowerCase().includes(keyword)
      );
    });
  }, [kpis, searchText]);

  const summary = useMemo(() => {
    return filteredKpis.reduce(
      (result, item) => {
        result.customer_count += item.customer_count;
        result.activity_count += item.activity_count;
        result.order_count += item.order_count;
        result.completed_order_count += item.completed_order_count;

        result.total_revenue += item.total_revenue;
        result.total_paid += item.total_paid;
        result.total_debt += item.total_debt;

        result.target_revenue += item.target_revenue;
        result.target_customers += item.target_customers;
        result.target_activities += item.target_activities;
        result.target_orders += item.target_orders;

        return result;
      },
      {
        customer_count: 0,
        activity_count: 0,
        order_count: 0,
        completed_order_count: 0,

        total_revenue: 0,
        total_paid: 0,
        total_debt: 0,

        target_revenue: 0,
        target_customers: 0,
        target_activities: 0,
        target_orders: 0,
      }
    );
  }, [filteredKpis]);

  if (!canViewKpi) {
    return (
      <section className="card">
        <div className="empty-state">
          <h3>Không có quyền xem KPI</h3>
          <p>Chỉ admin, manager hoặc sales được xem KPI.</p>
        </div>
      </section>
    );
  }

  function updateTargetField(field, value) {
    setTargetForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function startEditTarget(kpi) {
    setTargetForm({
      sale_id: kpi.sale_id,
      target_revenue: kpi.target_revenue || "",
      target_customers: kpi.target_customers || "",
      target_activities: kpi.target_activities || "",
      target_orders: kpi.target_orders || "",
      note: kpi.target_note || "",
    });
  }

  function resetTargetForm() {
    setTargetForm({
      sale_id: "",
      target_revenue: "",
      target_customers: "",
      target_activities: "",
      target_orders: "",
      note: "",
    });
  }

  async function handleSubmitTarget(event) {
    event.preventDefault();

    const success = await onSaveKpiTarget({
      ...targetForm,
      selectedMonth,
    });

    if (success) {
      resetTargetForm();
      await onReloadKpiTargets();
    }
  }

  return (
    <div className="customer-page-stack">
      <section className="stats-grid">
        <div className="stat-card">
          <p>Doanh số tháng</p>
          <h3>{formatCurrency(summary.total_revenue)}</h3>
          <small>Target: {formatCurrency(summary.target_revenue)}</small>
        </div>

        <div className="stat-card">
          <p>Đã thu</p>
          <h3>{formatCurrency(summary.total_paid)}</h3>
        </div>

        <div className="stat-card">
          <p>Còn nợ</p>
          <h3>{formatCurrency(summary.total_debt)}</h3>
        </div>

        <div className="stat-card">
          <p>Đơn hàng tháng</p>
          <h3>{summary.order_count}</h3>
          <small>Target: {formatNumber(summary.target_orders)}</small>
        </div>
      </section>

      <div className={canManageTargets ? "module-grid paired-panels kpi-layout" : "kpi-layout"}>
        {canManageTargets && (
          <section className="card paired-panel kpi-target-panel">
            <div className="section-header">
              <div>
                <h2>Đặt chỉ tiêu tháng</h2>
                <p className="muted">Áp target cho từng sale theo tháng.</p>
              </div>
            </div>

            <form className="customer-form" onSubmit={handleSubmitTarget}>
              <div className="field">
                <label>Tháng KPI</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                />
              </div>

              <div className="field">
                <label>Sale *</label>
                <select
                  value={targetForm.sale_id}
                  onChange={(event) => updateTargetField("sale_id", event.target.value)}
                  required
                >
                  <option value="">Chọn sale</option>
                  {kpis.map((item) => (
                    <option key={item.sale_id} value={item.sale_id}>
                      {item.sale_name} {item.sale_email ? `- ${item.sale_email}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Doanh số mục tiêu</label>
                <input
                  type="number"
                  min="0"
                  value={targetForm.target_revenue}
                  onChange={(event) =>
                    updateTargetField("target_revenue", event.target.value)
                  }
                  placeholder="VD: 500000000"
                />
              </div>

              <div className="form-grid">
                <div className="field">
                  <label>Khách mới</label>
                  <input
                    type="number"
                    min="0"
                    value={targetForm.target_customers}
                    onChange={(event) =>
                      updateTargetField("target_customers", event.target.value)
                    }
                    placeholder="VD: 30"
                  />
                </div>

                <div className="field">
                  <label>Lượt chăm sóc</label>
                  <input
                    type="number"
                    min="0"
                    value={targetForm.target_activities}
                    onChange={(event) =>
                      updateTargetField("target_activities", event.target.value)
                    }
                    placeholder="VD: 100"
                  />
                </div>

                <div className="field">
                  <label>Đơn hàng</label>
                  <input
                    type="number"
                    min="0"
                    value={targetForm.target_orders}
                    onChange={(event) =>
                      updateTargetField("target_orders", event.target.value)
                    }
                    placeholder="VD: 10"
                  />
                </div>
              </div>

              <div className="field">
                <label>Ghi chú</label>
                <textarea
                  rows={3}
                  value={targetForm.note}
                  onChange={(event) => updateTargetField("note", event.target.value)}
                  placeholder="VD: Target tháng này tập trung khách KTS / dự án..."
                />
              </div>

              <div className="form-actions">
                <button className="primary-btn" type="submit" disabled={kpiTargetSaving}>
                  {kpiTargetSaving ? "Đang lưu..." : "Lưu chỉ tiêu"}
                </button>

                <button className="secondary-btn" type="button" onClick={resetTargetForm}>
                  Xóa form
                </button>
              </div>
            </form>
          </section>
        )}

        <section className={canManageTargets ? "card paired-panel kpi-results-panel" : "card kpi-results-panel"}>
          <div className="section-header">
            <div>
              <h2>KPI tháng</h2>
              <p className="muted">
                So sánh thực tế với chỉ tiêu theo tháng đang chọn.
              </p>
            </div>

            <span className="badge">{selectedMonth}</span>
          </div>

          <div className="info-box">
            <strong>Cách đọc KPI:</strong>
            <p>
              Dữ liệu thực tế lấy theo tháng từ khách hàng, chăm sóc và đơn hàng.
              Chỉ tiêu do admin/manager nhập theo từng sale.
            </p>
          </div>

          <div className="list-toolbar">
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Tìm theo tên sale, email, role..."
            />

            <span className="badge">{filteredKpis.length} dòng</span>
          </div>

          <div className={canManageTargets ? "paired-scroll-body" : ""}>
            <KpiTable
              items={filteredKpis}
              canManageTargets={canManageTargets}
              onEditTarget={startEditTarget}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function KpiTable({ items, canManageTargets, onEditTarget }) {
  if (!items || items.length === 0) {
    return (
      <div className="empty-state">
        <h3>Chưa có dữ liệu KPI</h3>
        <p>Khi có khách hàng, chăm sóc hoặc đơn hàng, KPI sẽ hiện ở đây.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mobile-card-list kpi-mobile-list">
        {items.map((item) => (
          <KpiMobileCard
            key={item.sale_id}
            item={item}
            canManageTargets={canManageTargets}
            onEditTarget={onEditTarget}
          />
        ))}
      </div>

      <div className="table-wrap desktop-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Sale</th>
              <th>Doanh số</th>
              <th>Khách mới</th>
              <th>Chăm sóc</th>
              <th>Đơn hàng</th>
              <th>Đã thu</th>
              <th>Còn nợ</th>
              <th>Chuyển đổi</th>
              <th>Hoàn thành</th>
              <th>Hoạt động gần nhất</th>
              {canManageTargets && <th>Thao tác</th>}
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr key={item.sale_id}>
                <td>
                  <strong>{item.sale_name}</strong>
                  <p className="table-subtext">{item.sale_email || item.role}</p>
                </td>

                <td>
                  <KpiProgress
                    actualText={formatCurrency(item.total_revenue)}
                    targetText={formatCurrency(item.target_revenue)}
                    percent={item.revenue_completion}
                  />
                </td>

                <td>
                  <KpiProgress
                    actualText={formatNumber(item.customer_count)}
                    targetText={formatNumber(item.target_customers)}
                    percent={item.customer_completion}
                  />
                </td>

                <td>
                  <KpiProgress
                    actualText={formatNumber(item.activity_count)}
                    targetText={formatNumber(item.target_activities)}
                    percent={item.activity_completion}
                  />
                </td>

                <td>
                  <KpiProgress
                    actualText={formatNumber(item.order_count)}
                    targetText={formatNumber(item.target_orders)}
                    percent={item.order_completion}
                  />
                </td>

                <td>{formatCurrency(item.total_paid)}</td>

                <td>
                  <strong>{formatCurrency(item.total_debt)}</strong>
                </td>

                <td>
                  <span className={getConversionClass(item.conversion_rate)}>
                    {item.conversion_rate.toFixed(1)}%
                  </span>
                </td>

                <td>
                  <span className={getCompletionClass(item.overall_completion)}>
                    {item.overall_completion.toFixed(1)}%
                  </span>
                </td>

                <td>{formatDateTime(item.latest_activity_at || item.latest_order_at)}</td>

                {canManageTargets && (
                  <td>
                    <button className="mini-btn" onClick={() => onEditTarget(item)}>
                      Sửa target
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function KpiMobileCard({ item, canManageTargets, onEditTarget }) {
  return (
    <article className="mobile-data-card kpi-mobile-card">
      <div className="mobile-card-head">
        <div>
          <h3>{item.sale_name}</h3>
          <p>{item.sale_email || item.role}</p>
        </div>

        <span className={getCompletionClass(item.overall_completion)}>
          {item.overall_completion.toFixed(1)}%
        </span>
      </div>

      <div className="kpi-mobile-progress-list">
        <KpiProgress
          actualText={formatCurrency(item.total_revenue)}
          targetText={formatCurrency(item.target_revenue)}
          percent={item.revenue_completion}
          label="Doanh số"
        />
        <KpiProgress
          actualText={formatNumber(item.customer_count)}
          targetText={formatNumber(item.target_customers)}
          percent={item.customer_completion}
          label="Khách mới"
        />
        <KpiProgress
          actualText={formatNumber(item.activity_count)}
          targetText={formatNumber(item.target_activities)}
          percent={item.activity_completion}
          label="Chăm sóc"
        />
        <KpiProgress
          actualText={formatNumber(item.order_count)}
          targetText={formatNumber(item.target_orders)}
          percent={item.order_completion}
          label="Đơn hàng"
        />
      </div>

      <div className="mobile-card-fields two-cols">
        <div className="mobile-card-field compact">
          <span>Đã thu</span>
          <strong>{formatCurrency(item.total_paid)}</strong>
        </div>
        <div className="mobile-card-field compact">
          <span>Còn nợ</span>
          <strong>{formatCurrency(item.total_debt)}</strong>
        </div>
        <div className="mobile-card-field compact">
          <span>Chuyển đổi</span>
          <strong>{item.conversion_rate.toFixed(1)}%</strong>
        </div>
        <div className="mobile-card-field compact">
          <span>Gần nhất</span>
          <strong>{formatDateTime(item.latest_activity_at || item.latest_order_at)}</strong>
        </div>
      </div>

      {canManageTargets && (
        <button className="mini-btn full-width-btn" onClick={() => onEditTarget(item)}>
          Sửa target
        </button>
      )}
    </article>
  );
}

function KpiProgress({ actualText, targetText, percent, label }) {
  const safePercent = Math.min(Number(percent || 0), 100);

  return (
    <div className="kpi-progress-cell">
      {label && <span className="kpi-progress-label">{label}</span>}
      <div className="kpi-progress-text">
        <strong>{actualText}</strong>
        <span>/ {targetText}</span>
      </div>

      <div className="kpi-progress-track">
        <div
          className="kpi-progress-bar"
          style={{ width: `${safePercent}%` }}
        />
      </div>

      <small>{Number(percent || 0).toFixed(1)}%</small>
    </div>
  );
}

function getConversionClass(value) {
  if (value >= 50) {
    return "status-pill status-won";
  }

  if (value >= 20) {
    return "status-pill status-contacted";
  }

  return "status-pill status-lost";
}

function getCompletionClass(value) {
  if (value >= 100) {
    return "status-pill status-won";
  }

  if (value >= 60) {
    return "status-pill status-contacted";
  }

  return "status-pill status-lost";
}

function getCurrentMonthValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

export default KpiPage;
