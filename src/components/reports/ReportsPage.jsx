import { buildReports } from "../../services/reportService";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  getCustomerStatusLabel,
  getOrderStatusLabel,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from "../../utils/format";

function ReportsPage({ profile, customers, orders, products, payments, activities }) {
  const canViewReports = ["admin", "manager"].includes(profile?.role);

  if (!canViewReports) {
    return (
      <section className="card">
        <div className="empty-state">
          <h3>Không có quyền xem báo cáo</h3>
          <p>Chỉ admin hoặc manager được xem báo cáo quản lý.</p>
        </div>
      </section>
    );
  }

  const reports = buildReports({
    customers,
    orders,
    products,
    payments,
    activities,
  });

  return (
    <div className="customer-page-stack">
      <section className="stats-grid">
        <div className="stat-card">
          <p>Tổng giá trị đơn</p>
          <h3>{formatCurrency(reports.totalRevenue)}</h3>
        </div>

        <div className="stat-card">
          <p>Đã thu</p>
          <h3>{formatCurrency(reports.totalPaid)}</h3>
        </div>

        <div className="stat-card">
          <p>Còn nợ</p>
          <h3>{formatCurrency(reports.totalDebt)}</h3>
        </div>

        <div className="stat-card">
          <p>Tổng đơn hàng</p>
          <h3>{reports.totalOrders}</h3>
        </div>
      </section>

      <section className="report-grid">
        <div className="card">
          <div className="section-header">
            <div>
              <h2>Trạng thái đơn hàng</h2>
              <p className="muted">Số lượng đơn theo từng trạng thái.</p>
            </div>
          </div>

          <SimpleCountTable
            data={reports.orderStatusCounts}
            getLabel={getOrderStatusLabel}
          />
        </div>

        <div className="card">
          <div className="section-header">
            <div>
              <h2>Trạng thái công nợ</h2>
              <p className="muted">Tình trạng thu tiền của các đơn hàng.</p>
            </div>
          </div>

          <SimpleCountTable
            data={reports.paymentStatusCounts}
            getLabel={getPaymentStatusLabel}
          />
        </div>

        <div className="card">
          <div className="section-header">
            <div>
              <h2>Trạng thái khách hàng</h2>
              <p className="muted">Phân bổ khách hàng theo pipeline bán hàng.</p>
            </div>
          </div>

          <SimpleCountTable
            data={reports.customerStatusCounts}
            getLabel={getCustomerStatusLabel}
          />
        </div>

        <div className="card">
          <div className="section-header">
            <div>
              <h2>Phương thức thanh toán</h2>
              <p className="muted">Tổng tiền thu theo từng phương thức.</p>
            </div>
          </div>

          <PaymentMethodTable items={reports.paymentMethodSummary} />
        </div>
      </section>

      <section className="report-grid">
        <div className="card">
          <div className="section-header">
            <div>
              <h2>Top khách hàng</h2>
              <p className="muted">Khách hàng có giá trị đơn cao nhất.</p>
            </div>
          </div>

          <TopCustomerTable items={reports.topCustomers} />
        </div>

        <div className="card">
          <div className="section-header">
            <div>
              <h2>Top sản phẩm bán chạy</h2>
              <p className="muted">Tính theo dữ liệu order_items.</p>
            </div>
          </div>

          <TopProductTable items={reports.topProducts} />
        </div>
      </section>

      <section className="report-grid">
        <div className="card">
          <div className="section-header">
            <div>
              <h2>Cảnh báo tồn kho thấp</h2>
              <p className="muted">Sản phẩm có tồn kho nhỏ hơn hoặc bằng 10.</p>
            </div>
          </div>

          <LowStockTable products={reports.lowStockProducts} />
        </div>

        <div className="card">
          <div className="section-header">
            <div>
              <h2>Khách cần chăm sóc</h2>
              <p className="muted">Các lịch hẹn chăm sóc đến hạn.</p>
            </div>
          </div>

          <DueActivitiesTable
            activities={reports.dueActivities}
            customers={customers}
          />
        </div>
      </section>
    </div>
  );
}

