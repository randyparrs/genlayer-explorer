import { useState } from "react";

const STATUS_COLORS = {
  FINALIZED: "green",
  PENDING: "yellow",
  CANCELED: "red",
  UNDETERMINED: "gray",
};

export default function TransactionBrowser({ client }) {
  const [txHash, setTxHash] = useState("");
  const [txData, setTxData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransaction = async () => {
    if (!txHash) return alert("Enter a transaction hash");
    setLoading(true);
    setError(null);
    setTxData(null);

    try {
      const receipt = await client.getTransactionReceipt({ hash: txHash });
      setTxData(receipt);
    } catch (err) {
      setError(`Could not load transaction: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="transaction-browser">
      <h2>Transaction Browser</h2>
      <p className="section-desc">
        Look up any transaction by hash to see its full execution trace,
        validator votes, and consensus result.
      </p>

      <div className="search-bar">
        <input
          placeholder="0x... transaction hash"
          value={txHash}
          onChange={(e) => setTxHash(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchTransaction()}
          className="address-input"
        />
        <button onClick={fetchTransaction} disabled={loading} className="btn-primary">
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {txData && (
        <div className="tx-data">
          <div className="tx-header">
            <span className="tx-hash">{txData.transactionHash?.slice(0, 20)}...</span>
            <span className={`tx-status status-${STATUS_COLORS[txData.status] || "gray"}`}>
              {txData.status}
            </span>
          </div>

          <div className="tx-grid">
            <div className="tx-field">
              <span className="field-label">From</span>
              <code>{txData.from?.slice(0, 16)}...</code>
            </div>
            <div className="tx-field">
              <span className="field-label">To (Contract)</span>
              <code>{txData.to?.slice(0, 16)}...</code>
            </div>
            <div className="tx-field">
              <span className="field-label">Block</span>
              <code>{txData.blockNumber ?? "Pending"}</code>
            </div>
            <div className="tx-field">
              <span className="field-label">Function</span>
              <code>{txData.data?.function_name ?? "N/A"}</code>
            </div>
          </div>

          {txData.consensus_data && (
            <div className="consensus-section">
              <h3>Optimistic Democracy Consensus</h3>
              <div className="validator-votes">
                {txData.consensus_data?.validators?.map((v, i) => (
                  <div key={i} className={`validator-vote ${v.vote === "agree" ? "agree" : "disagree"}`}>
                    <span className="v-label">Validator {i + 1}</span>
                    <span className="v-model">{v.model ?? "Unknown LLM"}</span>
                    <span className="v-vote">{v.vote === "agree" ? "✅ Agree" : "❌ Disagree"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {txData.result && (
            <div className="data-section">
              <h3>Result</h3>
              <pre className="state-display">
                {JSON.stringify(txData.result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
