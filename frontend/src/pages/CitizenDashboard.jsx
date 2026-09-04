function CitizenDashboard() {
  return (
    <div className="dashboard-page">

      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div>
          <p className="dashboard-tag">CITIZEN PORTAL</p>
          <h1>Citizen Dashboard</h1>
          <p>
            Track your garbage reports and help keep your community clean.
          </p>
        </div>

        <a href="/report" className="dashboard-report-btn">
            + Report Garbage
        </a>
      </div>

      {/* Statistics */}
      <div className="dashboard-stats">

        <div className="stat-card">
          <span className="stat-icon">📋</span>
          <div>
            <p>Total Reports</p>
            <h2>0</h2>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">⏳</span>
          <div>
            <p>Pending</p>
            <h2>0</h2>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">✅</span>
          <div>
            <p>Resolved</p>
            <h2>0</h2>
          </div>
        </div>

      </div>

      {/* My Reports */}
      <div className="reports-section">

        <div className="section-title">
          <div>
            <p className="dashboard-tag">YOUR ACTIVITY</p>
            <h2>My Garbage Reports</h2>
          </div>
        </div>

        {/* Empty State */}
        <div className="empty-reports">
          <div className="empty-icon">🗑️</div>

          <h3>No reports yet</h3>

          <p>
            You haven't submitted any garbage reports yet.
            Report garbage in your area to help keep your community clean.
          </p>

          <a href="/report" className="empty-report-btn">
              Report Garbage
         </a>
        </div>

      </div>

    </div>
  );
}

export default CitizenDashboard;