import React, { useEffect, useMemo, useState } from "react";
import { Server, Database, Shield, Activity, AlertTriangle, CheckCircle, AlertCircle, Info, Filter, Search, X, Clock, User, FileText } from "lucide-react";
import { listSysadminAlerts, resolveSysadminAlert } from "../../services/api.js";
import { apiErrorMessage, normalizeSysadminAlert, statsFromLogs } from "./alertUtils.js";

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

function StatusBadge({ status, onClick, clickable = false }) {
  const styles = {
    resolved: {
      bg: "rgba(34, 197, 94, 0.1)",
      color: "#22c55e",
      text: "已解决",
      hoverBg: "rgba(34, 197, 94, 0.2)"
    },
    pending: {
      bg: "rgba(234, 179, 8, 0.1)",
      color: "#eab308",
      text: "待处理",
      hoverBg: "rgba(234, 179, 8, 0.2)"
    }
  };
  const style = styles[status] || styles.pending;
  
  return (
    <span
      onClick={onClick}
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
        fontSize: "0.8rem",
        cursor: clickable ? "pointer" : "default",
        transition: "background 150ms ease"
      }}
      onMouseEnter={(e) => {
        if (clickable) {
          e.currentTarget.style.background = style.hoverBg;
        }
      }}
      onMouseLeave={(e) => {
        if (clickable) {
          e.currentTarget.style.background = style.bg;
        }
      }}
    >
      {status === "resolved" && <CheckCircle size={14} />}
      {status === "pending" && <AlertCircle size={14} />}
      {style.text}
    </span>
  );
}

