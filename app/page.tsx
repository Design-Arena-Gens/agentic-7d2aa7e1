"use client";

import { useEffect, useMemo, useState } from "react";
import { useChat } from "ai/react";

function getInitialApiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("OPENAI_API_KEY") || "";
}

export default function Page() {
  const [apiKey, setApiKey] = useState<string>(getInitialApiKey());
  const [provider, setProvider] = useState<string>("openai");
  const headers = useMemo(() => ({
    "x-provider": provider,
    "x-openai-key": apiKey || "",
  }), [provider, apiKey]);

  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } = useChat({
    api: "/api/chat",
    headers,
    streamProtocol: "text",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (apiKey) localStorage.setItem("OPENAI_API_KEY", apiKey);
    }
  }, [apiKey]);

  return (
    <div className="chat">
      <div className="tools">
        <div className="kv"><span className="label">Provider</span>
          <select value={provider} onChange={(e) => setProvider(e.target.value)}>
            <option value="openai">OpenAI</option>
            <option value="mock">Mock</option>
          </select>
        </div>
        <div className="kv" style={{flex: 1}}>
          <span className="label">OpenAI API Key</span>
          <input
            type="text"
            placeholder="sk-... (optional if Mock)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
        <span className="notice">Tooling: webFetch, math.calculate</span>
      </div>

      <div className="messages">
        {messages.map((m) => (
          <div key={m.id} className={`msg ${m.role}`}>
            <strong>{m.role === "user" ? "You" : "Assistant"}:</strong> {m.content}
          </div>
        ))}
      </div>

      <form className="inputRow" onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask anything. Try: 'Fetch the title of example.com and add 2+2.'"
        />
        {isLoading ? (
          <button type="button" onClick={() => stop()}>Stop</button>
        ) : (
          <button type="submit">Send</button>
        )}
      </form>
    </div>
  );
}
