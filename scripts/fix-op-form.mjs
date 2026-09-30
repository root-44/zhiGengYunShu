import fs from "fs";

const lines = fs.readFileSync("src/main.jsx", "utf8").split("\n");

// Replace lines 2161-2205 (0-indexed: 2160-2204)
const start = 2160;
const end = 2204;

const replacement = [
  `        <div style={{ display: 'grid', gap: 10 }}>`,
  `          {screen.operation === 'irrigation' && [`,
  `            ['灌溉区域', 'region', 'text', null],`,
  `            ['绑定设备', 'device', 'text', null],`,
  `            ['控制模式', 'mode', 'select', ['手动控制', '定时执行', '阈值联动']],`,
  `            ['目标水分', 'target', 'text', null],`,
  `          ].map(([label, key, type, options]) => (`,
  `            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 'var(--radius)', background: 'linear-gradient(135deg, #f8fdf9, #f0faf3)', border: '1px solid rgba(53,195,107,0.1)' }}>`,
  `              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text)', minWidth: 72, whiteSpace: 'nowrap' }}>{label}</span>`,
  `              {type === 'select' ? (`,
  `                <select value={formValues[key]} onChange={(e) => setFormValues((p) => ({ ...p, [key]: e.target.value }))} style={{ flex: 1, minHeight: 36, border: '1px solid var(--line)', borderRadius: 6, padding: '0 10px', color: 'var(--text)', background: '#fff', fontSize: '0.84rem', outline: 'none' }}>`,
  `                  {options.map((o) => <option key={o}>{o}</option>)}`,
  `                </select>`,
  `              ) : (`,
  `                <input value={formValues[key]} onChange={(e) => setFormValues((p) => ({ ...p, [key]: e.target.value }))} style={{ flex: 1, minHeight: 36, border: '1px solid var(--line)', borderRadius: 6, padding: '0 10px', color: 'var(--text)', background: '#fff', fontSize: '0.84rem', outline: 'none' }} />`,
  `              )}`,
  `            </div>`,
  `          ))}`,
  `          {screen.operation === 'device' && [`,
  `            ['绑定区域', 'region'], ['最后上报', 'lastReport', true], ['异常类型', 'errorType'],`,
  `          ].map(([label, key, readonly]) => (`,
  `            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 'var(--radius)', background: 'linear-gradient(135deg, #faf8fd, #f3f0fa)', border: '1px solid rgba(124,92,231,0.1)' }}>`,
  `              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text)', minWidth: 72, whiteSpace: 'nowrap' }}>{label}</span>`,
  `              <input value={formValues[key]} onChange={(e) => !readonly && setFormValues((p) => ({ ...p, [key]: e.target.value }))} readOnly={readonly} style={{ flex: 1, minHeight: 36, border: '1px solid var(--line)', borderRadius: 6, padding: '0 10px', color: readonly ? 'var(--muted)' : 'var(--text)', background: readonly ? '#f9fafb' : '#fff', fontSize: '0.84rem', outline: 'none' }} />`,
  `            </div>`,
  `          ))}`,
  `          {screen.operation === 'fertilization' && [`,
  `            ['施肥区域', 'region'], ['肥料类型', 'fertilizer'], ['计划用量', 'amount'], ['作物类型', 'crop'], ['施肥方式', 'method'], ['计划时间', 'time'],`,
  `          ].map(([label, key]) => (`,
  `            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 'var(--radius)', background: 'linear-gradient(135deg, #fdf9f2, #fef6e8)', border: '1px solid rgba(201,138,16,0.1)' }}>`,
  `              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text)', minWidth: 72, whiteSpace: 'nowrap' }}>{label}</span>`,
  `              <input value={formValues[key]} onChange={(e) => setFormValues((p) => ({ ...p, [key]: e.target.value }))} style={{ flex: 1, minHeight: 36, border: '1px solid var(--line)', borderRadius: 6, padding: '0 10px', color: 'var(--text)', background: '#fff', fontSize: '0.84rem', outline: 'none' }} />`,
  `            </div>`,
  `          ))}`,
  `        </div>`,
  `        <div className="operation-actions" style={{ marginTop: 16 }}>`,
  `          {screen.operation === 'irrigation' && (`,
  `            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.84rem', fontWeight: 700, color: 'var(--text)', padding: '8px 12px', borderRadius: 8, background: '#f8fdf9', border: '1px solid rgba(53,195,107,0.12)' }}>`,
  `              暂停 <input type="number" value={pauseMin} onChange={(e) => setPauseMin(Number(e.target.value))} min="1" max="120" style={{ width: 52, textAlign: 'center', minHeight: 30, border: '1px solid var(--line)', borderRadius: 6, padding: '0 4px', fontSize: '0.84rem', fontWeight: 700, color: 'var(--accent)' }} /> 分钟`,
  `            </label>`,
  `          )}`,
  `          {actionLabels.map((action) => (`,
  `            <button key={action} type="button" onClick={actionMap[action] || (() => { addLog(action, '已执行'); toast(action + ' 已完成', { type: 'success' }); })}>`,
  `              {action}`,
  `            </button>`,
  `          ))}`,
  `        </div>`,
];

const result = [...lines.slice(0, start), ...replacement, ...lines.slice(end + 1)];
fs.writeFileSync("src/main.jsx", result.join("\n"));
console.log("Done - replaced lines", start + 1, "to", end + 1);