function AlertDetailModal({ alert, onClose, onResolve }) {
  if (!alert) return null;

  const history = [
    { time: alert.time, action: "告警触发", operator: "系统", detail: alert.message },
    ...(alert.status === "resolved" && alert.resolveTime ? [{ time: alert.resolveTime, action: "问题解决", operator: alert.operator, detail: "告警已解决" }] : [])
  ];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px"
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "var(--radius)",
          maxWidth: "600px",
          width: "100%",
          maxHeight: "80vh",
          overflow: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: "20px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <FileText size={20} />
            告警详情
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.05)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: "20px" }}>
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
              <AlertLevelBadge level={alert.level} />
              <StatusBadge status={alert.status} />
            </div>
            
            <div style={{ display: "grid", gap: "12px" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ color: "var(--muted)", minWidth: "80px" }}>告警类型:</span>
                <span style={{ fontWeight: "600" }}>{alert.type}</span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ color: "var(--muted)", minWidth: "80px" }}>设备编号:</span>
                <span style={{ fontFamily: "monospace", background: "rgba(0,0,0,0.05)", padding: "2px 8px", borderRadius: "4px" }}>{alert.source}</span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ color: "var(--muted)", minWidth: "80px" }}>位置:</span>
                <span>{alert.location}</span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ color: "var(--muted)", minWidth: "80px" }}>告警时间:</span>
                <span style={{ fontFamily: "monospace" }}>{alert.time}</span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ color: "var(--muted)", minWidth: "80px" }}>告警信息:</span>
                <span>{alert.message}</span>
              </div>
              {alert.operator && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <span style={{ color: "var(--muted)", minWidth: "80px" }}>处理人:</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <User size={14} />
                    {alert.operator}
                  </span>
                </div>
              )}
              {alert.resolveTime && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <span style={{ color: "var(--muted)", minWidth: "80px" }}>解决时间:</span>
                  <span style={{ fontFamily: "monospace", color: "#22c55e" }}>{alert.resolveTime}</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--line)", paddingTop: "20px" }}>
            <h4 style={{ margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <Clock size={18} />
              处理历史
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {history.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    gap: "12px",
                    padding: "12px",
                    background: "rgba(53, 195, 107, 0.05)",
                    borderRadius: "8px",
                    borderLeft: "3px solid var(--primary)"
                  }}
                >
                  <div style={{ minWidth: "140px", color: "var(--muted)", fontSize: "0.85rem", fontFamily: "monospace" }}>
                    {item.time}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "600", marginBottom: "4px" }}>{item.action}</div>
                    <div style={{ fontSize: "0.9rem", color: "var(--text-2)" }}>{item.detail}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "4px" }}>
                      操作人: {item.operator}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {alert.status === "pending" && (
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: "20px", marginTop: "20px" }}>
              <button
                onClick={() => {
                  onResolve(alert.id);
                  onClose();
                }}
                style={{
                  width: "100%",
                  padding: "12px 24px",
                  background: "#22c55e",
                  color: "#fff",
                  border: "none",
                  borderRadius: "var(--radius)",
                  fontSize: "1rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "background 150ms ease"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#16a34a"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#22c55e"; }}
              >
                <CheckCircle size={20} />
                处理完成
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SysadminOverview() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(statsFromLogs([]));
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [resolvingId, setResolvingId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedAlert, setSelectedAlert] = useState(null);

  async function loadAlerts(params = {}) {
    setLoading(true);
    setListError("");
    try {
      const response = await listSysadminAlerts({ page: 1, pageSize: 100, ...params });
      const data = response?.data?.data ?? response?.data ?? {};
      const nextLogs = (data.items || []).map(normalizeSysadminAlert);
      setLogs(nextLogs);
      setStats(data.stats || statsFromLogs(nextLogs));
    } catch (error) {
      setLogs([]);
      setStats(statsFromLogs([]));
      setListError(apiErrorMessage(error, "系统告警日志加载失败，请稍后重试。"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAlerts();
  }, []);

  const filteredLogs = useMemo(() => logs.filter(log => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = String(log.message || "").toLowerCase().includes(term) ||
                         String(log.source || "").toLowerCase().includes(term) ||
                         String(log.location || "").toLowerCase().includes(term) ||
                         String(log.type || "").toLowerCase().includes(term);
    const matchesLevel = filterLevel === "all" || log.level === filterLevel;
    const matchesStatus = filterStatus === "all" || log.status === filterStatus;
    return matchesSearch && matchesLevel && matchesStatus;
  }), [filterLevel, filterStatus, logs, searchTerm]);

  const handleStatusClick = (alert) => {
    // 待处理和已解决都可以点击查看详情
    if (alert.status === "resolved" || alert.status === "pending") {
      setSelectedAlert(alert);
    }
  };

  const handleResolve = async (alertId) => {
    setResolvingId(alertId);
    try {
      const response = await resolveSysadminAlert(alertId);
      const updated = normalizeSysadminAlert(response?.data?.data ?? {});
      setLogs(prev => prev.map(log => log.id === alertId ? { ...log, ...updated } : log));
      setSelectedAlert((current) => current?.id === alertId ? { ...current, ...updated } : current);
      await loadAlerts();
    } catch (error) {
      setListError(apiErrorMessage(error, "告警处理失败，请稍后重试。"));
    } finally {
      setResolvingId("");
    }
  };

  return (
    <div className="workspace">
      <div className="screen-head">
        <div>
          <h2>系统监控总览</h2>
        </div>
      </div>

      <div className="stat-strip" style={{ marginBottom: "20px" }}>
        <article>
          <span>设备总数</span>
          <strong>{stats.totalDevices}</strong>
          <small>{stats.onlineDevices} 台在线</small>
        </article>
        <article>
          <span>离线设备</span>
          <strong style={{ color: "#ef4444" }}>{stats.offlineDevices}</strong>
          <small>需排查</small>
        </article>
        <article>
          <span>待处理告警数</span>
          <strong style={{ color: "#eab308" }}>{stats.pendingAlerts}</strong>
          <small>需处理</small>
        </article>
        <article>
          <span>严重告警</span>
          <strong style={{ color: "#ef4444" }}>{stats.criticalAlerts}</strong>
          <small>需紧急处理</small>
        </article>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "16px", marginBottom: "20px" }}>
        <div className="panel">
          <h3>系统状态</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
            <div style={{ padding: "14px", background: "rgba(34, 197, 94, 0.08)", borderRadius: "var(--radius)", border: "1px solid rgba(34, 197, 94, 0.2)" }}>
              <Server size={32} style={{ color: "#22c55e", marginBottom: "10px" }} />
              <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--text)" }}>正常</div>
              <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "4px" }}>服务器状态</div>
            </div>
            <div style={{ padding: "14px", background: "rgba(34, 197, 94, 0.08)", borderRadius: "var(--radius)", border: "1px solid rgba(34, 197, 94, 0.2)" }}>
              <Database size={32} style={{ color: "#22c55e", marginBottom: "10px" }} />
              <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--text)" }}>正常</div>
              <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "4px" }}>数据库连接</div>
            </div>
            <div style={{ padding: "14px", background: "rgba(234, 179, 8, 0.08)", borderRadius: "var(--radius)", border: "1px solid rgba(234, 179, 8, 0.2)" }}>
              <Shield size={32} style={{ color: "#eab308", marginBottom: "10px" }} />
              <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--text)" }}>监控中</div>
              <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "4px" }}>安全防护</div>
            </div>
          </div>
        </div>

        <div className="panel">
          <h3>告警统计</h3>
          <div style={{ display: "grid", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "rgba(239, 68, 68, 0.06)", borderRadius: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={18} style={{ color: "#ef4444" }} />
                <span style={{ color: "var(--text)", fontWeight: "700" }}>严重告警</span>
              </div>
              <span style={{ fontSize: "1.2rem", fontWeight: "800", color: "#ef4444" }}>{stats.criticalAlerts}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "rgba(234, 179, 8, 0.06)", borderRadius: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Activity size={18} style={{ color: "#eab308" }} />
                <span style={{ color: "var(--text)", fontWeight: "700" }}>待处理</span>
              </div>
              <span style={{ fontSize: "1.2rem", fontWeight: "800", color: "#eab308" }}>{stats.pendingAlerts}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "rgba(34, 197, 94, 0.06)", borderRadius: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle size={18} style={{ color: "#22c55e" }} />
                <span style={{ color: "var(--text)", fontWeight: "700" }}>已解决</span>
              </div>
              <span style={{ fontSize: "1.2rem", fontWeight: "800", color: "#22c55e" }}>{stats.resolvedAlerts}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <h3 style={{ margin: 0 }}>告警日志</h3>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ position: "relative", minWidth: "200px", maxWidth: "300px" }}>
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
                  minHeight: "40px",
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
                    minHeight: "40px",
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
                    minHeight: "40px",
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
                  <option value="resolved">已解决</option>
                </select>
              </div>
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
              {filteredLogs.map((log) => (
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
                    <StatusBadge 
                      status={log.status} 
                      clickable={true}
                      onClick={() => handleStatusClick(log)}
                    />
                  </td>
                  <td style={{ padding: "14px", color: "var(--text)" }}>
                    {log.operator || "-"}
                  </td>
                  <td style={{ padding: "14px", color: log.resolveTime ? "var(--text-2)" : "var(--muted)", fontFamily: "monospace", fontSize: "0.9rem" }}>
                    {log.resolveTime || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
            <Info size={48} style={{ margin: "0 auto 12px", opacity: "0.5" }} />
            <p style={{ fontWeight: "700" }}>暂无匹配的告警记录</p>
          </div>
        )}
      </div>

      {selectedAlert && (
        <AlertDetailModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onResolve={handleResolve}
        />
      )}
    </div>
  );
}
