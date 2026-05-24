import { useEffect, useState } from "react";
import "./App.css";

import AppLayout from "./components/layout/AppLayout";
import LoginPage from "./components/layout/LoginPage";

import DashboardPage from "./components/dashboard/DashboardPage";
import CustomersPage from "./components/customers/CustomersPage";
import ProductsPage from "./components/products/ProductsPage";
import OrdersPage from "./components/orders/OrdersPage";
import StaffPage from "./components/staff/StaffPage";
import StockPage from "./components/stock/StockPage";
import PaymentsPage from "./components/payments/PaymentsPage";
import ReportsPage from "./components/reports/ReportsPage";
import KpiPage from "./components/kpi/KpiPage";

import {
  getCurrentSession,
  listenToAuthChanges,
  signInUser,
  signOutUser,
} from "./services/authService";

import {
  getProfileById,
  getProfiles,
  updateProfile,
} from "./services/profileService";

import {
  createCustomer,
  getCustomers,
  updateCustomerStatus,
} from "./services/customerService";

import { createActivity, getActivities } from "./services/activityService";

import {
  createProduct,
  getProducts,
  updateProduct,
} from "./services/productService";

import {
  createOrderWithItems,
  getOrders,
  updateOrderStatus,
} from "./services/orderService";

import {
  createStockMovement,
  getStockMovements,
} from "./services/stockService";

import {
  createPayment,
  getPayments,
} from "./services/paymentService";

import {
  getKpiTargets,
  saveKpiTarget,
} from "./services/kpiTargetService";

import { getStats } from "./services/statsService";



