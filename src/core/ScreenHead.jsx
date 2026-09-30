import React from "react";
export default function ScreenHead({ title, action, secondary, badge, onAction, onSecondary }) {
  return (
    <div className="screen-head">
      <div>
        {badge && <span className="page-badge">{badge}</span>}
        <h2>{title}</h2>
      </div>
      <div>
        {secondary && <button type="button" className="ghost-button" onClick={onSecondary}>{secondary}</button>}
        {action && <button type="button" onClick={onAction}>{action}</button>}
      </div>
    </div>
  );
}
