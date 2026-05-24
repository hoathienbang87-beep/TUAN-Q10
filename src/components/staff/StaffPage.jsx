import { useMemo, useState } from "react";
import {
  PROFILE_ROLE_OPTIONS,
  PROFILE_STATUS_OPTIONS,
} from "../../constants/appConstants";
import { formatDate } from "../../utils/format";

function StaffPage({
  profile,
  staffProfiles,
  staffSaving,
  onUpdateStaffProfile,
  onReloadStaffProfiles,
}) {
  const [searchText, setSearchText] = useState("");

  const canManageStaff = profile?.role === "admin";
  const canViewStaff = ["admin", "manager"].includes(profile?.role);

  const filteredProfiles = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) {
      return staffProfiles;
    }

    return staffProfiles.filter((item) => {
      return (
        item.email?.toLowerCase().includes(keyword) ||
        item.full_name?.toLowerCase().includes(keyword) ||
        item.role?.toLowerCase().includes(keyword) ||
        item.department?.toLowerCase().includes(keyword) ||
        item.status?.toLowerCase().includes(keyword)
      );
    });
  }, [staffProfiles, searchText]);

  if (!canViewStaff) {
    return (
      <section className="card">
        <div className="empty-state">
          <h3>Không có quyền xem nhân sự</h3>
          <p>Chỉ admin hoặc manager được xem danh sách nhân viên.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h2>Nhân sự & phân quyền</h2>
          <p className="muted">
            Admin được đổi role và khóa/mở user. Manager chỉ xem danh sách.
          </p>
        </div>

        <button className="secondary-btn" onClick={onReloadStaffProfiles}>
          Tải lại
        </button>
      </div>

      <div className="info-box">
        <strong>Cách thêm user mới trong V1:</strong>
        <p>
          Vào Supabase → Authentication → Users → Add user. Sau đó quay lại màn
          hình này để chỉnh role và trạng thái.
        </p>
      </div>

      <div className="list-toolbar">
        <input
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Tìm theo tên, email, role, phòng ban..."
        />

        <span className="badge">{filteredProfiles.length} nhân sự</span>
      </div>

      <StaffTable
        profiles={filteredProfiles}
        currentProfile={profile}
        canManageStaff={canManageStaff}
        staffSaving={staffSaving}
        onUpdateStaffProfile={onUpdateStaffProfile}
      />
    </section>
  );
}

function StaffTable({
  profiles,
  currentProfile,
  canManageStaff,
  staffSaving,
  onUpdateStaffProfile,
}) {
  if (!profiles || profiles.length === 0) {
    return (
      <div className="empty-state">
        <h3>Chưa có nhân sự</h3>
        <p>Tạo user trong Supabase Authentication trước.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Nhân sự</th>
            <th>Email</th>
            <th>Role</th>
            <th>Phòng ban</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
          </tr>
        </thead>

        <tbody>
          {profiles.map((item) => {
            const isSelf = item.id === currentProfile?.id;

            return (
              <tr key={item.id}>
                <td>
                  <strong>{item.full_name || "Chưa đặt tên"}</strong>
                  {isSelf && <p className="table-subtext">Tài khoản hiện tại</p>}
                </td>

                <td>{item.email}</td>

                <td>
                  {canManageStaff ? (
                    <select
                      className="table-select"
                      value={item.role}
                      disabled={staffSaving}
                      onChange={(event) =>
                        onUpdateStaffProfile(item.id, {
                          role: event.target.value,
                        })
                      }
                    >
                      {PROFILE_ROLE_OPTIONS.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="badge">{getRoleLabel(item.role)}</span>
                  )}
                </td>

                <td>
                  {canManageStaff ? (
                    <input
                      className="inline-input"
                      value={item.department || ""}
                      disabled={staffSaving}
                      onChange={(event) =>
                        onUpdateStaffProfile(item.id, {
                          department: event.target.value,
                        })
                      }
                      placeholder="VD: sales, warehouse..."
                    />
                  ) : (
                    item.department || "-"
                  )}
                </td>

                <td>
                  {canManageStaff ? (
                    <select
                      className="table-select"
                      value={item.status}
                      disabled={staffSaving || isSelf}
                      onChange={(event) =>
                        onUpdateStaffProfile(item.id, {
                          status: event.target.value,
                        })
                      }
                    >
                      {PROFILE_STATUS_OPTIONS.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span
                      className={
                        item.status === "active"
                          ? "status-pill status-won"
                          : "status-pill status-lost"
                      }
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  )}

                  {isSelf && canManageStaff && (
                    <p className="table-subtext">Không tự khóa chính mình</p>
                  )}
                </td>

                <td>{formatDate(item.created_at)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function getRoleLabel(role) {
  const found = PROFILE_ROLE_OPTIONS.find((item) => item.value === role);
  return found?.label || role;
}

function getStatusLabel(status) {
  const found = PROFILE_STATUS_OPTIONS.find((item) => item.value === status);
  return found?.label || status;
}

export default StaffPage;