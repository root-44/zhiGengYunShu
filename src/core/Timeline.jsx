import React from "react";
export default function Timeline() {
  return (
    <div className="timeline">
      {["创建命令", "下发到设备", "硬件接收", "执行完成"].map((item, index) => (
        <span key={item}><b>{index + 1}</b>{item}</span>
      ))}
    </div>
  );
}
