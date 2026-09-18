const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const Message = require("./models/Message")

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const messageRoutes = require("./routes/messageRoutes");
app.use("/api/messages", messageRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const uploadRoutes = require("./routes/uploadRoutes");
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

const server = http.createServer(app); // Ovdje pravim rucno http server, umesto da Express to radi sam


//Kacimo Socket.io na taj server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // adresa mog React frontenda
    methods: ["GET", "POST"],
  },
});

const onlineUsers = new Map(); //socket.id -> userData(za brzo pronalazenje pri disconect-u)

const getUniqueOnlineUsers = () => {
  const uniqueUsers = new Map(); // user.id -> userData(deduplicirano)
  onlineUsers.forEach((userData) => {
    uniqueUsers.set(userData.id, userData);
  })
  return Array.from(uniqueUsers.values())
};

io.on("connection", (socket) => {
  console.log("🔌 Korisnik povezan:", socket.id);

  socket.on("userConnected", (userData)=>{
    onlineUsers.set(socket.id, userData);
    io.emit("onlineUsers", getUniqueOnlineUsers());
  })

  socket.on("sendMessage", async (data) => {
    try {
      const { senderId, text, mediaUrl, mediaType } = data;

      const newMessage = new Message({
        sender: senderId,
        text: text || "",
        attachment: {
            url: mediaUrl || "",
            type: mediaType || null,
        },
      });

      await newMessage.save();

      const populatedMessage = await newMessage.populate("sender", "username avatar");

      io.emit("receiveMessage", populatedMessage);
    } catch (error) {
      console.log("Greška pri slanju poruke:", error);
    }

  })

  socket.on("sendPrivateMessage", async(data)=>{
    try{
      const { senderId, recipientId, text, mediaUrl, mediaType } = data;

      const newMessage = new Message({
        sender: senderId,
        recipient: recipientId,
        text: text || "",
        attachment: {
            url: mediaUrl || "",
            type: mediaType || null,
        },
      });

      await newMessage.save();

      const populatedMessage = await newMessage.populate("sender", "username avatar");

      onlineUsers.forEach((userData, socketId) =>{
        if(userData.id === senderId || userData.id === recipientId){
          io.to(socketId).emit("receivePrivateMessage", populatedMessage)
        }
      })
    } catch (error){
      console.log("Greška pri slanju privatne poruke:", error);
    }
  })

  socket.on("disconnect", () => {
    console.log("❌ Korisnik se odvojio:", socket.id);
    onlineUsers.delete(socket.id);
    io.emit("onlineUsers", getUniqueOnlineUsers())
  })
})

server.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

