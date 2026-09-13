import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { socket } from "../services/socket";
import axios from "axios";

const getInitials = (username) => {
  return username ? username.charAt(0).toUpperCase() : "?";
};

const avatarColors = [
  "bg-pink-600", "bg-cyan-500", "bg-purple-600", "bg-fuchsia-500",
  "bg-violet-600", "bg-rose-500", "bg-indigo-500", "bg-teal-500",
];

const getAvatarColor = (username) => {
  if (!username) return "bg-gray-600";
  const index = username.charCodeAt(0) % avatarColors.length;
  return avatarColors[index];
};

const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  return `${import.meta.env.VITE_API_URL.replace("/api", "")}${avatarPath}`;
};

const ChatPage = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/messages`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Greška pri učitavanju poruka:", error);
      }
    };

    loadMessages();
    socket.connect();
    socket.emit("userConnected", { id: user.id, username: user.username, avatar: user.avatar });

    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    socket.on("receiveMessage", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("onlineUsers");
      socket.disconnect();
    };
  }, [token, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    socket.emit("sendMessage", {
      senderId: user.id,
      text: text,
    });

    setText("");
  };

  return (
    <div className="flex h-screen relative overflow-hidden bg-[#0f0c29]">
      {/* Neonski krugovi u pozadini */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-pink-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse pointer-events-none"></div>

      {/* Sidebar */}
      <div className="relative z-10 w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-xl font-black text-transparent bg-clip-text bg-linear-to-r from-pink-500 to-cyan-400 tracking-wide">
            SECRET CHAT
          </h2>
          <p className="text-sm text-gray-400 mt-1">Ćao, {user?.username}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-xs uppercase text-cyan-400 font-bold mb-3 tracking-widest">
            Online ({onlineUsers.length})
          </p>
          <div className="space-y-3">
            {onlineUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3">
                <div className="relative">
                  <div className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold text-white ring-2 ring-white/10 ${!getAvatarUrl(u.avatar) ? getAvatarColor(u.username) : ""}`}>
                    {getAvatarUrl(u.avatar) ? (
                      <img src={getAvatarUrl(u.avatar)} alt={u.username} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(u.username)
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-black shadow-[0_0_6px_rgba(74,222,128,0.8)]"></span>
                </div>
                <span className="text-sm text-gray-200">{u.username}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            to="/profile"
            className="block text-center text-sm text-gray-300 hover:text-cyan-400 transition-colors py-2 rounded-lg border border-white/10 hover:border-cyan-400/50"
          >
            Moj profil
          </Link>
          <button
            onClick={handleLogout}
            className="w-full bg-linear-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 transition-all py-2 rounded-lg text-sm font-semibold text-white shadow-lg shadow-pink-500/30"
          >
            Odjavi se
          </button>
        </div>
      </div>

      {/* Glavni chat deo */}
      <div className="relative z-10 flex-1 flex flex-col">
        <div className="bg-black/30 backdrop-blur-xl border-b border-white/10 p-4">
          <h2 className="text-lg font-bold text-white tracking-wide">Opšti chat</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => {
            const isOwnMessage = msg.sender?._id === user.id;

            return (
              <div
                key={msg._id}
                className={`flex items-end gap-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                {!isOwnMessage && (
                  <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold text-white shrink-0 ring-2 ring-white/10 ${!getAvatarUrl(msg.sender?.avatar) ? getAvatarColor(msg.sender?.username) : ""}`}>
                    {getAvatarUrl(msg.sender?.avatar) ? (
                      <img src={getAvatarUrl(msg.sender.avatar)} alt={msg.sender?.username} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(msg.sender?.username)
                    )}
                  </div>
                )}

                <div className={`max-w-xs px-4 py-2 rounded-2xl ${
                  isOwnMessage
                    ? " from-pink-600 to-cyan-600 text-white rounded-br-sm shadow-lg shadow-pink-500/20"
                    : "bg-white/10 backdrop-blur-md border border-white/10 text-gray-100 rounded-bl-sm"
                }`}>
                  {!isOwnMessage && (
                    <p className="text-xs font-bold text-cyan-400 mb-1">
                      {msg.sender?.username}
                    </p>
                  )}
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 bg-black/30 backdrop-blur-xl border-t border-white/10 flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Napiši poruku..."
            className="flex-1 bg-white/5 border border-white/20 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
          />
          <button
            type="submit"
            className="from-pink-600 to-cyan-500 hover:from-pink-500 hover:to-cyan-400 transition-all text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg shadow-pink-500/30"
          >
            Pošalji
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;