import { formatDate } from "../../utils/format";

function ActivityDueList({ activities, customers }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="empty-state">
        <h3>Chưa có việc đến hạn</h3>
        <p>Các lịch hẹn chăm sóc đến hôm nay sẽ hiện ở đây.</p>
      </div>
    );
  }

  return (
    <div className="mini-list">
      {activities.map((activity) => {
        const customer = customers.find((item) => item.id === activity.customer_id);

        return (
          <div className="mini-list-item" key={activity.id}>
            <div>
              <strong>{customer?.name || "Không rõ khách"}</strong>
              <p>{activity.note}</p>
            </div>
            <span className="status-pill status-contacted">
              {formatDate(activity.next_follow_up)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default ActivityDueList;