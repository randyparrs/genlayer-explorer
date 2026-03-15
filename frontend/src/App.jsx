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
