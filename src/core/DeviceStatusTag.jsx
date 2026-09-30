import React from "react";
export default function DeviceStatusTag({ value }) {
  const isDanger = ["离线", "紧急", "通信异常", "设备离线"].includes(value);
  return <span className={isDanger ? "device-status-tag danger" : "device-status-tag"}>{value}</span>;
}
