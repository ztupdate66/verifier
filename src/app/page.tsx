"use client";

import { useEffect, useState } from "react";
import {
  Upload, CheckCircle2, XCircle, Server, Mail, Loader2,
  Search, Filter, Download, Trash2, BarChart3, RefreshCw
} from "lucide-react";

interface EmailResult {
  id: string;
  email: string;
  domain: string;
  isKonsoleh: boolean;
  konsolehServer: string | null;
  smtpVerified: boolean;
  mxRecords: string[];
  formatValid: boolean;
  domainExists: boolean;
  notes: string | null;
}

interface Stats {
  total: number;
  konsolehCount: number;
  validCount: number;
  konsolehPercentage: string;
  topDomains: Array<{ domain: string; total: number; konsoleh: number }>;
}

export default function Home() {
  const [emails, setEmails] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [results, setResults] = useState<EmailResult[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filter, setFilter] = useState<"all" | "konsoleh">("all");
  const [search, setSearch] = useState("");
  const [sessionName, setSessionName] = useState("");
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    loadResults();
    loadStats();
  }, [filter, search]);

  async function loadResults() {
    try {
      const params = new URLSearchParams();
      if (filter === "konsoleh") params.set("konsolehOnly", "true");
      if (search) params.set("search", search);
      params.set("limit", "100");

      const res = await fetch(`/api/results?${params}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error("Failed to load results:", err);
    }
  }

  async function loadStats() {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  }

  async function handleVerify() {
    const emailList = emails
      .split(/[\n,;]/)
      .map((e) => e.trim())
      .filter((e) => e.includes("@"));

    if (emailList.length === 0) {
      alert("Please enter at least one email address");
      return;
    }

    if (emailList.length > 1000) {
      alert("Maximum 1000 emails per batch");
      return;
    }

    setVerifying(true);

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emails: emailList,
          sessionName: sessionName || `Verification ${new Date().toLocaleString()}`,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(
          `✓ Verified ${data.total} emails\n\n` +
          `• KonsoleH Hosted: ${data.konsolehCount}\n` +
          `• SMTP Valid: ${data.validCount}`
        );
        setEmails("");
        setSessionName("");
        await loadResults();
        await loadStats();
      } else {
        alert("Error: " + (data.error || "Verification failed"));
      }
    } catch (err: any) {
      alert("Error: " + (err?.message || "Network error"));
    } finally {
      setVerifying(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      setEmails(content);
    };
    reader.readAsText(uploadedFile);
  }

  async function clearAll() {
    if (!confirm("Delete all verification data?")) return;

    try {
      await fetch("/api/results", { method: "DELETE" });
      await loadResults();
      await loadStats();
      alert("All data cleared");
    } catch (err) {
      alert("Error clearing data");
    }
  }

  function exportCSV() {
    const filtered = results.filter((r) => {
      if (filter === "konsoleh" && !r.isKonsoleh) return false;
      if (search && !r.email.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    const csv = [
      ["Email", "Domain", "KonsoleH Hosted", "KonsoleH Server", "SMTP Valid", "MX Records"].join(","),
      ...filtered.map((r) =>
        [
          r.email,
          r.domain,
          r.isKonsoleh ? "Yes" : "No",
          r.konsolehServer || "-",
          r.smtpVerified ? "Yes" : "No",
          r.mxRecords.join("; "),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `konsoleh-verification-${Date.now()}.csv`;
    a.click();
  }

  const filteredResults = results.filter((r) => {
    if (filter === "konsoleh" && !r.isKonsoleh) return false;
    if (search && !r.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Server size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">KonsoleH Email Verifier</h1>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                Verify emails and detect konsoleH.co.za / xneelo hosting
              </p>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 fade-in">
            <StatCard
              icon={<Mail size={20} className="text-blue-500" />}
              label="Total Verified"
              value={stats.total.toString()}
            />
            <StatCard
              icon={<Server size={20} className="text-green-500" />}
              label="KonsoleH Hosted"
              value={stats.konsolehCount.toString()}
              subtitle={`${stats.konsolehPercentage}%`}
            />
            <StatCard
              icon={<CheckCircle2 size={20} className="text-emerald-500" />}
              label="SMTP Valid"
              value={stats.validCount.toString()}
            />
            <button
              onClick={() => setShowStats(!showStats)}
              className="glass rounded-xl p-4 hover:bg-gray-800 transition text-left"
            >
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 size={20} className="text-purple-500" />
                <span className="text-sm" style={{ color: "var(--muted)" }}>
                  Analytics
                </span>
              </div>
              <div className="text-xl font-bold">View</div>
            </button>
          </div>
        )}

        {/* Top Domains Stats */}
        {showStats && stats && stats.topDomains.length > 0 && (
          <div className="glass rounded-xl p-6 mb-6 fade-in">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 size={20} /> Top Domains
            </h3>
            <div className="space-y-2">
              {stats.topDomains.map((d) => (
                <div key={d.domain} className="flex items-center justify-between py-2 border-b border-gray-700">
                  <span className="font-mono text-sm">{d.domain}</span>
                  <div className="flex items-center gap-4 text-sm">
                    <span style={{ color: "var(--muted)" }}>Total: {d.total}</span>
                    {d.konsoleh > 0 && (
                      <span className="text-green-500 font-semibold">
                        KonsoleH: {d.konsoleh}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="glass rounded-xl p-6 fade-in">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Upload size={20} /> Verify Emails
            </h2>

            <input
              type="text"
              placeholder="Session name (optional)"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg mb-4 bg-gray-800 border border-gray-700 outline-none focus:border-blue-500 transition"
            />

            <textarea
              placeholder="Enter emails (one per line, or comma/semicolon separated)&#10;&#10;Example:&#10;user1@example.co.za&#10;user2@company.com&#10;admin@business.co.za"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              className="w-full h-64 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 outline-none focus:border-blue-500 transition font-mono text-sm resize-none"
            />

            <div className="flex items-center gap-3 mt-4">
              <label className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 hover:border-gray-600 transition">
                  <Upload size={18} />
                  <span className="text-sm">
                    {file ? file.name : "Upload .txt or .csv"}
                  </span>
                </div>
                <input
                  type="file"
                  accept=".txt,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleVerify}
                disabled={verifying || !emails.trim()}
                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition flex items-center gap-2"
              >
                {verifying ? (
                  <>
                    <Loader2 size={18} className="spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    Verify
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-blue-900/20 border border-blue-800/30">
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                <strong>Detection:</strong> Checks MX records for konsoleH.co.za, xneelo.com, your-server.de, and Hetzner patterns.
                Also performs DNS + SMTP verification.
              </p>
            </div>
          </div>

          {/* Results Panel */}
          <div className="glass rounded-xl p-6 fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Mail size={20} /> Results ({filteredResults.length})
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadResults()}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
                  title="Refresh"
                >
                  <RefreshCw size={16} />
                </button>
                <button
                  onClick={exportCSV}
                  disabled={results.length === 0}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 transition"
                  title="Export CSV"
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={clearAll}
                  disabled={results.length === 0}
                  className="p-2 rounded-lg bg-red-900/30 hover:bg-red-900/50 disabled:opacity-50 transition"
                  title="Clear all data"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2 rounded-lg bg-gray-800 p-1">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1 rounded text-sm transition ${
                    filter === "all" ? "bg-blue-600" : "hover:bg-gray-700"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("konsoleh")}
                  className={`px-3 py-1 rounded text-sm transition flex items-center gap-1 ${
                    filter === "konsoleh" ? "bg-green-600" : "hover:bg-gray-700"
                  }`}
                >
                  <Server size={14} />
                  KonsoleH Only
                </button>
              </div>

              <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800">
                <Search size={16} style={{ color: "var(--muted)" }} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent outline-none flex-1 text-sm"
                />
              </div>
            </div>

            {/* Results List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredResults.length === 0 ? (
                <div className="text-center py-12" style={{ color: "var(--muted)" }}>
                  <Mail size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No results yet. Verify emails to see results here.</p>
                </div>
              ) : (
                filteredResults.map((result) => (
                  <div
                    key={result.id}
                    className="p-3 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-sm mb-1 truncate">{result.email}</div>
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <span style={{ color: "var(--muted)" }}>{result.domain}</span>
                          {result.isKonsoleh && (
                            <span className="px-2 py-0.5 rounded-full bg-green-900/30 text-green-400 font-semibold flex items-center gap-1">
                              <Server size={12} />
                              KonsoleH
                            </span>
                          )}
                          {result.smtpVerified && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-900/30 text-emerald-400">
                              SMTP ✓
                            </span>
                          )}
                        </div>
                        {result.konsolehServer && (
                          <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                            Server: <span className="font-mono">{result.konsolehServer}</span>
                          </div>
                        )}
                        {result.mxRecords && result.mxRecords.length > 0 && (
                          <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                            MX: {result.mxRecords.slice(0, 2).join(", ")}
                            {result.mxRecords.length > 2 && ` +${result.mxRecords.length - 2} more`}
                          </div>
                        )}
                      </div>
                      <div>
                        {result.domainExists ? (
                          <CheckCircle2 size={20} className="text-green-500" />
                        ) : (
                          <XCircle size={20} className="text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-sm" style={{ color: "var(--muted)" }}>
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {subtitle && (
        <div className="text-sm" style={{ color: "var(--muted)" }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}
