import React, { useEffect, useState } from "react";
import { AlertTriangle, AlertCircle, Info, CheckCircle, Filter, Search } from "lucide-react";
import { listSysadminAlerts } from "../../services/api.js";
import { apiErrorMessage, normalizeSysadminAlert } from "./alertUtils.js";

function AlertLevelBadge({ level }) {
  const styles = {
    error: {
      bg: "rgba(239, 68, 68, 0.15)",
      color: "#ef4444",
      border: "1px solid rgba(239, 68, 68, 0.3)",
      Icon: AlertTriangle
    },
    warning: {
      bg: "rgba(234, 179, 8, 0.15)",
      color: "#eab308",
      border: "1px solid rgba(234, 179, 8, 0.3)",
      Icon: AlertCircle
    },
    info: {
      bg: "rgba(59, 130, 246, 0.15)",
      color: "#3b82f6",
      border: "1px solid rgba(59, 130, 246, 0.3)",
      Icon: Info
    }
  };
  const style = styles[level] || styles.info;
  const Icon = style.Icon;
  
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        minHeight: "28px",
        padding: "0 10px",
        borderRadius: "999px",
        background: style.bg,
        color: style.color,
        border: style.border,
        fontWeight: "700",
        fontSize: "0.8rem"
      }}
    >
      <Icon size={14} />
      {level === "error" ? "严重" : level === "warning" ? "警告" : "提示"}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    resolved: {
      bg: "rgba(34, 197, 94, 0.1)",
      color: "#22c55e",
      text: "已解决"
    },
    processing: {
      bg: "rgba(59, 130, 246, 0.1)",
      color: "#3b82f6",
      text: "处理中"
    },
    pending: {
      bg: "rgba(234, 179, 8, 0.1)",
      color: "#eab308",
      text: "待处理"
    }
  };
  const style = styles[status] || styles.pending;
  
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        minHeight: "28px",
        padding: "0 10px",
        borderRadius: "999px",
        background: style.bg,
        color: style.color,
        fontWeight: "700",
        fontSize: "0.8rem"
      }}
    >
      {status === "resolved" && <CheckCircle size={14} />}
      {status === "processing" && <Info size={14} />}
      {status === "pending" && <AlertCircle size={14} />}
      {style.text}
    </span>
  );
}