function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  const [activePage, setActivePage] = useState("dashboard");

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [orders, setOrders] = useState([]);
  const [staffProfiles, setStaffProfiles] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [payments, setPayments] = useState([]);
  const [kpiTargets, setKpiTargets] = useState([]);

  const [stats, setStats] = useState({
    products: 0,
    customers: 0,
    orders: 0,
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [customerSaving, setCustomerSaving] = useState(false);
  const [activitySaving, setActivitySaving] = useState(false);
  const [productSaving, setProductSaving] = useState(false);
  const [orderSaving, setOrderSaving] = useState(false);
  const [staffSaving, setStaffSaving] = useState(false);
  const [stockSaving, setStockSaving] = useState(false);
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [kpiTargetSaving, setKpiTargetSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadProfile(userId) {
    try {
      const data = await getProfileById(userId);
      setProfile(data);
      return data;
    } catch (error) {
      console.error("Lỗi lấy profile:", error);
      setErrorMessage("Không lấy được hồ sơ người dùng trong bảng profiles.");
      return null;
    }
  }

  async function loadStaffProfiles() {
    try {
      const data = await getProfiles();
      setStaffProfiles(data);
    } catch (error) {
      console.error("Lỗi lấy danh sách nhân sự:", error);
      setErrorMessage("Không tải được danh sách nhân sự.");
    }
  }

  async function loadProducts() {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Lỗi lấy products:", error);
      setErrorMessage("Không đọc được sản phẩm. Có thể RLS đang chặn.");
    }
  }

  async function loadCustomers() {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error("Lỗi lấy customers:", error);
      setErrorMessage("Không đọc được khách hàng. Có thể RLS đang chặn.");
    }
  }

  async function loadActivities() {
    try {
      const data = await getActivities();
      setActivities(data);
    } catch (error) {
      console.error("Lỗi lấy customer_activities:", error);
      setErrorMessage("Không đọc được lịch sử chăm sóc. Có thể RLS đang chặn.");
    }
  }

  async function loadOrders() {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Lỗi lấy orders:", error);
      setErrorMessage("Không đọc được đơn hàng. Có thể RLS đang chặn.");
    }
  }

  async function loadPayments() {
    try {
      const data = await getPayments();
      setPayments(data);
    } catch (error) {
      console.error("Lỗi lấy payments:", error);
      setErrorMessage("Không tải được lịch sử thanh toán.");
    }
  }

  async function loadKpiTargets() {
    try {
      const data = await getKpiTargets();
      setKpiTargets(data);
    } catch (error) {
      console.error("Lỗi lấy KPI targets:", error);
      setErrorMessage("Không tải được chỉ tiêu KPI.");
    }
  }

  async function loadStockMovements() {
    try {
      const data = await getStockMovements();
      setStockMovements(data);
    } catch (error) {
      console.error("Lỗi lấy lịch sử kho:", error);
      setErrorMessage("Không tải được lịch sử kho.");
    }
  }

  async function loadStats() {
    try {
      const data = await getStats();
      setStats(data);
    } catch (error) {
      console.error("Lỗi lấy stats:", error);
      setErrorMessage("Không tải được thống kê tổng quan.");
    }
  }

  async function loadUserData(currentSession) {
    if (!currentSession?.user) {
      setProfile(null);
      setProducts([]);
      setCustomers([]);
      setActivities([]);
      setOrders([]);
      setStaffProfiles([]);
      setStockMovements([]);
      setKpiTargets([]);
      setPayments([]);
      setStats({
        products: 0,
        customers: 0,
        orders: 0,
      });
      return;
    }

    const userProfile = await loadProfile(currentSession.user.id);

    if (userProfile?.status === "active") {
      const loaders = [
        loadProducts(),
        loadCustomers(),
        loadActivities(),
        loadOrders(),
        loadStats(),
      ];

      if (["admin", "manager"].includes(userProfile.role)) {
        loaders.push(loadStaffProfiles());
      }

      if (["admin", "manager", "warehouse"].includes(userProfile.role)) {
        loaders.push(loadStockMovements());
      }

      if (["admin", "manager", "sales"].includes(userProfile.role)) {
        loaders.push(loadKpiTargets());
      }

      if (["admin", "manager", "sales"].includes(userProfile.role)) {
        loaders.push(loadPayments());
      }

      await Promise.all(loaders);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function initApp() {
      try {
        setLoading(true);
        setErrorMessage("");

        const currentSession = await getCurrentSession();

        if (!isMounted) return;

        setSession(currentSession);

        if (currentSession) {
          await loadUserData(currentSession);
        }
      } catch (error) {
        console.error("Lỗi khởi động app:", error);
        setErrorMessage("App gặp lỗi khi khởi động. Mở Console để xem chi tiết.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initApp();

    const subscription = listenToAuthChanges((_event, newSession) => {
      setSession(newSession);

      setTimeout(async () => {
        try {
          if (newSession) {
            await loadUserData(newSession);
          } else {
            setProfile(null);
            setProducts([]);
            setCustomers([]);
            setActivities([]);
            setOrders([]);
            setStaffProfiles([]);
            setStockMovements([]);
            setKpiTargets([]);
            setPayments([]);
          }
        } catch (error) {
          console.error("Lỗi auth state change:", error);
          setErrorMessage("Có lỗi khi tải dữ liệu người dùng.");
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }, 0);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogin(event) {
    event.preventDefault();

    setAuthLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await signInUser(email, password);
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      setErrorMessage("Đăng nhập thất bại. Kiểm tra email/password.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    setErrorMessage("");
    setSuccessMessage("");
    setActivePage("dashboard");

    try {
      await signOutUser();
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
      setErrorMessage("Không đăng xuất được.");
    }
  }

  async function handleCreateCustomer(formData) {
    if (!session?.user?.id) {
      setErrorMessage("Bạn cần đăng nhập trước khi thêm khách hàng.");
      return false;
    }

    const name = formData.name.trim();

    if (!name) {
      setErrorMessage("Tên khách hàng là bắt buộc.");
      return false;
    }

    setCustomerSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const payload = {
      name,
      phone: formData.phone.trim() || null,
      address: formData.address.trim() || null,
      source: formData.source.trim() || null,
      status: formData.status || "new",
      assigned_to: session.user.id,
      created_by: session.user.id,
    };

    try {
      const data = await createCustomer(payload);

      setCustomers((current) => [data, ...current]);
      await loadStats();

      setSuccessMessage("Đã thêm khách hàng thành công.");
      return true;
    } catch (error) {
      console.error("Lỗi thêm khách hàng:", error);
      setErrorMessage("Không thêm được khách hàng. Kiểm tra RLS hoặc dữ liệu nhập.");
      return false;
    } finally {
      setCustomerSaving(false);
    }
  }

  async function handleUpdateCustomerStatus(customerId, newStatus) {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const data = await updateCustomerStatus(customerId, newStatus);

      setCustomers((current) =>
        current.map((customer) => (customer.id === customerId ? data : customer))
      );

      setSuccessMessage("Đã cập nhật trạng thái khách hàng.");
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      setErrorMessage("Không cập nhật được trạng thái khách hàng.");
    }
  }

  async function handleCreateActivity(formData) {
    if (!session?.user?.id) {
      setErrorMessage("Bạn cần đăng nhập trước khi thêm lịch sử chăm sóc.");
      return false;
    }

    if (!formData.customer_id) {
      setErrorMessage("Bạn cần chọn khách hàng trước khi ghi lịch sử chăm sóc.");
      return false;
    }

    if (!formData.note.trim()) {
      setErrorMessage("Nội dung chăm sóc không được để trống.");
      return false;
    }

    setActivitySaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const payload = {
      customer_id: formData.customer_id,
      activity_type: formData.activity_type || "note",
      note: formData.note.trim(),
      next_follow_up: formData.next_follow_up || null,
      created_by: session.user.id,
    };

    try {
      const data = await createActivity(payload);

      setActivities((current) => [data, ...current]);
      setSuccessMessage("Đã ghi lịch sử chăm sóc khách hàng.");
      return true;
    } catch (error) {
      console.error("Lỗi thêm lịch sử chăm sóc:", error);
      setErrorMessage("Không thêm được lịch sử chăm sóc. Kiểm tra RLS hoặc dữ liệu nhập.");
      return false;
    } finally {
      setActivitySaving(false);
    }
  }

  async function handleCreateProduct(formData) {
    const code = formData.code.trim();
    const name = formData.name.trim();

    if (!code) {
      setErrorMessage("Mã sản phẩm là bắt buộc.");
      return false;
    }

    if (!name) {
      setErrorMessage("Tên sản phẩm là bắt buộc.");
      return false;
    }

    setProductSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const payload = {
      code,
      name,
      category: formData.category.trim() || null,
      size: formData.size.trim() || null,
      surface: formData.surface.trim() || null,
      origin: formData.origin.trim() || null,
      price: Number(formData.price) || 0,
      stock_qty: Number(formData.stock_qty) || 0,
      image_url: formData.image_url.trim() || null,
      status: formData.status || "active",
    };

    try {
      const data = await createProduct(payload);

      setProducts((current) => [data, ...current]);
      await loadStats();

      setSuccessMessage("Đã thêm sản phẩm thành công.");
      return true;
    } catch (error) {
      console.error("Lỗi thêm sản phẩm:", error);
      setErrorMessage(
        "Không thêm được sản phẩm. Kiểm tra quyền user hoặc mã sản phẩm bị trùng."
      );
      return false;
    } finally {
      setProductSaving(false);
    }
  }

  async function handleUpdateProduct(productId, formData) {
    const code = formData.code.trim();
    const name = formData.name.trim();

    if (!code) {
      setErrorMessage("Mã sản phẩm là bắt buộc.");
      return false;
    }

    if (!name) {
      setErrorMessage("Tên sản phẩm là bắt buộc.");
      return false;
    }

    setProductSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const payload = {
      code,
      name,
      category: formData.category.trim() || null,
      size: formData.size.trim() || null,
      surface: formData.surface.trim() || null,
      origin: formData.origin.trim() || null,
      price: Number(formData.price) || 0,
      stock_qty: Number(formData.stock_qty) || 0,
      image_url: formData.image_url.trim() || null,
      status: formData.status || "active",
    };

    try {
      const data = await updateProduct(productId, payload);

      setProducts((current) =>
        current.map((product) => (product.id === productId ? data : product))
      );

      await loadStats();

      setSuccessMessage("Đã cập nhật sản phẩm thành công.");
      return true;
    } catch (error) {
      console.error("Lỗi cập nhật sản phẩm:", error);
      setErrorMessage("Không cập nhật được sản phẩm. Kiểm tra quyền hoặc dữ liệu.");
      return false;
    } finally {
      setProductSaving(false);
    }
  }

  async function handleCreateOrder(orderForm, orderItems) {
    if (!session?.user?.id) {
      setErrorMessage("Bạn cần đăng nhập trước khi tạo đơn hàng.");
      return false;
    }

    if (!orderForm.customer_id) {
      setErrorMessage("Bạn cần chọn khách hàng trước khi tạo đơn hàng.");
      return false;
    }

    if (!orderItems || orderItems.length === 0) {
      setErrorMessage("Đơn hàng cần có ít nhất một sản phẩm.");
      return false;
    }

    setOrderSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const orderPayload = {
      customer_id: orderForm.customer_id,
      sales_id: session.user.id,
      status: orderForm.status || "draft",
      note: orderForm.note.trim() || null,
    };

    try {
      await createOrderWithItems(orderPayload, orderItems);

      await Promise.all([loadOrders(), loadStats()]);

      setSuccessMessage("Đã tạo đơn hàng thành công.");
      return true;
    } catch (error) {
      console.error("Lỗi tạo đơn hàng:", error);
      setErrorMessage(
        "Không tạo được đơn hàng hoặc dòng sản phẩm. Kiểm tra RLS order_items."
      );
      return false;
    } finally {
      setOrderSaving(false);
    }
  }

  async function handleUpdateOrderStatus(orderId, newStatus) {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await updateOrderStatus(orderId, newStatus);
      await loadOrders();

      setSuccessMessage("Đã cập nhật trạng thái đơn hàng.");
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái đơn hàng:", error);
      setErrorMessage("Không cập nhật được trạng thái đơn hàng.");
    }
  }

  async function handleCreatePayment(formData) {
  if (!session?.user?.id) {
    setErrorMessage("Bạn cần đăng nhập trước khi ghi nhận thanh toán.");
    return false;
  }

  if (!formData.order_id) {
    setErrorMessage("Bạn cần chọn đơn hàng.");
    return false;
  }

  const amount = Number(formData.amount);

  if (!amount || amount <= 0) {
    setErrorMessage("Số tiền thanh toán phải lớn hơn 0.");
    return false;
  }

  const selectedOrder = orders.find((order) => order.id === formData.order_id);

  if (!selectedOrder) {
    setErrorMessage("Không tìm thấy đơn hàng.");
    return false;
  }

  if (amount > Number(selectedOrder.debt_amount || 0)) {
    setErrorMessage("Số tiền thanh toán không được lớn hơn số tiền còn nợ.");
    return false;
  }

  setPaymentSaving(true);
  setErrorMessage("");
  setSuccessMessage("");

  const payload = {
    order_id: formData.order_id,
    amount,
    payment_method: formData.payment_method || "bank_transfer",
    payment_date: formData.payment_date || new Date().toISOString().slice(0, 10),
    note: formData.note.trim() || null,
    created_by: session.user.id,
  };

  try {
    await createPayment(payload);

    await Promise.all([
      loadPayments(),
      loadOrders(),
    ]);

    setSuccessMessage("Đã ghi nhận thanh toán và cập nhật công nợ.");
    return true;
  } catch (error) {
    console.error("Lỗi ghi nhận thanh toán:", error);
    setErrorMessage("Không ghi nhận được thanh toán. Kiểm tra quyền hoặc dữ liệu.");
    return false;
  } finally {
    setPaymentSaving(false);
  }
}

  async function handleCreateStockMovement(formData) {
    if (!session?.user?.id) {
      setErrorMessage("Bạn cần đăng nhập trước khi tạo phiếu kho.");
      return false;
    }

    if (!formData.product_id) {
      setErrorMessage("Bạn cần chọn sản phẩm.");
      return false;
    }

    const quantity = Number(formData.quantity);

    if (!quantity || quantity === 0) {
      setErrorMessage("Số lượng phải khác 0.");
      return false;
    }

    if (
      ["in", "out"].includes(formData.movement_type) &&
      quantity < 0
    ) {
      setErrorMessage("Nhập kho và xuất kho dùng số dương.");
      return false;
    }

    setStockSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const payload = {
      product_id: formData.product_id,
      movement_type: formData.movement_type,
      quantity,
      note: formData.note.trim() || null,
      created_by: session.user.id,
    };

    try {
      await createStockMovement(payload);

      await Promise.all([
        loadProducts(),
        loadStockMovements(),
      ]);

      setSuccessMessage("Đã tạo phiếu kho và cập nhật tồn kho.");
      return true;
    } catch (error) {
      console.error("Lỗi tạo phiếu kho:", error);
      setErrorMessage(
        "Không tạo được phiếu kho. Có thể tồn kho không đủ hoặc user không có quyền."
      );
      return false;
    } finally {
      setStockSaving(false);
    }
  }

  async function handleUpdateStaffProfile(profileId, payload) {
    if (profile?.role !== "admin") {
      setErrorMessage("Chỉ admin mới được cập nhật nhân sự.");
      return;
    }

    if (profileId === profile?.id && payload.status === "blocked") {
      setErrorMessage("Bạn không thể tự khóa tài khoản admin đang đăng nhập.");
      return;
    }

    setStaffSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const data = await updateProfile(profileId, payload);

      setStaffProfiles((current) =>
        current.map((item) => (item.id === profileId ? data : item))
      );

      if (profileId === profile?.id) {
        setProfile(data);
      }

      setSuccessMessage("Đã cập nhật thông tin nhân sự.");
    } catch (error) {
      console.error("Lỗi cập nhật nhân sự:", error);
      setErrorMessage("Không cập nhật được nhân sự. Kiểm tra quyền admin hoặc RLS.");
    } finally {
      setStaffSaving(false);
    }
  }

  async function handleSaveKpiTarget(formData) {
    if (!session?.user?.id) {
      setErrorMessage("Bạn cần đăng nhập trước khi lưu KPI target.");
      return false;
    }

    if (!["admin", "manager"].includes(profile?.role)) {
      setErrorMessage("Chỉ admin hoặc manager được đặt chỉ tiêu KPI.");
      return false;
    }

    if (!formData.sale_id) {
      setErrorMessage("Bạn cần chọn sale.");
      return false;
    }

    if (!formData.selectedMonth) {
      setErrorMessage("Bạn cần chọn tháng KPI.");
      return false;
    }

    setKpiTargetSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const payload = {
      sale_id: formData.sale_id,
      target_month: `${formData.selectedMonth}-01`,
      target_revenue: Number(formData.target_revenue) || 0,
      target_customers: Number(formData.target_customers) || 0,
      target_activities: Number(formData.target_activities) || 0,
      target_orders: Number(formData.target_orders) || 0,
      note: formData.note.trim() || null,
      created_by: session.user.id,
      updated_by: session.user.id,
    };

    try {
      const data = await saveKpiTarget(payload);

      setKpiTargets((current) => {
        const exists = current.some((item) => item.id === data.id);

        if (exists) {
          return current.map((item) => (item.id === data.id ? data : item));
        }

        return [data, ...current];
      });

      setSuccessMessage("Đã lưu chỉ tiêu KPI.");
      return true;
    } catch (error) {
      console.error("Lỗi lưu KPI target:", error);
      setErrorMessage("Không lưu được chỉ tiêu KPI. Kiểm tra quyền hoặc dữ liệu.");
      return false;
    } finally {
      setKpiTargetSaving(false);
    }
  }

  async function handleReloadCustomers() {
    setErrorMessage("");
    setSuccessMessage("");
    await Promise.all([loadCustomers(), loadActivities(), loadStats()]);
  }

  async function handleReloadProducts() {
    setErrorMessage("");
    setSuccessMessage("");
    await Promise.all([loadProducts(), loadStats()]);
  }

  async function handleReloadOrders() {
    setErrorMessage("");
    setSuccessMessage("");
    await Promise.all([loadOrders(), loadStats()]);
  }

  async function handleReloadStaffProfiles() {
    setErrorMessage("");
    setSuccessMessage("");
    await loadStaffProfiles();
  }

  async function handleReloadStock() {
    setErrorMessage("");
    setSuccessMessage("");
    await Promise.all([loadProducts(), loadStockMovements()]);
  }

  async function handleReloadPayments() {
    setErrorMessage("");
    setSuccessMessage("");
    await Promise.all([loadPayments(), loadOrders()]);
  }

  async function handleReloadKpiTargets() {
    setErrorMessage("");
    setSuccessMessage("");
    await loadKpiTargets();
  }

  function renderPage() {
    if (activePage === "dashboard") {
      return (
        <DashboardPage
          profile={profile}
          stats={stats}
          products={products}
          customers={customers}
          activities={activities}
          orders={orders}
        />
      );
    }

    if (activePage === "reports") {
      return (
        <ReportsPage
          profile={profile}
          customers={customers}
          orders={orders}
          products={products}
          payments={payments}
          activities={activities}
        />
      );
    }

    if (activePage === "kpi") {
      return (
        <KpiPage
          profile={profile}
          staffProfiles={staffProfiles}
          customers={customers}
          activities={activities}
          orders={orders}
          kpiTargets={kpiTargets}
          kpiTargetSaving={kpiTargetSaving}
          onSaveKpiTarget={handleSaveKpiTarget}
          onReloadKpiTargets={handleReloadKpiTargets}
        />
      );
    }

    if (activePage === "customers") {
      return (
        <CustomersPage
          profile={profile}
          customers={customers}
          activities={activities}
          customerSaving={customerSaving}
          activitySaving={activitySaving}
          onCreateCustomer={handleCreateCustomer}
          onCreateActivity={handleCreateActivity}
          onUpdateCustomerStatus={handleUpdateCustomerStatus}
          onReloadCustomers={handleReloadCustomers}
        />
      );
    }

    if (activePage === "products") {
      return (
        <ProductsPage
          profile={profile}
          products={products}
          productSaving={productSaving}
          onCreateProduct={handleCreateProduct}
          onUpdateProduct={handleUpdateProduct}
          onReloadProducts={handleReloadProducts}
        />
      );
    }

    if (activePage === "orders") {
      return (
        <OrdersPage
          profile={profile}
          customers={customers}
          products={products}
          orders={orders}
          orderSaving={orderSaving}
          onCreateOrder={handleCreateOrder}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onReloadOrders={handleReloadOrders}
        />
      );
    }

    if (activePage === "payments") {
      return (
        <PaymentsPage
          profile={profile}
          customers={customers}
          orders={orders}
          payments={payments}
          paymentSaving={paymentSaving}
          onCreatePayment={handleCreatePayment}
          onReloadPayments={handleReloadPayments}
        />
      );
    }

    if (activePage === "stock") {
      return (
        <StockPage
          profile={profile}
          products={products}
          stockMovements={stockMovements}
          stockSaving={stockSaving}
          onCreateStockMovement={handleCreateStockMovement}
          onReloadStock={handleReloadStock}
        />
      );
    }

    if (activePage === "staff") {
      return (
        <StaffPage
          profile={profile}
          staffProfiles={staffProfiles}
          staffSaving={staffSaving}
          onUpdateStaffProfile={handleUpdateStaffProfile}
          onReloadStaffProfiles={handleReloadStaffProfiles}
        />
      );
    }

    return null;
  }

  if (loading) {
    return (
      <div className="page-center">
        <div className="card small-card">
          <h1>Mini ERP Gạch V1</h1>
          <p>Đang khởi động app...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <LoginPage
        email={email}
        password={password}
        setEmail={setEmail}
        setPassword={setPassword}
        handleLogin={handleLogin}
        authLoading={authLoading}
        errorMessage={errorMessage}
      />
    );
  }

  return (
    <AppLayout
      profile={profile}
      activePage={activePage}
      setActivePage={setActivePage}
      handleLogout={handleLogout}
      errorMessage={errorMessage}
      successMessage={successMessage}
    >
      {renderPage()}
    </AppLayout>
  );
}

export default App;