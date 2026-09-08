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

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const messageRoutes = require("./routes/messageRoutes");
app.use("/api/messages", messageRoutes);

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

io.on("connection", (socket) => {
  console.log("🔌 Korisnik povezan:", socket.id);

  socket.on("sendMessage", async (data) => {
    try {
      const { senderId, text } = data;

      const newMessage = new Message({
        sender: senderId,
        text: text,
      });

      await newMessage.save();

      const populatedMessage = await newMessage.populate("sender", "username");

      io.emit("receiveMessage", populatedMessage);
    } catch (error) {
      console.log("Greška pri slanju poruke:", error);
    }

  })

  socket.on("disconnect", () => {
    console.log("❌ Korisnik se odvojio:", socket.id);
  })
})

server.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

