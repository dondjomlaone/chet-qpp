import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { socket } from "../services/socket";
import axios from "axios";


const ChatPage = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("")

    const handleLogout = () => {
        logout();
        navigate("/login")
    };

    //Ucitavanje istorje poruka i povezivanje na Socket.io
    useEffect(() => {
        const loadMessages = async() => {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/messages`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessages(response.data);
}

loadMessages();

socket.connect();

socket.on("receiveMessage", (newMessage) => {
    setMessages((prevMessages) => [...prevMessages, newMessage])
 });
 return()=>{
    socket.off("receiveMessage");
    socket.disconnect();
 };
},[token]);

const handleSend = (e) => {
    e.preventDefault();
    if(!text.trim()) return;

    socket.emit("sendMessage", {
        senderId: user.id,
        text: text,
    });
    
    setText("")
}

return (

    <div>
        <h2>Secret Chat</h2>
        <button onClick={handleLogout}>Odjavi se</button>

        <div style={{border:"1px solid gray", height:"300px", overflow:"auto", margin:"10px 0", padding:"10px"}}>
            {messages.map((msg)=>(
                <p key={msg._id}>
                    <strong>{msg.sender?.username}:</strong> {msg.text}
                </p>
            ))}
        </div>
        <form onSubmit={handleSend}>
            <input  
                type="text"
                value={text}
                onChange={(e)=> setText(e.target.value)}
                placeholder="Napiši poruku..."
            />
            <button type="submit">Pošalji</button>
        </form>
    </div>

);

};

export default ChatPage;