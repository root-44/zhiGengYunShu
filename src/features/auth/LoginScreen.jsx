import React, { useState } from "react";
import { login } from "../../services/api.js";

export default function LoginScreen({ onLogin, onSwitchView }) {
  const [account, setAccount] = useState("admin@farm.local");
  const [password, setPassword] = useState("123456");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const errs = {};
    if (!account.trim()) errs.account = "请输入账号";
    if (!password) errs.password = "请输入密码";
    else if (password.length < 4) errs.password = "密码至少4位";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const res = await login({ account: account.trim(), password, rememberMe: true });
      if (res.data.success && res.data.data) {
        onLogin(res.data.data);
      } else {
        setErrors({ login: res.data.error?.message || "登录失败" });
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || "网络错误，请检查后端服务";
      setErrors({ login: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <span>欢迎回来</span>
      <h1>登录</h1>
      {errors.login && (
        <div style={{ color: "var(--danger)", fontSize: "0.82rem", padding: "8px 12px", background: "#fee2e2", borderRadius: "6px", marginBottom: "8px" }}>
          {errors.login}
        </div>
      )}
      <label>
        <b>账号</b>
        <input
          value={account}
          onChange={(e) => { setAccount(e.target.value); setErrors((p) => ({ ...p, account: "", login: "" })); }}
          placeholder="输入唯一账号"
          disabled={loading}
          style={{ borderColor: errors.account ? "var(--danger)" : "" }}
        />
        {errors.account && <small style={{ color: "var(--danger)", fontSize: "0.74rem" }}>{errors.account}</small>}
      </label>
      <label>
        <b>密码</b>
        <input
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "", login: "" })); }}
          placeholder="输入密码"
          disabled={loading}
          style={{ borderColor: errors.password ? "var(--danger)" : "" }}
        />
        {errors.password && <small style={{ color: "var(--danger)", fontSize: "0.74rem" }}>{errors.password}</small>}
      </label>
      <button type="submit" disabled={loading}>
        {loading ? "登录中..." : "登录进入"}
      </button>
      <button type="button" className="auth-text-button" onClick={() => onSwitchView("register")} disabled={loading}>
        创建新账号
      </button>
    </form>
  );
}
