import { useMemo, useState } from "react";
import {
  ADMIN_DATA_SCOPES,
  HARD_RESET_SCOPES,
} from "../../services/adminService";
import { formatNumber } from "../../utils/format";

const HARD_RESET_CONFIRMATION = "RESET DATA";

function AdminPage({
  profile,
  counts,
  adminSaving,
  onSoftDeleteScope,
  onHardResetScope,
}) {
  const [softScope, setSoftScope] = useState("customers");
  const [hardScope, setHardScope] = useState("all");
  const [softConfirm, setSoftConfirm] = useState("");
  const [hardConfirm, setHardConfirm] = useState("");

  const canHardReset = profile?.role === "admin";
  const canSoftDelete = ["admin", "manager"].includes(profile?.role);

  const selectedSoftScope = useMemo(
    () => ADMIN_DATA_SCOPES.find((item) => item.key === softScope),
    [softScope]
  );

  const selectedHardScope = useMemo(
    () => HARD_RESET_SCOPES.find((item) => item.key === hardScope),
    [hardScope]
  );

  async function handleSoftDelete(event) {
    event.preventDefault();

    const success = await onSoftDeleteScope(softScope, softConfirm);

    if (success) {
      setSoftConfirm("");
    }
  }

  async function handleHardReset(event) {
    event.preventDefault();

    const success = await onHardResetScope(hardScope, hardConfirm);

    if (success) {
      setHardConfirm("");
    }
  }

  return (
    <div className="admin-page-stack">
      <section className="card admin-overview-panel">
        <div className="section-header">
          <div>
            <h2>Quản trị dữ liệu</h2>
            <p className="muted">
              Xoá mềm để ẩn khỏi app, xoá cứng để reset hẳn dữ liệu vận hành.
            </p>
          </div>

          <span className="badge">{profile?.role}</span>
        </div>

        <div className="admin-count-grid">
          {ADMIN_DATA_SCOPES.map((scope) => (
            <div className="admin-count-card" key={scope.key}>
              <span>{scope.label}</span>
              <strong>{formatNumber(counts[scope.key] || 0)}</strong>
            </div>
          ))}
        </div>
      </section>

      <div className="module-grid admin-grid">
        <section className="card admin-action-panel">
          <div className="section-header">
            <div>
              <h2>Xoá mềm theo mục</h2>
              <p className="muted">
                Dữ liệu vẫn còn trong database nhưng không hiện trong các tab làm việc.
              </p>
            </div>
          </div>

          {!canSoftDelete ? (
            <div className="empty-state">
              <h3>Không có quyền</h3>
              <p>Chỉ admin hoặc manager được xoá mềm dữ liệu.</p>
            </div>
          ) : (
            <form className="customer-form" onSubmit={handleSoftDelete}>
              <div className="field">
                <label>Mục cần xoá mềm</label>
                <select
                  value={softScope}
                  onChange={(event) => setSoftScope(event.target.value)}
                >
                  {ADMIN_DATA_SCOPES.map((scope) => (
                    <option key={scope.key} value={scope.key}>
                      {scope.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-warning-box soft">
                <strong>{selectedSoftScope?.label}</strong>
                <p>{selectedSoftScope?.description}</p>
                <small>
                  Đang có {formatNumber(counts[softScope] || 0)} bản ghi đang hiển thị.
                </small>
              </div>

              <div className="field">
                <label>Gõ tên mục để xác nhận</label>
                <input
                  value={softConfirm}
                  onChange={(event) => setSoftConfirm(event.target.value)}
                  placeholder={selectedSoftScope?.label}
                />
              </div>

              <button
                className="danger-btn"
                type="submit"
                disabled={adminSaving || softConfirm !== selectedSoftScope?.label}
              >
                Xoá mềm {selectedSoftScope?.label}
              </button>
            </form>
          )}
        </section>

        <section className="card admin-action-panel danger-panel">
          <div className="section-header">
            <div>
              <h2>Reset xoá cứng</h2>
              <p className="muted">
                Chỉ admin dùng. Hành động này xoá hẳn dữ liệu khỏi database.
              </p>
            </div>
          </div>

          {!canHardReset ? (
            <div className="empty-state">
              <h3>Chỉ admin</h3>
              <p>Manager chỉ được xoá mềm để còn truy vết và khôi phục.</p>
            </div>
          ) : (
            <form className="customer-form" onSubmit={handleHardReset}>
              <div className="field">
                <label>Phạm vi reset</label>
                <select
                  value={hardScope}
                  onChange={(event) => setHardScope(event.target.value)}
                >
                  {HARD_RESET_SCOPES.map((scope) => (
                    <option key={scope.key} value={scope.key}>
                      {scope.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-warning-box hard">
                <strong>{selectedHardScope?.label}</strong>
                <p>
                  Xoá cứng không hoàn tác được từ app. Nên backup Supabase trước khi
                  reset dữ liệu thật.
                </p>
              </div>

              <div className="field">
                <label>Gõ {HARD_RESET_CONFIRMATION} để xác nhận</label>
                <input
                  value={hardConfirm}
                  onChange={(event) => setHardConfirm(event.target.value)}
                  placeholder={HARD_RESET_CONFIRMATION}
                />
              </div>

              <button
                className="danger-btn solid"
                type="submit"
                disabled={adminSaving || hardConfirm !== HARD_RESET_CONFIRMATION}
              >
                Reset xoá cứng
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminPage;
