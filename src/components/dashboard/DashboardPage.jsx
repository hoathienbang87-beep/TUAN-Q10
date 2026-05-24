import ActivityDueList from "../care/ActivityDueList";
import CustomerMiniList from "../customers/CustomerMiniList";
import OrderMiniList from "../orders/OrderMiniList";
import ProductTable from "../products/ProductTable";
import { formatCurrency, getTodayString } from "../../utils/format";

function DashboardPage({ profile, stats, products, customers, activities, orders }) {
  const latestCustomers = customers.slice(0, 5);
  const latestOrders = orders.slice(0, 5);
  const today = getTodayString();

  const dueActivities = activities
    .filter((activity) => activity.next_follow_up && activity.next_follow_up <= today)
    .slice(0, 5);

  const totalRevenue = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + Number(order.total_amount || 0), 0);

  return (
    <>
      <section className="stats-grid">
        <div className="stat-card">
          <p>Vai trò hiện tại</p>
          <h3>{profile?.role || "Chưa có"}</h3>
        </div>

        <div className="stat-card">
          <p>Tổng khách hàng đọc được</p>
          <h3>{stats.customers}</h3>
        </div>

        <div className="stat-card">
          <p>Tổng đơn hàng đọc được</p>
          <h3>{stats.orders}</h3>
        </div>

        <div className="stat-card">
          <p>Tổng giá trị đơn</p>
          <h3>{formatCurrency(totalRevenue)}</h3>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="card">
          <div className="section-header">
            <div>
              <h2>Khách cần chăm</h2>
              <p className="muted">Các lịch hẹn chăm sóc đến hôm nay.</p>
            </div>
          </div>

          <ActivityDueList activities={dueActivities} customers={customers} />
        </div>

        <div className="card">
          <div className="section-header">
            <div>
              <h2>Đơn hàng mới nhất</h2>
              <p className="muted">Dữ liệu đang đọc từ bảng orders.</p>
            </div>
          </div>

          <OrderMiniList orders={latestOrders} customers={customers} />
        </div>
      </section>

      <section className="dashboard-grid mt-18">
        <div className="card">
          <div className="section-header">
            <div>
              <h2>Khách hàng mới nhất</h2>
              <p className="muted">Dữ liệu đang đọc từ bảng customers.</p>
            </div>
          </div>

          <CustomerMiniList customers={latestCustomers} />
        </div>

        <div className="card">
          <div className="section-header">
            <div>
              <h2>Sản phẩm mới nhất</h2>
              <p className="muted">Dữ liệu đang đọc từ bảng products.</p>
            </div>
          </div>

          <ProductTable products={products.slice(0, 5)} canManageProducts={false} />
        </div>
      </section>
    </>
  );
}

export default DashboardPage;