export default function AlertLogScreen() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  async function loadAlerts(params = {}) {
    setLoading(true);
    setListError("");
    try {
      const response = await listSysadminAlerts({ page: 1, pageSize: 100, ...params });
      const data = response?.data?.data ?? response?.data ?? {};
      setLogs((data.items || []).map(normalizeSysadminAlert));
    } catch (error) {
      setLogs([]);
      setListError(apiErrorMessage(error, "告警日志加载失败，请稍后重试。"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAlerts();
  }, []);

  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = String(log.message || "").toLowerCase().includes(term) ||
                         String(log.source || "").toLowerCase().includes(term) ||
                         String(log.location || "").toLowerCase().includes(term);
    const matchesLevel = filterLevel === "all" || log.level === filterLevel;
    const matchesStatus = filterStatus === "all" || log.status === filterStatus;
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const stats = {
    total: logs.length,
    error: logs.filter(l => l.level === "error").length,
    warning: logs.filter(l => l.level === "warning").length,
    resolved: logs.filter(l => l.status === "resolved").length,
    processing: logs.filter(l => l.status === "processing").length
  };

  return (
    <div className="workspace">
      <div className="screen-head">
        <div>
          <h2>告警日志</h2>
          <p style={{ color: "var(--muted)", marginTop: "4px", fontWeight: "700" }}>
            系统历史告警记录，支持按级别和状态筛选
          </p>
        </div>
      </div>

      <div className="stat-strip" style={{ marginBottom: "16px" }}>
        <article>
          <span>告警总数</span>
          <strong>{stats.total}</strong>
        </article>
        <article>
          <span>严重告警</span>
          <strong style={{ color: "#ef4444" }}>{stats.error}</strong>
        </article>
        <article>
          <span>警告告警</span>
          <strong style={{ color: "#eab308" }}>{stats.warning}</strong>
        </article>
        <article>
          <span>处理中</span>
          <strong style={{ color: "#3b82f6" }}>{stats.processing}</strong>
        </article>
        <article>
          <span>已解决</span>
          <strong style={{ color: "#22c55e" }}>{stats.resolved}</strong>
        </article>
      </div>

      {listError && (
        <div className="inline-error" style={{ marginBottom: "16px" }}>
          {listError}
        </div>
      )}

      <div className="panel" style={{ padding: "16px" }}>
        <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1", minWidth: "200px", maxWidth: "300px" }}>
            <Search
              size={18}
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }}
            />
            <input
              type="text"
              placeholder="搜索告警信息、设备、位置..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                minHeight: "44px",
                padding: "0 12px 0 42px",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius)",
                background: "#ffffff",
                color: "var(--text)",
                fontSize: "0.9rem"
              }}
            />
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ position: "relative" }}>
              <Filter size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                style={{
                  minHeight: "44px",
                  padding: "0 32px 0 36px",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius)",
                  background: "#ffffff",
                  color: "var(--text)",
                  fontSize: "0.9rem",
                  appearance: "none",
                  cursor: "pointer",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23355d2e' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 10px center"
                }}
              >
                <option value="all">全部级别</option>
                <option value="error">严重</option>
                <option value="warning">警告</option>
                <option value="info">提示</option>
              </select>
            </div>
            <div style={{ position: "relative" }}>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  minHeight: "44px",
                  padding: "0 32px 0 12px",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius)",
                  background: "#ffffff",
                  color: "var(--text)",
                  fontSize: "0.9rem",
                  appearance: "none",
                  cursor: "pointer",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23355d2e' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 10px center"
                }}
              >
                <option value="all">全部状态</option>
                <option value="pending">待处理</option>
                <option value="processing">处理中</option>
                <option value="resolved">已解决</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: "900px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--line)" }}>
                <th style={{ textAlign: "left", padding: "12px 14px", color: "var(--muted)", fontWeight: "900", fontSize: "0.82rem" }}>告警级别</th>
                <th style={{ textAlign: "left", padding: "12px 14px", color: "var(--muted)", fontWeight: "900", fontSize: "0.82rem" }}>告警类型</th>
                <th style={{ textAlign: "left", padding: "12px 14px", color: "var(--muted)", fontWeight: "900", fontSize: "0.82rem" }}>设备编号</th>
                <th style={{ textAlign: "left", padding: "12px 14px", color: "var(--muted)", fontWeight: "900", fontSize: "0.82rem" }}>位置</th>
                <th style={{ textAlign: "left", padding: "12px 14px", color: "var(--muted)", fontWeight: "900", fontSize: "0.82rem" }}>告警时间</th>
                <th style={{ textAlign: "left", padding: "12px 14px", color: "var(--muted)", fontWeight: "900", fontSize: "0.82rem" }}>告警信息</th>
                <th style={{ textAlign: "left", padding: "12px 14px", color: "var(--muted)", fontWeight: "900", fontSize: "0.82rem" }}>状态</th>
                <th style={{ textAlign: "left", padding: "12px 14px", color: "var(--muted)", fontWeight: "900", fontSize: "0.82rem" }}>处理人</th>
                <th style={{ textAlign: "left", padding: "12px 14px", color: "var(--muted)", fontWeight: "900", fontSize: "0.82rem" }}>解决时间</th>
              </tr>
            </thead>
            <tbody>
              {!loading && filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  style={{
                    borderBottom: "1px solid var(--line)",
                    transition: "background 150ms ease"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(53, 195, 107, 0.03)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <td style={{ padding: "14px" }}>
                    <AlertLevelBadge level={log.level} />
                  </td>
                  <td style={{ padding: "14px", color: "var(--text)", fontWeight: "700" }}>
                    {log.type}
                  </td>
                  <td style={{ padding: "14px", color: "var(--text-2)", fontFamily: "monospace" }}>
                    {log.source}
                  </td>
                  <td style={{ padding: "14px", color: "var(--text)" }}>
                    {log.location}
                  </td>
                  <td style={{ padding: "14px", color: "var(--text-2)", fontFamily: "monospace", fontSize: "0.9rem" }}>
                    {log.time}
                  </td>
                  <td style={{ padding: "14px", color: "var(--text)" }}>
                    <span style={{ display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden", maxWidth: "250px" }}>
                      {log.message}
                    </span>
                  </td>
                  <td style={{ padding: "14px" }}>
                    <StatusBadge status={log.status} />
                  </td>
                  <td style={{ padding: "14px", color: "var(--text)" }}>
                    {log.operator}
                  </td>
                  <td style={{ padding: "14px", color: log.resolveTime ? "var(--text-2)" : "var(--muted)", fontFamily: "monospace", fontSize: "0.9rem" }}>
                    {log.resolveTime || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
            <Info size={48} style={{ margin: "0 auto 12px", opacity: "0.5" }} />
            <p style={{ fontWeight: "700" }}>告警日志加载中...</p>
          </div>
        )}

        {!loading && filteredLogs.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
            <Info size={48} style={{ margin: "0 auto 12px", opacity: "0.5" }} />
            <p style={{ fontWeight: "700" }}>暂无匹配的告警记录</p>
          </div>
        )}
      </div>
    </div>
  );
}
