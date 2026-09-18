import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { socket } from "../services/socket";
import EmojiPicker from "emoji-picker-react";
import axios from "axios";
import UserProfileModel from "../components/UserProfileModel";

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
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [activePrivateChat, setActivePrivateChat] = useState(null);
  const [privateMessages, setPrivateMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const activePrivateChatRef = useRef(null);
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

    socket.on("receivePrivateMessage", (newMessage) => {
      const isFromMe = newMessage.sender._id === user.id;

      setPrivateMessages((prev) => {
        const isRelevant =
          (newMessage.sender._id === activePrivateChatRef.current?._id) ||
          (newMessage.recipient === activePrivateChatRef.current?._id);
        return isRelevant ? [...prev, newMessage] : prev;
      });

      if (!isFromMe) {
        const isCurrentIyOpen = activePrivateChatRef.current?._id === newMessage.sender._id;

        setConversations((prev) => {
          const exists = prev.find((c) => c._id === newMessage.sender._id)

          if (exists) {
            return prev.map((c) =>
              c._id === newMessage.sender._id
                ? {
                  ...c,
                  unreadCount: isCurrentIyOpen ? 0 : c.unreadCount + 1,
                  lastMessage: newMessage.text,
                }
                : c
            );
          }
          return [
            ...prev,
            {
              _id: newMessage.sender._id,
              username: newMessage.sender.username,
              avatar: newMessage.sender.avatar,
              unreadCount: isCurrentIyOpen ? 0 : 1,
              lastMessage: newMessage.text,
            },
          ];
        });
      }
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("onlineUsers");
      socket.off("receivePrivateMessage");
      socket.disconnect();
    };
  }, [token, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, privateMessages]);

  useEffect(() => {
    activePrivateChatRef.current = activePrivateChat;
  }, [activePrivateChat]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() && !selectedFile) return;

    let mediaUrl = "";
    let mediaType = null;

    if (selectedFile) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/upload/chat-media`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        mediaUrl = response.data.mediaUrl;
        mediaType = response.data.mediaType;

        console.log("UPLOAD USPJESAN:", mediaUrl, mediaType);

      } catch (error) {
        console.error("Greška pri uploadu fajla:", error);
        setUploading(false);
        return
      }
      setUploading(false)
    }

    const messageData = { senderId: user.id, text, mediaUrl, mediaType };

    console.log("PORUKA ZA SLANJE", {senderId: user.id, text, mediaUrl, mediaType, activePrivateChat})

    if (activePrivateChat) {
      socket.emit("sendPrivateMessage", { ...messageData, recipientId: activePrivateChat._id });
    } else {
      socket.emit("sendMessage", messageData);
    }

    setText("");
    cancelFileSelection();
  };

  const openPrivateChat = async (targetUser) => {
    setActivePrivateChat(targetUser);

    setConversations((prev) => {
      const exists = prev.find((c) => c._id === targetUser._id)
      if (exists) {
        return prev.map((c) =>
          c._id === targetUser._id ? { ...c, unreadCount: 0 } : c
        );
      }
      return [
        ...prev,
        { _id: targetUser._id, username: targetUser.username, avatar: targetUser.avatar, unreadCount: 0, lastMessage: "" },
      ];
    });

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/messages/private/${targetUser._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPrivateMessages(response.data);
    } catch (error) {
      console.log("Greška pri učitavanju privatnih poruka:", error);
    }
  };

  const backToPublicChat = () => {
    setActivePrivateChat(null);
    setPrivateMessages([]);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setFilePreview({
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
    });
  };

  const cancelFileSelection = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  }

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
              <div
                key={u.id}
                className="flex items-center gap-3 cursor-pointer hover:bg-white/5 rounded-lg p-1 transition-colors"
                onClick={() => setSelectedUserId(u.id)}
              >
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

        {conversations.length > 0 && (
          <div className="mt-6">
            <p className="text-xs uppercase text-pink-400 font-bold mb-3 ml-3 tracking-widest">
              Private Messages
            </p>
            <div className="space-y-2">
              {conversations.map((c) => (
                <div
                  key={c._id}
                  onClick={() => openPrivateChat(c)}
                  className={`flex items-center gap-3 cursor-pointer rounded-lg p-2 transition-colors ${activePrivateChat?._id === c._id ? "bg-white/10" : "hover:bg-white/5"
                    }`}
                >
                  <div className="relative">
                    <div className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold text-white ring-2 ring-white/10 ${!getAvatarUrl(c.avatar) ? getAvatarColor(c.username) : ""}`}>
                      {getAvatarUrl(c.avatar) ? (
                        <img src={getAvatarUrl(c.avatar)} alt={c.username} className="w-full h-full object-cover" />
                      ) : (
                        getInitials(c.username)
                      )}
                    </div>
                    {c.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-[0_0_6px_rgba(236,72,153,0.8)]">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate">{c.username}</p>
                    {c.lastMessage && (
                      <p className="text-xs text-gray-500 truncate">{c.lastMessage}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
        <div className="bg-black/30 backdrop-blur-xl border-b border-white/10 p-4 flex items-center gap-3">
          {activePrivateChat && (
            <button
              onClick={backToPublicChat}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ←
            </button>
          )}
          <div className="flex items-center gap-3">
            {activePrivateChat ? (
              <div
                className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold text-white shrink-0 ${
                  !getAvatarUrl(activePrivateChat.avatar)
                    ? getAvatarColor(activePrivateChat.username)
                    : ""
                }`}
              >
                {getAvatarUrl(activePrivateChat.avatar) ? (
                  <img
                    src={getAvatarUrl(activePrivateChat.avatar)}
                    alt={activePrivateChat.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(activePrivateChat.username)
                )}
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-linear-to-r from-pink-600 to-cyan-600 flex items-center justify-center text-sm font-bold text-white">
                #
              </div>
            )}

            <h2 className="text-lg font-bold text-white tracking-wide">
              {activePrivateChat ? activePrivateChat.username : "Opšti chat"}
            </h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {(activePrivateChat ? privateMessages : messages).map((msg) => {
            const isOwnMessage = msg.sender?._id === user.id;

            return (
              <div
                key={msg._id}
                className={`flex items-end gap-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                {!isOwnMessage && (
                  <div
                    className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold text-white shrink-0 ring-2 ring-white/10 cursor-pointer ${!getAvatarUrl(msg.sender?.avatar) ? getAvatarColor(msg.sender?.username) : ""}`}
                    onClick={() => setSelectedUserId(msg.sender?._id)}
                  >
                    {getAvatarUrl(msg.sender?.avatar) ? (
                      <img src={getAvatarUrl(msg.sender.avatar)} alt={msg.sender?.username} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(msg.sender?.username)
                    )}
                  </div>
                )}

                <div className={`max-w-xs rounded-2xl overflow-hidden ${
                  isOwnMessage
                    ? "bg-linear-to-r from-pink-600 to-cyan-600 text-white rounded-br-sm shadow-lg shadow-pink-500/20"
                    : "bg-white/10 backdrop-blur-md border border-white/10 text-gray-100 rounded-bl-sm"
                }`}>
                  {msg.attachment?.url && (
                    <div className="bg-black/40">
                      {msg.attachment.type === "video" ? (
                        <video
                          src={`${import.meta.env.VITE_API_URL.replace("/api", "")}${msg.attachment.url}`}
                          controls
                          className="w-full max-h-64 object-cover"
                        />
                      ) : (
                        <img
                          src={`${import.meta.env.VITE_API_URL.replace("/api", "")}${msg.attachment.url}`}
                          alt="media"
                          className="w-full max-h-64 object-cover"
                        />
                      )}
                    </div>
                  )}
                  {(msg.text || !isOwnMessage) && (
                    <div className="px-4 py-2">
                      {!isOwnMessage && (
                        <p
                          className="text-xs font-bold text-cyan-400 mb-1 cursor-pointer hover:underline"
                          onClick={() => setSelectedUserId(msg.sender?._id)}
                        >
                          {msg.sender?.username}
                        </p>
                      )}
                      {msg.text && <p className="text-sm">{msg.text}</p>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="bg-black/30 backdrop-blur-xl border-t border-white/10 relative">
          {showEmojiPicker && (
            <div className="absolute bottom-full left-4 mb-2 z-50">
              <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
            </div>
          )}

          {filePreview && (
            <div className="p-3 border-b border-white/10 flex items-center gap-3">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-black/40 shrink-0">
                {filePreview.type === "video" ? (
                  <video src={filePreview.url} className="w-full h-full object-cover" />
                ) : (
                  <img src={filePreview.url} alt="preview" className="w-full h-full object-cover" />
                )}
              </div>
              <span className="text-sm text-gray-300 truncate flex-1">{selectedFile?.name}</span>
              <button
                type="button"
                onClick={cancelFileSelection}
                className="text-gray-400 hover:text-pink-400 transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          <div className="p-4 flex gap-2 items-center">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              ref={fileInputRef}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-2xl hover:scale-110 transition-transform"
            >
              📎
            </button>

            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="text-2xl hover:scale-110 transition-transform"
            >
              😊
            </button>

            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Napiši poruku..."
              className="flex-1 bg-white/5 border border-white/20 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            />

            <button
              type="submit"
              disabled={uploading}
              className="bg-linear-to-r from-pink-600 to-cyan-500 hover:from-pink-500 hover:to-cyan-400 transition-all text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg shadow-pink-500/30 disabled:opacity-50"
            >
              {uploading ? "..." : "Pošalji"}
            </button>
          </div>
        </form>
      </div>

      {selectedUserId && (
        <UserProfileModel
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onStartChat={(targetUser) => openPrivateChat(targetUser)}
        />
      )}
    </div>
  );
};

export default ChatPage;