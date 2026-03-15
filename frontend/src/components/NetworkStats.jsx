import { useState, useEffect } from "react";

export default function NetworkStats({ client }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const blockNumber = await client.getBlockNumber();
        setStats({
          blockNumber,
          network: "GenLayer Studio (Local)",
          status: "Active",
          timestamp: new Date().toLocaleTimeString(),
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="loading">Loading network stats...</div>;

  return (
    <section className="network-stats">
      <h2>Network Overview</h2>
      <p className="section-desc">
        Live metrics from the GenLayer network. Refreshes every 5 seconds.
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">🧱</span>
          <span className="stat-label">Current Block</span>
          <span className="stat-value">{stats?.blockNumber ?? "N/A"}</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🌐</span>
          <span className="stat-label">Network</span>
          <span className="stat-value">{stats?.network}</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">✅</span>
          <span className="stat-label">Status</span>
          <span className="stat-value green">{stats?.status}</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🕐</span>
          <span className="stat-label">Last Updated</span>
          <span className="stat-value">{stats?.timestamp}</span>
        </div>
      </div>

      <div className="info-box">
        <h3>About Optimistic Democracy</h3>
        <p>
          Every transaction on GenLayer goes through Optimistic Democracy — a consensus
          mechanism where multiple validators independently run LLMs and apply the
          Equivalence Principle to reach agreement on non-deterministic outputs.
          Use the Validators tab to watch this process live.
        </p>
      </div>
    </section>
  );
}
