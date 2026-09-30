import React, { useMemo, useRef, useState } from "react";
import Icon from "./Icon.jsx";
import { chatWithAssistant } from "../services/api.js";

function assistantErrorMessage(error) {
  return error?.response?.data?.error?.message
    || error?.response?.data?.message
    || error?.message
    || "AI 小助手暂时无法连接后端，请稍后再试";
}

function createChatId(currentUser) {
  const role = currentUser?.role || "guest";
  const userId = currentUser?.userId || currentUser?.account || "anonymous";
  return `floating-${role}-${userId}`;
}

export default function FloatingAssistant({ currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "你好，我是 AI 小助手。你可以问我任务、设备、告警、病害诊断、社区和供需相关问题。",
    },
  ]);
  const chatIdRef = useRef(createChatId(currentUser));

  const quickPrompts = useMemo(() => [
    "帮我查看今天有哪些待办任务",
    "设备离线应该先检查什么？",
    "当前告警怎么处理？",
  ], []);

  async function sendMessage(text = input) {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    setInput("");
    setIsSending(true);
    setMessages((current) => [...current, { role: "user", text: trimmed }]);

    try {
      const response = await chatWithAssistant({
        chatId: chatIdRef.current,
        message: trimmed,
      });
      const payload = response.data?.data || response.data || {};
      if (payload.chatId) {
        chatIdRef.current = payload.chatId;
      }
      setMessages((current) => [
        ...current,
        { role: "assistant", text: payload.answer || "我已经收到请求，但后端没有返回具体内容。" },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        { role: "assistant", text: assistantErrorMessage(error), isError: true },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="floating-assistant">
      {isOpen && (
        <section className="floating-assistant-panel" aria-label="AI 小助手对话框">
          <header className="floating-assistant-head">
            <div>
              <span>Agent Assistant</span>
              <strong>AI 小助手</strong>
            </div>
            <button type="button" aria-label="关闭 AI 小助手" onClick={() => setIsOpen(false)}>
              <Icon name="close" />
            </button>
          </header>

          <div className="floating-assistant-thread">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`floating-assistant-message ${message.role}${message.isError ? " error" : ""}`}
              >
                <span>{message.role === "user" ? "我" : "AI 小助手"}</span>
                <p>{message.text}</p>
              </div>
            ))}
            {isSending && (
              <div className="floating-assistant-message assistant pending">
                <span>AI 小助手</span>
                <p>正在调用后端 agent 分析...</p>
              </div>
            )}
          </div>

          <div className="floating-assistant-prompts">
            {quickPrompts.map((prompt) => (
              <button key={prompt} type="button" onClick={() => sendMessage(prompt)} disabled={isSending}>
                {prompt}
              </button>
            ))}
          </div>

          <div className="floating-assistant-composer">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入你的问题，回车发送"
              disabled={isSending}
              rows={2}
            />
            <button type="button" onClick={() => sendMessage()} disabled={isSending || !input.trim()}>
              发送
            </button>
          </div>
        </section>
      )}

      <button
        type="button"
        className="floating-assistant-trigger"
        aria-label="打开 AI 小助手"
        onClick={() => setIsOpen((current) => !current)}
      >
        <Icon name="chat" />
        <span>AI</span>
      </button>
    </div>
  );
}
