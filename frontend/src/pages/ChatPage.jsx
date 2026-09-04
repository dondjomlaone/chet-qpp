import { useAuth } from "../context/AuthContext";

const ChatPage = () => {
    const { user, logout } = useAuth();

    return (
        
        <div>
            <h2>Dobrodošao, {user?.username}!</h2>
            <p>Ovo je chat stranica (uskoro cemo je srediti da bude u fulu fukcionalna).</p>
            <button onClick={logout}>Odjavi se</button>
        </div>

    );

}

export default ChatPage;