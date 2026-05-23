const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("kaito_token");
}

function authHeaders() {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function registerUser(name: string, email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) throw new Error("Register failed");
  return res.json();
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function sendMessage(message: string) {
  const res = await fetch(`${API_URL}/api/chat/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ message }),
  });

  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}

export async function streamMessage(
  message: string,
  onChunk: (chunk: string) => void
) {
  const res = await fetch(`${API_URL}/api/chat/stream`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ message }),
  });

  if (!res.ok || !res.body) {
    throw new Error("Streaming failed");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    onChunk(chunk);
  }
}

export async function getChatHistory() {
  const res = await fetch(`${API_URL}/api/chat/history`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Failed to get history");
  return res.json();
}

export async function getMemories() {
  const res = await fetch(`${API_URL}/api/chat/memories`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Failed to get memories");
  return res.json();
}

export async function getMood() {
  const res = await fetch(`${API_URL}/api/chat/mood`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Failed to get mood");
  return res.json();
}