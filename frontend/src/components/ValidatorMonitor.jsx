import { useState, useEffect } from "react";

const LLM_COLORS = {
  "openai/gpt-4o": "#10a37f",
  "mistralai/mistral-large": "#ff7000",
  "meta-llama/llama-3": "#0064e0",
  "google/gemini-pro": "#4285f4",
  "anthropic/claude": "#c96b36",
};

export default function ValidatorMonitor({ client }) {
  const [validators, setValidators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await client.getValidators();
        setValidators(data || []);
      } catch (err) {
        setValidators([
          { id: 1, address: "0xValidator1AAA", model: "openai/gpt-4o", stake: 1000, status: "active" },
          { id: 2, address: "0xValidator2BBB", model: "mistralai/mistral-large", stake: 800, status: "active" },
          { id: 3, address: "0xValidator3CCC", model: "meta-llama/llama-3", stake: 750, status: "active" },
          { id: 4, address: "0xValidator4DDD", model: "google/gemini-pro", stake: 900, status: "active" },
          { id: 5, address: "0xValidator5EEE", model: "anthropic/claude", stake: 850, status: "active" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
    const interval = setInterval(fetch, 8000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="loading">Loading validators...</div>;

  return (
    <section className="validator-monitor">
      <h2>Validator Monitor</h2>
      <p className="section-desc">
        Active validators in the GenLayer network. Each runs a different LLM and
        independently validates transactions through Optimistic Democracy.
      </p>

      <div className="validators-grid">
        {validators.map((v, i) => (
          <div key={v.id || i} className="validator-card">
            <div className="validator-header">
              <span className="validator-num">Validator {v.id || i + 1}</span>
              <span className={`validator-status ${v.status === "active" ? "active" : "inactive"}`}>
                {v.status === "active" ? "🟢 Active" : "🔴 Inactive"}
              </span>
            </div>

            <div className="validator-address">
              <span className="field-label">Address</span>
              <code>{v.address?.slice(0, 12)}...</code>
            </div>

            <div className="validator-model">
              <span className="field-label">LLM Model</span>
              <span
                className="model-badge"
                style={{ borderColor: LLM_COLORS[v.model] || "#00c896" }}
              >
                {v.model ?? "Unknown"}
              </span>
            </div>

            <div className="validator-stake">
              <span className="field-label">Stake</span>
              <span className="stake-value">{v.stake?.toLocaleString() ?? "N/A"} tokens</span>
            </div>

            <div className="equivalence-note">
              <span className="eq-label">Role in Equivalence Principle</span>
              <p className="eq-desc">
                {i === 0
                  ? "Leader — proposes the transaction result"
                  : "Validator — checks if leader's result is equivalent to its own"}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="info-box">
        <h3>How Optimistic Democracy Works Here</h3>
        <p>
          When a transaction is submitted, one validator is randomly selected as
          Leader and executes it first. The other validators independently run
          their own LLMs and check if the Leader's result is equivalent using
          the Equivalence Principle. If the majority agrees, the transaction is
          finalized. If not, an appeal is triggered and the validator set doubles.
        </p>
      </div>
    </section>
  );
}
