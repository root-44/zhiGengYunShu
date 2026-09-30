/**
 * SSE 流式回答 Mock
 * ----------------------------------------------------------------
 * 模拟 streamAssistantChat 的打字机效果,逐块输出 AI 回答。
 * 复用 streamAssistantChat 的 onChunk/onDone/onError 回调签名。
 */

const MOCK_REPLIES = [
  "您好,我是智慧农业助手。根据您的问题,建议您先检查大棚内的土壤湿度,如果低于 30% 需要及时灌溉。同时注意通风降湿,避免病害发生。",
  "针对草莓白粉病,建议采取以下措施:1. 清除病叶减少病源;2. 加强通风,将湿度控制在 65% 以下;3. 喷施苯醚甲环唑或代森锰锌防治。一般连续用药 2-3 次即可控制。",
  "大棚温度偏高可以通过以下方式降温:1. 开启顶部和侧边通风口;2. 使用遮阳网遮阴;3. 开启雾化降温系统;4. 必要时开启风机强制通风。建议将温度控制在 30°C 以内。",
  "番茄结果期施肥建议:使用 15-15-30 高钾水溶肥,每 7-10 天冲施一次,配合海藻肥和钙肥,能有效促进果实膨大,防止脐腐病。",
];

function pickReply(message = "") {
  if (!message) return MOCK_REPLIES[0];
  if (/湿度|灌溉|浇水|干旱/.test(message)) return MOCK_REPLIES[0];
  if (/白粉|病害|叶斑|病/.test(message)) return MOCK_REPLIES[1];
  if (/温度|高温|降温|热/.test(message)) return MOCK_REPLIES[2];
  if (/施肥|肥料|追肥|结果/.test(message)) return MOCK_REPLIES[3];
  return MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)];
}

export async function mockStreamAssistantChat(payload = {}, { onChunk, onDone, onError } = {}) {
  try {
    const fullText = pickReply(payload.message || "");
    // 按标点和词组分块,模拟真实流式
    const chunks = fullText.match(/[^,。;:!?,。;:!?]+[,。;:!?]?/g) || [fullText];
    for (const chunk of chunks) {
      await new Promise((r) => setTimeout(r, 80 + Math.random() * 120));
      onChunk?.(chunk);
    }
    onDone?.();
  } catch (e) {
    onError?.(e);
    throw e;
  }
}
