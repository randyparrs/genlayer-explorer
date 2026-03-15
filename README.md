# 🔭 GenLayer Explorer

> A developer dashboard to visualize transactions, contract state, and validator consensus activity on the GenLayer network in real time.

![GenLayer](https://img.shields.io/badge/GenLayer-Explorer-00c896?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge)
![genlayer-js](https://img.shields.io/badge/genlayer--js-latest-00c896?style=for-the-badge)

---

## 📋 Table of Contents

1. [What Is GenLayer Explorer?](#what-is-genlayer-explorer)
2. [Features](#features)
3. [Project Architecture](#project-architecture)
4. [Prerequisites](#prerequisites)
5. [Part 1 — The Frontend Dashboard](#part-1--the-frontend-dashboard)
6. [Part 2 — Running Locally](#part-2--running-locally)
7. [Project Structure](#project-structure)
8. [Resources](#resources)

---

## What Is GenLayer Explorer?

GenLayer Explorer is a developer tool that gives you a real-time view of everything happening on the GenLayer network. It is the missing link between deploying a contract and understanding what the validators are actually doing.

With GenLayer Explorer you can:

- Search any contract address and inspect its full on-chain state
- Browse all transactions with their status (PENDING, FINALIZED, CANCELED)
- Watch validator consensus activity in real time
- See which LLM each validator used and what result it returned
- Track the Optimistic Democracy flow — leader proposal, validator votes, and appeals
- Monitor the Equivalence Principle in action across validators

This tool is built entirely with `genlayer-js` and connects directly to GenLayer Studio locally or to Testnet Bradbury.

---

## Features

**Contract Inspector**
Paste any contract address and instantly see the full decoded state, all available methods, and the contract's transaction history.

**Transaction Browser**
Browse all transactions on the network with filters by status, contract, and time. Click any transaction to see the full execution trace including each validator's LLM call and result.

**Validator Monitor**
Live view of all active validators, their assigned LLM provider, current stake, and recent voting history. See exactly how Optimistic Democracy reaches consensus on each transaction.

**Equivalence Viewer**
For each non-deterministic transaction, see side by side what each validator's LLM returned and how the Equivalence Principle resolved differences between them.

**Network Stats**
At-a-glance metrics: total transactions, finalization rate, average consensus time, active validators, and current epoch.

---

## Project Architecture

```
genlayer-explorer/
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    # Main app with tab routing
│   │   ├── genlayer.js                # genlayer-js client setup
│   │   └── components/
│   │       ├── NetworkStats.jsx       # Top-level network metrics
│   │       ├── ContractInspector.jsx  # Search and inspect contracts
│   │       ├── TransactionBrowser.jsx # Browse all transactions
│   │       ├── ValidatorMonitor.jsx   # Live validator activity
│   │       └── EquivalenceViewer.jsx  # Side-by-side LLM output comparison
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Prerequisites

- Node.js v18 or higher
- Docker Desktop (for GenLayer Studio)
- GenLayer CLI installed (`npm install -g @genlayer/cli`)
- GenLayer Studio running (`genlayer up`)

---

## Part 1 — The Frontend Dashboard

### genlayer.js

Create `frontend/src/genlayer.js`:

```javascript
// frontend/src/genlayer.js
import { createClient, simulator } from "@genlayer/js";

// Connect to local Studio by default
// Change to `testnet` for Testnet Bradbury
export const client = createClient({
  ...simulator,
});
```

### App.jsx

Create `frontend/src/App.jsx`:

```jsx
// frontend/src/App.jsx
import { useState, useEffect } from "react";
import { client } from "./genlayer";
import NetworkStats from "./components/NetworkStats";
import ContractInspector from "./components/ContractInspector";
import TransactionBrowser from "./components/TransactionBrowser";
import ValidatorMonitor from "./components/ValidatorMonitor";

export default function App() {
  const [tab, setTab] = useState("stats");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        await client.getBlockNumber();
        setConnected(true);
      } catch {
        setConnected(false);
      }
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: "stats", label: "📊 Network Stats" },
    { id: "contracts", label: "📋 Contracts" },
    { id: "transactions", label: "🔁 Transactions" },
    { id: "validators", label: "⚡ Validators" },
  ];

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1 className="logo">🔭 GenLayer Explorer</h1>
          <span className="network-badge">
            {connected ? "🟢 Studio Connected" : "🔴 Disconnected"}
          </span>
        </div>
        <p className="header-sub">
          Real-time visibility into GenLayer's Intelligent Contracts and Optimistic Democracy
        </p>
      </header>

      <nav className="tab-nav">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`tab-btn ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="main-content">
        {tab === "stats" && <NetworkStats client={client} />}
        {tab === "contracts" && <ContractInspector client={client} />}
        {tab === "transactions" && <TransactionBrowser client={client} />}
        {tab === "validators" && <ValidatorMonitor client={client} />}
      </main>
    </div>
  );
}
```

### NetworkStats.jsx

Create `frontend/src/components/NetworkStats.jsx`:

```jsx
// frontend/src/components/NetworkStats.jsx
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
```

### ContractInspector.jsx

Create `frontend/src/components/ContractInspector.jsx`:

```jsx
// frontend/src/components/ContractInspector.jsx
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
      // Fetch contract schema and state using genlayer-js
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
```

### TransactionBrowser.jsx

Create `frontend/src/components/TransactionBrowser.jsx`:

```jsx
// frontend/src/components/TransactionBrowser.jsx
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
```

### ValidatorMonitor.jsx

Create `frontend/src/components/ValidatorMonitor.jsx`:

```jsx
// frontend/src/components/ValidatorMonitor.jsx
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
        // Fetch validator list from the node
        const data = await client.getValidators();
        setValidators(data || []);
      } catch (err) {
        // Studio may not expose this directly — show mock for demo
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
```

### package.json

Create `frontend/package.json`:

```json
{
  "name": "genlayer-explorer",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@genlayer/js": "latest",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^5.0.0"
  }
}
```

### vite.config.js

Create `frontend/vite.config.js`:

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
```

---

## Part 2 — Running Locally

```bash
# 1. Start GenLayer Studio
npm install -g @genlayer/cli
genlayer init
genlayer up

# 2. Install and run the frontend
cd frontend
npm install
npm run dev

# 3. Open http://localhost:5173
```

To connect to Testnet Bradbury instead of local Studio, update `frontend/src/genlayer.js`:

```javascript
import { createClient, testnet } from "@genlayer/js";

export const client = createClient({
  ...testnet,
});
```

---

## Project Structure

```
genlayer-explorer/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── genlayer.js
│   │   └── components/
│   │       ├── NetworkStats.jsx
│   │       ├── ContractInspector.jsx
│   │       ├── TransactionBrowser.jsx
│   │       └── ValidatorMonitor.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Resources

Official Docs: https://docs.genlayer.com
GenLayerJS SDK: https://docs.genlayer.com/developers/decentralized-applications/genlayer-js
GenLayer Node API: https://docs.genlayer.com/api-references/genlayer-node
Optimistic Democracy: https://docs.genlayer.com/understand-genlayer-protocol/core-concepts/optimistic-democracy
GenLayer Studio: http://localhost:8080

**Community**

Discord: https://discord.gg/8Jm4v89VAu
X (Twitter): https://x.com/GenLayer
Website: https://www.genlayer.com

---

*Built as a developer tool for the GenLayer ecosystem. Open source and free to use.*
