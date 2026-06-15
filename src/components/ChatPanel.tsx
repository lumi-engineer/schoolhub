"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, Button, Input } from "./ui";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string; role: string };
}

interface Channel {
  id: string;
  type: string;
  name: string | null;
  members: { user: { id: string; name: string; role: string } }[];
  messages: { content: string; sender: { name: string } }[];
}

interface Contact {
  id: string;
  name: string;
  role: string;
  class?: { name: string } | null;
}

export function ChatPanel({ canMessageStudents = false }: { canMessageStudents?: boolean }) {
  const [channels, setChannels] = useState<{ direct: Channel[]; group: Channel[] }>({
    direct: [],
    group: [],
  });
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadChannels = useCallback(async () => {
    const res = await fetch("/api/channels");
    if (res.ok) setChannels(await res.json());
  }, []);

  const loadContacts = useCallback(async () => {
    const res = await fetch("/api/contacts");
    if (res.ok) setContacts(await res.json());
  }, []);

  const loadMessages = useCallback(async (channelId: string) => {
    const res = await fetch(`/api/channels/${channelId}/messages`);
    if (res.ok) setMessages(await res.json());
  }, []);

  useEffect(() => {
    loadChannels();
    loadContacts();
  }, [loadChannels, loadContacts]);

  useEffect(() => {
    if (!activeChannel) return;
    loadMessages(activeChannel.id);
    const interval = setInterval(() => loadMessages(activeChannel.id), 5000);
    return () => clearInterval(interval);
  }, [activeChannel, loadMessages]);

  async function startDirectChat(userId: string) {
    const res = await fetch("/api/channels/direct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      const channel = await res.json();
      await loadChannels();
      const full = channels.direct.find((c) => c.id === channel.id);
      setActiveChannel(full || { ...channel, members: [], messages: [] });
      loadMessages(channel.id);
    }
  }

  async function sendMessage() {
    if (!activeChannel || !newMessage.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/channels/${activeChannel.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newMessage }),
    });
    if (res.ok) {
      setNewMessage("");
      await loadMessages(activeChannel.id);
    }
    setLoading(false);
  }

  function channelLabel(channel: Channel) {
    if (channel.name) return channel.name;
    const others = channel.members.map((m) => m.user.name).join(", ");
    return others || "Direct message";
  }

  const filteredContacts = contacts.filter((c) => {
    if (canMessageStudents) return true;
    return c.role !== "STUDENT";
  });

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card title="Channels" className="lg:col-span-1">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Group chats
            </p>
            <div className="space-y-1">
              {channels.group.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                    activeChannel?.id === ch.id
                      ? "bg-indigo-50 text-indigo-700"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  {channelLabel(ch)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Direct messages
            </p>
            <div className="space-y-1">
              {channels.direct.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                    activeChannel?.id === ch.id
                      ? "bg-indigo-50 text-indigo-700"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  {channelLabel(ch)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Start a chat
            </p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {filteredContacts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => startDirectChat(c.id)}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50 text-slate-700"
                >
                  {c.name}
                  <span className="text-slate-400"> · {c.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card
        title={activeChannel ? channelLabel(activeChannel) : "Select a channel"}
        className="lg:col-span-2"
      >
        {!activeChannel ? (
          <p className="text-sm text-slate-500">Choose a channel or start a direct message.</p>
        ) : (
          <div className="flex h-[420px] flex-col">
            <div className="flex-1 space-y-3 overflow-y-auto pr-2">
              {messages.map((msg) => (
                <div key={msg.id} className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-xs font-medium text-indigo-600">
                    {msg.sender.name}
                    <span className="text-slate-400"> · {msg.sender.role}</span>
                  </p>
                  <p className="text-sm text-slate-800">{msg.content}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(msg.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
              {messages.length === 0 && (
                <p className="text-sm text-slate-400">No messages yet. Say hello!</p>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <Button onClick={sendMessage} disabled={loading || !newMessage.trim()}>
                Send
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
