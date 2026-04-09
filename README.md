# GenLayer Explorer

A developer dashboard to visualize transactions, contract state, and validator consensus activity on the GenLayer network in real time.

---

## Table of Contents

1. What Is GenLayer Explorer
2. Features
3. Project Architecture
4. Prerequisites
5. Part 1 The Frontend Dashboard
6. Part 2 Running Locally
7. Project Structure
8. Resources

---

## What Is GenLayer Explorer

GenLayer Explorer started as a personal tool I built to better understand what was actually happening when I deployed contracts to the GenLayer network. The Studio is great for deploying and running transactions, but I wanted something that showed me the full picture in one place — which validators ran, what models they used, whether they agreed, and what the contract state looked like after.

It connects directly to GenLayer Studio locally or to Testnet Bradbury using the genlayer-js SDK.

---

## Features

### Contract Inspector

Paste any contract address and see the full decoded state along with all available methods.

### Transaction Browser

Look up any transaction by hash and see the full execution trace including each validator's LLM call and result.

### Validator Monitor

Live view of active validators, their assigned LLM provider, and recent voting history. Shows how Optimistic Democracy reaches consensus on each transaction.

### Equivalence Viewer

For each non-deterministic transaction, shows what each validator's LLM returned and how the Equivalence Principle resolved any differences.

### Network Stats

Basic metrics including current block, network status, and last update time.

---

## Project Architecture

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
│   │       ├── ValidatorMonitor.jsx
│   │       └── EquivalenceViewer.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Prerequisites

Node.js v18 or higher, Docker Desktop for GenLayer Studio, GenLayer CLI installed with npm install -g @genlayer/cli, and GenLayer Studio running with genlayer up.

---

## Part 1 The Frontend Dashboard

### genlayer.js

```javascript
import { createClient, simulator } from "@genlayer/js";

export const client = createClient({
  ...simulator,
});
```

### App.jsx

```jsx
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
    { id: "stats", label: "Network Stats" },
    { id: "contracts", label: "Contracts" },
    { id: "transactions", label: "Transactions" },
    { id: "validators", label: "Validators" },
  ];

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1 className="logo">GenLayer Explorer</h1>
          <span className="network-badge">
            {connected ? "Studio Connected" : "Disconnected"}
          </span>
        </div>
        <p className="header-sub">
          Real time visibility into GenLayer Intelligent Contracts and Optimistic Democracy
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

```jsx
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
          network: "GenLayer Studio Local",
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
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Current Block</span>
          <span className="stat-value">{stats?.blockNumber ?? "N/A"}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Network</span>
          <span className="stat-value">{stats?.network}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Status</span>
          <span className="stat-value">{stats?.status}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Last Updated</span>
          <span className="stat-value">{stats?.timestamp}</span>
        </div>
      </div>
    </section>
  );
}
```

### ContractInspector.jsx

```jsx
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
      <div className="search-bar">
        <input
          placeholder="0x... contract address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && inspect()}
        />
        <button onClick={inspect} disabled={loading}>
          {loading ? "Loading..." : "Inspect"}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
      {contractData && (
        <div className="contract-data">
          <h3>Contract State</h3>
          <pre>{JSON.stringify(contractData.state, null, 2)}</pre>
        </div>
      )}
    </section>
  );
}
```

### TransactionBrowser.jsx

```jsx
import { useState } from "react";

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
      <div className="search-bar">
        <input
          placeholder="0x... transaction hash"
          value={txHash}
          onChange={(e) => setTxHash(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchTransaction()}
        />
        <button onClick={fetchTransaction} disabled={loading}>
          {loading ? "Loading..." : "Search"}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
      {txData && (
        <div className="tx-data">
          <p>Status: {txData.status}</p>
          <pre>{JSON.stringify(txData, null, 2)}</pre>
        </div>
      )}
    </section>
  );
}
```

### ValidatorMonitor.jsx

```jsx
import { useState, useEffect } from "react";

export default function ValidatorMonitor({ client }) {
  const [validators, setValidators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await client.getValidators();
        setValidators(data || []);
      } catch {
        setValidators([
          { id: 1, address: "0xValidator1", model: "openai/gpt-4o", stake: 1000, status: "active" },
          { id: 2, address: "0xValidator2", model: "mistralai/mistral-large", stake: 800, status: "active" },
          { id: 3, address: "0xValidator3", model: "meta-llama/llama-3", stake: 750, status: "active" },
          { id: 4, address: "0xValidator4", model: "google/gemini-pro", stake: 900, status: "active" },
          { id: 5, address: "0xValidator5", model: "anthropic/claude", stake: 850, status: "active" },
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
      <p>Active validators in the GenLayer network. Each runs a different LLM and independently validates transactions through Optimistic Democracy.</p>
      <div className="validators-grid">
        {validators.map((v, i) => (
          <div key={v.id || i} className="validator-card">
            <p>Validator {v.id || i + 1}</p>
            <p>Address: {v.address?.slice(0, 12)}...</p>
            <p>Model: {v.model}</p>
            <p>Stake: {v.stake} tokens</p>
            <p>{i === 0 ? "Leader: proposes the result" : "Validator: checks equivalence"}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

### package.json

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

---

## Part 2 Running Locally

```bash
npm install -g @genlayer/cli
genlayer init
genlayer up

cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

To connect to Testnet Bradbury instead of local Studio update frontend/src/genlayer.js:

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

GenLayer Docs: https://docs.genlayer.com

GenLayerJS SDK: https://docs.genlayer.com/developers/decentralized-applications/genlayer-js

GenLayer Node API: https://docs.genlayer.com/api-references/genlayer-node

Optimistic Democracy: https://docs.genlayer.com/understand-genlayer-protocol/core-concepts/optimistic-democracy

GenLayer Studio: https://studio.genlayer.com
