import React from "react";

function normalizeTaskStatus(status) {
  return String(status || "").trim().toLowerCase();
}

function canAcceptTask(status) {
  return normalizeTaskStatus(status) === "pending";
}

function canSubmitTask(status) {
  return ["accepted", "active", "in_progress", "processing"].includes(normalizeTaskStatus(status));
}

export default function TaskTable({
  compact = false,
  onNavigate,
  readonly = false,
  taskItems,
  onAcceptTask,
  onSubmitTask,
  onAddEvidence,
}) {
  const items = Array.isArray(taskItems) ? taskItems : [];
  const columns = compact
    ? ["任务名称", "任务类型", "截止时间", "状态"]
    : ["任务名称", "任务类型", "区域", "优先级", "状态", "操作"];

  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.length === 0 ? (
          <tr>
            <td colSpan={columns.length}>暂无任务数据</td>
          </tr>
        ) : items.map((task) => {
          const cells = compact
            ? [task.title, task.type, task.deadlineText, task.status]
            : [task.title, task.type, task.assetName, task.priority, task.status];
          const canAccept = canAcceptTask(task.status);
          const canSubmit = canSubmitTask(task.status);

          return (
            <tr key={task.id}>
              {cells.map((cell, index) => (
                <td key={`${task.id}-${index}`}>
                  {index === 0 && !readonly ? (
                      <button
                        className="task-name-link"
                        type="button"
                        onClick={() => onNavigate?.(task.targetId, { taskId: task.id })}
                      >
                        {cell}
                      </button>
                  ) : cell}
                </td>
              ))}
              {!compact && (
                <td>
                  {readonly ? "查看" : (
                    <div className="task-table-actions">
                      <button type="button" onClick={() => onNavigate?.(task.targetId, { taskId: task.id })}>查看</button>
                      <button type="button" disabled={!canAccept} title={canAccept ? "认领任务" : "只有 pending 状态可以认领"} onClick={() => onAcceptTask?.(task.id)}>认领</button>
                      <button type="button" disabled={!canSubmit} title={canSubmit ? "提交任务结果" : "当前状态不能提交"} onClick={() => onSubmitTask?.(task.id)}>提交</button>
                      <button type="button" onClick={() => onAddEvidence?.(task.id)}>凭证</button>
                    </div>
                  )}
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
