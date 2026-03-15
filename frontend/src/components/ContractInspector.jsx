import { useState } from "react";

export default function ContractInspector({ client }) {
  const [address, setAddress] = useState("");
  const [contractData, setContractData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const inspect = async () => {
    if (!address) return alert("Enter a contract address");
    setLoading(true);
    setError(null);
    setContractData(null);

    try {
      const [schema, state] = await Promise.all([
        client.getContractSchema({ address }),
        client.getContractState({ address }),
      ]);

      setContractData({ schema, state, address });
    } catch (err) {
      setError(`Could not load contract: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contract-inspector">
      <h2>Contract Inspector</h2>
      <p className="section-desc">
        Enter any deployed contract address to inspect its state and available methods.
      </p>

      <div className="search-bar">
        <input
          placeholder="0x... contract address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && inspect()}
          className="address-input"
        />
        <button onClick={inspect} disabled={loading} className="btn-primary">
          {loading ? "Loading..." : "Inspect"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {contractData && (
        <div className="contract-data">
          <div className="data-section">
            <h3>Contract Address</h3>
            <code className="address-display">{contractData.address}</code>
          </div>

          {contractData.schema && (
            <div className="data-section">
              <h3>Available Methods</h3>
              <div className="methods-list">
                {Object.entries(contractData.schema?.methods || {}).map(([name, method]) => (
                  <div key={name} className="method-card">
                    <span className="method-name">{name}()</span>
                    <span className="method-type">
                      {method.readonly ? "📖 Read" : "✏️ Write"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {contractData.state && (
            <div className="data-section">
              <h3>Contract State</h3>
              <pre className="state-display">
                {JSON.stringify(contractData.state, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
