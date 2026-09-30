import React, { useState } from "react";
import Icon from "./Icon.jsx";

const DEVICE_TYPES = [
  { label: "环境传感器", value: "environment_sensor" },
  { label: "土壤传感器", value: "soil_sensor" },
  { label: "光照传感器", value: "light_sensor" },
  { label: "CO2传感器", value: "co2_sensor" },
  { label: "灌溉控制器", value: "irrigation_controller" },
  { label: "风机控制器", value: "fan_controller" },
  { label: "卷帘控制器", value: "shade_controller" },
  { label: "摄像头", value: "camera" },
  { label: "网关设备", value: "gateway" },
  { label: "气象站", value: "weather_station" },
  { label: "土壤墒情站", value: "soil_moisture_station" },
];

export default function AddDeviceModal({ onClose, onAdd, existingAreas = [], farmId = "", submitting = false }) {
  const [form, setForm] = useState({
    deviceId: "",
    name: "",
    type: DEVICE_TYPES[0].value,
    assetId: "",
    firmwareVersion: "",
  });

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting || !form.name.trim()) return;

    await onAdd({
      deviceId: form.deviceId.trim() || undefined,
      name: form.name.trim(),
      type: form.type,
      assetId: form.assetId.trim() || undefined,
      firmwareVersion: form.firmwareVersion.trim() || undefined,
      farmId: farmId || undefined,
    });
  }

  return (
    <div className="add-device-backdrop" onClick={submitting ? undefined : onClose}>
      <section
        className="add-device-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-device-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="add-device-head">
          <div>
            <span>设备管理</span>
            <h2 id="add-device-title">新增设备</h2>
          </div>
          <button type="button" aria-label="关闭" onClick={onClose} disabled={submitting}>
            <Icon name="close" />
          </button>
        </header>

        <form className="add-device-form" onSubmit={handleSubmit}>
          <label>
            <span>设备编号（选填）</span>
            <input
              placeholder="不填则自动生成"
              value={form.deviceId}
              onChange={(e) => handleChange("deviceId", e.target.value)}
              disabled={submitting}
            />
          </label>
          <label>
            <span>设备名称</span>
            <input
              required
              placeholder="例如：环境传感器 01"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              disabled={submitting}
            />
          </label>
          <label>
            <span>设备类型</span>
            <select
              value={form.type}
              onChange={(e) => handleChange("type", e.target.value)}
              disabled={submitting}
            >
              {DEVICE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>绑定区域（选填）</span>
            <select
              value={form.assetId}
              onChange={(e) => handleChange("assetId", e.target.value)}
              disabled={submitting}
            >
              <option value="">暂不绑定</option>
              {existingAreas.map((area) => (
                <option key={area.id || area.name} value={area.id || area.name}>
                  {area.name || area.id}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>固件版本（选填）</span>
            <input
              placeholder="例如：v1.0.0"
              value={form.firmwareVersion}
              onChange={(e) => handleChange("firmwareVersion", e.target.value)}
              disabled={submitting}
            />
          </label>
          <div className="add-device-actions">
            <button type="button" className="ghost-button" onClick={onClose} disabled={submitting}>
              取消
            </button>
            <button type="submit" disabled={submitting}>
              {submitting ? "保存中" : "确认新增"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