function SimpleCountTable({ data, getLabel }) {
  const entries = Object.entries(data || {});

  if (entries.length === 0) {
    return (
      <div className="empty-state">
        <h3>Chưa có dữ liệu</h3>
        <p>Chưa đủ dữ liệu để thống kê.</p>
      </div>
    );
  }

  return (
    <>
      <ReportMobileList
        items={entries.map(([key, value]) => ({
          id: key,
          title: getLabel(key),
          metrics: [{ label: "Số lượng", value: formatNumber(value) }],
        }))}
      />
      <div className="table-wrap desktop-table-wrap">
      <table>
        <thead>
          <tr>
            <th>Trạng thái</th>
            <th>Số lượng</th>
          </tr>
        </thead>

        <tbody>
          {entries.map(([key, value]) => (
            <tr key={key}>
              <td>{getLabel(key)}</td>
              <td>
                <strong>{value}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
}

function PaymentMethodTable({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="empty-state">
        <h3>Chưa có thanh toán</h3>
        <p>Chưa có dữ liệu thanh toán để thống kê.</p>
      </div>
    );
  }

  return (
    <>
      <ReportMobileList
        items={items.map((item) => ({
          id: item.payment_method,
          title: getPaymentMethodLabel(item.payment_method),
          metrics: [
            { label: "Số lần", value: formatNumber(item.count) },
            { label: "Tổng tiền", value: formatCurrency(item.total_amount) },
          ],
        }))}
      />
      <div className="table-wrap desktop-table-wrap">
      <table>
        <thead>
          <tr>
            <th>Phương thức</th>
            <th>Số lần</th>
            <th>Tổng tiền</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.payment_method}>
              <td>{getPaymentMethodLabel(item.payment_method)}</td>
              <td>{item.count}</td>
              <td>
                <strong>{formatCurrency(item.total_amount)}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
}

function TopCustomerTable({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="empty-state">
        <h3>Chưa có dữ liệu khách hàng</h3>
        <p>Khi có đơn hàng, top khách hàng sẽ hiện ở đây.</p>
      </div>
    );
  }

  return (
    <>
      <ReportMobileList
        items={items.map((item) => ({
          id: item.customer_id,
          title: item.customer_name,
          subtitle: item.customer_phone,
          metrics: [
            { label: "Số đơn", value: formatNumber(item.order_count) },
            { label: "Tổng đơn", value: formatCurrency(item.total_amount) },
            { label: "Đã thu", value: formatCurrency(item.paid_amount) },
            { label: "Còn nợ", value: formatCurrency(item.debt_amount) },
          ],
        }))}
      />
      <div className="table-wrap desktop-table-wrap">
      <table>
        <thead>
          <tr>
            <th>Khách hàng</th>
            <th>Số đơn</th>
            <th>Tổng đơn</th>
            <th>Đã thu</th>
            <th>Còn nợ</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.customer_id}>
              <td>
                <strong>{item.customer_name}</strong>
                <p className="table-subtext">{item.customer_phone}</p>
              </td>
              <td>{item.order_count}</td>
              <td>{formatCurrency(item.total_amount)}</td>
              <td>{formatCurrency(item.paid_amount)}</td>
              <td>
                <strong>{formatCurrency(item.debt_amount)}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
}

function TopProductTable({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="empty-state">
        <h3>Chưa có dữ liệu sản phẩm</h3>
        <p>Khi có đơn hàng, top sản phẩm sẽ hiện ở đây.</p>
      </div>
    );
  }

  return (
    <>
      <ReportMobileList
        items={items.map((item) => ({
          id: item.product_id,
          title: item.product_code,
          subtitle: `${item.product_name}${item.product_size ? ` · ${item.product_size}` : ""}`,
          metrics: [
            { label: "Số lượng bán", value: formatNumber(item.quantity) },
            { label: "Giá trị", value: formatCurrency(item.total_amount) },
          ],
        }))}
      />
      <div className="table-wrap desktop-table-wrap">
      <table>
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th>Số lượng bán</th>
            <th>Giá trị</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.product_id}>
              <td>
                <strong>{item.product_code}</strong>
                <p className="table-subtext">
                  {item.product_name} {item.product_size ? `· ${item.product_size}` : ""}
                </p>
              </td>
              <td>{formatNumber(item.quantity)}</td>
              <td>
                <strong>{formatCurrency(item.total_amount)}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
}

function LowStockTable({ products }) {
  if (!products || products.length === 0) {
    return (
      <div className="empty-state">
        <h3>Không có cảnh báo tồn kho</h3>
        <p>Hiện chưa có sản phẩm nào tồn kho thấp.</p>
      </div>
    );
  }

  return (
    <>
      <ReportMobileList
        items={products.map((product) => ({
          id: product.id,
          title: product.code,
          subtitle: product.name,
          metrics: [{ label: "Tồn kho", value: formatNumber(product.stock_qty) }],
        }))}
      />
      <div className="table-wrap desktop-table-wrap">
      <table>
        <thead>
          <tr>
            <th>Mã</th>
            <th>Sản phẩm</th>
            <th>Tồn kho</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <strong>{product.code}</strong>
              </td>
              <td>{product.name}</td>
              <td>
                <span
                  className={
                    Number(product.stock_qty || 0) > 0
                      ? "status-pill status-contacted"
                      : "status-pill status-lost"
                  }
                >
                  {formatNumber(product.stock_qty)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
}

function DueActivitiesTable({ activities, customers }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="empty-state">
        <h3>Chưa có khách đến hạn chăm sóc</h3>
        <p>Các lịch hẹn chăm sóc đến hạn sẽ hiện ở đây.</p>
      </div>
    );
  }

  return (
    <>
      <ReportMobileList
        items={activities.map((activity) => {
          const customer = customers.find(
            (item) => item.id === activity.customer_id
          );

          return {
            id: activity.id,
            title: customer?.name || "Không rõ khách",
            subtitle: customer?.phone || "",
            metrics: [
              { label: "Ngày hẹn", value: formatDate(activity.next_follow_up) },
              { label: "Nội dung", value: activity.note },
            ],
          };
        })}
      />
      <div className="table-wrap desktop-table-wrap">
      <table>
        <thead>
          <tr>
            <th>Khách hàng</th>
            <th>Ngày hẹn</th>
            <th>Nội dung</th>
          </tr>
        </thead>

        <tbody>
          {activities.map((activity) => {
            const customer = customers.find(
              (item) => item.id === activity.customer_id
            );

            return (
              <tr key={activity.id}>
                <td>
                  <strong>{customer?.name || "Không rõ khách"}</strong>
                  <p className="table-subtext">{customer?.phone || ""}</p>
                </td>

                <td>{formatDate(activity.next_follow_up)}</td>

                <td className="note-cell">{activity.note}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </>
  );
}

function ReportMobileList({ items }) {
  return (
    <div className="mobile-card-list report-mobile-list">
      {items.map((item) => (
        <article className="mobile-data-card report-mobile-card" key={item.id}>
          <div className="mobile-card-head">
            <div>
              <h3>{item.title}</h3>
              {item.subtitle && <p>{item.subtitle}</p>}
            </div>
          </div>

          <div className="mobile-card-fields two-cols">
            {item.metrics.map((metric) => (
              <div className="mobile-card-field compact" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

export default ReportsPage;
