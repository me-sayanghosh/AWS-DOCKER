import "./App.css";
import { Editor } from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import { useRef, useMemo, useState, useEffect } from "react";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";

function App() {
  const editorRef = useRef(null);
  const [isEditorMounted, setIsEditorMounted] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [username, setUsername] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("username") || "";
  });

  const ydoc = useMemo(() => new Y.Doc(), []);
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc]);

  const handleMount = (editor) => {
    editorRef.current = editor;
    setIsEditorMounted(true);
  };

  useEffect(() => {
    if (!username || !isEditorMounted || !editorRef.current) {
      return;
    }

      const provider = new SocketIOProvider("http://localhost:3000", "monaco", ydoc, {
        autoConnect: true,
      });

      const monacoBinding = new MonacoBinding(
        yText,
        editorRef.current.getModel(),
        new Set([editorRef.current]),
        provider.awareness
      );

      provider.awareness.setLocalStateField("user", { username });

      const updateConnectedUsers = () => {
        const names = Array.from(provider.awareness.getStates().values())
          .map((state) => state.user?.username)
          .filter(Boolean);

        const uniqueNames = [...new Set(names)];
        setConnectedUsers(uniqueNames);
      };

      updateConnectedUsers();
      provider.awareness.on("change", updateConnectedUsers);

      provider.on("status", (event) => {
        if (event.status === "disconnected") {
          setConnectedUsers([]);
        }
      });

      return () => {
        provider.awareness.off("change", updateConnectedUsers);
        monacoBinding.destroy();
        provider.destroy();
      };
  }, [ydoc, yText, username, isEditorMounted]);

  const handleJoin = (e) => {
    e.preventDefault();
    const enteredName = e.target[0].value.trim();
    if (!enteredName) {
      return;
    }

    setUsername(enteredName);
    window.history.pushState({}, "", "?username=" + enteredName);
  };

  if (!username) {
    return (
      <main className="h-screen w-full bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 transform transition-all">
          <form onSubmit={handleJoin} className="flex flex-col gap-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
                Welcome!
              </h2>
              <p className="text-sm text-gray-500">
                Enter your username to get started
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                Username
              </label>
              <input
                type="text"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                placeholder="e.g., tech_guru"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl shadow-sm shadow-blue-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Join Session
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <aside className="panel panel-light" aria-label="left panel">
        <div className="panel-inner panel-inner-light users-panel">
          <div className="users-header">
            <h3>Connected Users</h3>
            <span>{connectedUsers.length}</span>
          </div>

          <ul className="users-list" aria-label="Connected users list">
            {connectedUsers.length === 0 ? (
              <li className="users-empty">No users connected</li>
            ) : (
              connectedUsers.map((name) => (
                <li className="user-item" key={name}>
                  <span className="user-dot" aria-hidden="true" />
                  <span>{name}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </aside>

      <section className="panel panel-dark" aria-label="main canvas">
        <div className="canvas-grid" />

        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// some code..."
          onMount={handleMount}
        />
      </section>
    </main>
  );
}

export default App;
