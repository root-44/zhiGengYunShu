import React from "react";
import Icon from "../core/Icon.jsx";

export default function ProfileModal({ profileRole = "farmer", onClose }) {
  const isAdmin = profileRole === "admin";
  const profileFields = isAdmin
    ? [
        ["姓名", "农场管理员"],
        ["联系电话", "139 0000 6666"],
        ["所属农场", "智慧农场运营中心"],
        ["负责区域", "全场大棚 / 地块 / 设备"],
        ["角色身份", "农场管理员"],
        ["通知偏好", "全场告警、设备上报"]
      ]
    : [
        ["姓名", "农户管理员"],
        ["联系电话", "138 0000 8888"],
        ["所属农场", "南区智慧农场"],
        ["负责区域", "大棚 A 区 / 地块 P 区"],
        ["角色身份", "农户管理员"],
        ["通知偏好", "任务提醒、设备告警"]
      ];

  return (
    <div className="profile-modal-backdrop">
      <section
        className="profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        <header className="profile-modal-head">
          <div>
            <span>个人信息</span>
            <h2 id="profile-modal-title">修改个人信息</h2>
          </div>
          <button type="button" aria-label="关闭个人信息" onClick={onClose}>
            <Icon name="close" />
          </button>
        </header>
        <form className="profile-form">
          {profileFields.map(([label, value]) => (
            <label key={label}>
              <span>{label}</span>
              <input defaultValue={value} />
            </label>
          ))}
          <div className="profile-actions">
            <button type="button" className="ghost-button" onClick={onClose}>取消</button>
            <button type="button" onClick={onClose}>保存修改</button>
          </div>
        </form>
      </section>
    </div>
  );
}
