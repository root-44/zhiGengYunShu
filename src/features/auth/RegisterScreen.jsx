import React, { useState } from "react";
import { register } from "../../services/api.js";

export default function RegisterScreen({ onRegister, onSwitchView }) {
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [account, setAccount] = useState("farmer@farm.local");
  const [farmName, setFarmName] = useState("智慧农场");
  const [password, setPassword] = useState("123456");
  const [role, setRole] = useState("farmer");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const errs = {};
    if (!displayName.trim()) errs.displayName = "请输入姓名";
    if (!phone.trim()) errs.phone = "请输入手机号";
    if (!account.trim()) errs.account = "请输入账号";
    if (!farmName.trim()) errs.farmName = "请输入农场名称";
    if (!password) errs.password = "请设置密码";
    else if (password.length < 6) errs.password = "密码至少6位";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const roleIdMap = { admin: "farm_admin", farmer: "farmer", sysadmin: "system_admin" };
    setLoading(true);
    try {
      const res = await register({
        displayName: displayName.trim(),
        phone: phone.trim(),
        account: account.trim(),
        farmName: farmName.trim(),
        password,
        roleId: roleIdMap[role] || "farmer",
      });
      if (res.data.success && res.data.data) {
        onRegister(res.data.data);
      } else {
        setErrors({ register: res.data.error?.message || "注册失败" });
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || "网络错误，请检查后端服务";
      setErrors({ register: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <span>新用户注册</span>
      <h1>注册</h1>
      {errors.register && (
        <div style={{ color: "var(--danger)", fontSize: "0.82rem", padding: "8px 12px", background: "#fee2e2", borderRadius: "6px", marginBottom: "8px" }}>
          {errors.register}
        </div>
      )}
      <label>
        <b>姓名</b>
        <input
          value={displayName}
          onChange={(e) => { setDisplayName(e.target.value); setErrors((p) => ({ ...p, displayName: "", register: "" })); }}
          placeholder="输入姓名"
          disabled={loading}
          style={{ borderColor: errors.displayName ? "var(--danger)" : "" }}
        />
        {errors.displayName && <small style={{ color: "var(--danger)", fontSize: "0.74rem" }}>{errors.displayName}</small>}
      </label>
      <label>
        <b>手机号</b>
        <input
          value={phone}
          onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: "", register: "" })); }}
          placeholder="输入手机号"
          disabled={loading}
          style={{ borderColor: errors.phone ? "var(--danger)" : "" }}
        />
        {errors.phone && <small style={{ color: "var(--danger)", fontSize: "0.74rem" }}>{errors.phone}</small>}
      </label>
      <label>
        <b>账号</b>
        <input
          value={account}
          onChange={(e) => { setAccount(e.target.value); setErrors((p) => ({ ...p, account: "", register: "" })); }}
          placeholder="设置唯一账号"
          disabled={loading}
          style={{ borderColor: errors.account ? "var(--danger)" : "" }}
        />
        {errors.account && <small style={{ color: "var(--danger)", fontSize: "0.74rem" }}>{errors.account}</small>}
      </label>
      <label>
        <b>农场名称</b>
        <input
          value={farmName}
          onChange={(e) => { setFarmName(e.target.value); setErrors((p) => ({ ...p, farmName: "", register: "" })); }}
          placeholder="输入农场名称"
          disabled={loading}
          style={{ borderColor: errors.farmName ? "var(--danger)" : "" }}
        />
        {errors.farmName && <small style={{ color: "var(--danger)", fontSize: "0.74rem" }}>{errors.farmName}</small>}
      </label>
      <label>
        <b>密码</b>
        <input
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "", register: "" })); }}
          placeholder="设置密码"
          disabled={loading}
          style={{ borderColor: errors.password ? "var(--danger)" : "" }}
        />
        {errors.password && <small style={{ color: "var(--danger)", fontSize: "0.74rem" }}>{errors.password}</small>}
      </label>
      <div className="role-options" role="radiogroup" aria-label="选择身份">
        {[
          ["admin", "农场管理员"],
          ["farmer", "农户身份"],
          ["sysadmin", "系统管理员"]
        ].map(([value, label]) => (
          <label className={role === value ? "active" : ""} key={value}>
            <input
              name="role"
              type="radio"
              value={value}
              checked={role === value}
              onChange={() => setRole(value)}
              disabled={loading}
            />
            <strong>{label}</strong>
          </label>
        ))}
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "注册中..." : "注册并进入"}
      </button>
      <button type="button" className="auth-text-button" onClick={() => onSwitchView("login")} disabled={loading}>
        已有账号，去登录
      </button>
    </form>
  );
}
