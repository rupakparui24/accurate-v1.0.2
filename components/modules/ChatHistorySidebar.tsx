import { ChatSession, SavedPrompt } from "@/lib/types";

interface ChatHistorySidebarProps {
  chatSessions: ChatSession[];
  currentSessionId: string | null;
  savedPrompts: SavedPrompt[];
  onSelectSession: (session: ChatSession) => void;
  onCreateNewSession: () => void;
  onSelectSavedPrompt: (prompt: SavedPrompt) => void;
}

export function ChatHistorySidebar({
  chatSessions,
  currentSessionId,
  savedPrompts,
  onSelectSession,
  onCreateNewSession,
  onSelectSavedPrompt
}: ChatHistorySidebarProps) {
  return (
    <aside className="chat-history-sidebar">
      <div className="chat-history-header">
        <button type="button" className="new-chat-btn" onClick={onCreateNewSession}>
          + New Chat
        </button>
      </div>

      <div className="chat-history-section">
        <div className="chat-history-title">Chat History</div>
        {chatSessions.length === 0 ? (
          <p className="chat-history-empty">Start a new chat to see your sessions.</p>
        ) : (
          <ul className="chat-sessions-list">
            {chatSessions.slice(0, 10).map((session) => (
              <li key={session.id} className={currentSessionId === session.id ? "active-session" : ""}>
                <button type="button" onClick={() => onSelectSession(session)}>
                  <span className="session-title">{session.title}</span>
                  <span className="session-meta">
                    {session.turns.length} {session.turns.length === 1 ? 'message' : 'messages'} • {new Date(session.updatedAt).toLocaleDateString()}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="chat-history-section">
        <div className="chat-history-title">Saved prompts</div>
        {savedPrompts.length === 0 ? (
          <p className="chat-history-empty">Pin prompts during a chat to reuse them here.</p>
        ) : (
          <ul className="saved-prompts-list">
            {savedPrompts.map((prompt) => (
              <li key={prompt.id}>
                <button type="button" onClick={() => onSelectSavedPrompt(prompt)}>
                  <span className="prompt-label">{prompt.label}</span>
                  <span className="prompt-meta">{new Date(prompt.createdAt).toLocaleDateString()}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}