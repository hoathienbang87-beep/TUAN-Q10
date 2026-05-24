import {
  formatDate,
  formatDateTime,
  getActivityTypeLabel,
} from "../../utils/format";

function ActivityTimeline({ activities, customers, selectedCustomerId }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="empty-state">
        <h3>Chưa có lịch sử chăm sóc</h3>
        <p>
          {selectedCustomerId
            ? "Hãy ghi hoạt động chăm sóc đầu tiên cho khách này."
            : "Chọn khách hàng ở danh sách phía trên để bắt đầu."}
        </p>
      </div>
    );
  }

  return (
    <div className="timeline">
      {activities.map((activity) => {
        const customer = customers.find((item) => item.id === activity.customer_id);

        return (
          <div className="timeline-item" key={activity.id}>
            <div className="timeline-dot" />
            <div className="timeline-content">
              <div className="timeline-head">
                <strong>{getActivityTypeLabel(activity.activity_type)}</strong>
                <span>{formatDateTime(activity.created_at)}</span>
              </div>

              <p className="timeline-customer">
                {customer?.name || "Không rõ khách hàng"}
              </p>

              <p>{activity.note}</p>

              {activity.next_follow_up && (
                <div className="follow-up-box">
                  Hẹn chăm lại: {formatDate(activity.next_follow_up)}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ActivityTimeline;