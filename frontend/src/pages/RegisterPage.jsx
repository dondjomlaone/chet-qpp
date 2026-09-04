import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"
import { registerUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubimt = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await registerUser(username, email, password);
            login(data.user, data.token);
            navigate("/chat");
        } catch (err) {
            setError(err.response?.data?.message || "Greška prilikom registracije")
        } finally {
            setLoading(false);
        }
    };

    return(
        <div>
            <h2>Registracija</h2>
            <form onSubmit={handleSubimt}>
                <input
                    type="text"
                    placeholder="Korisničko ime"
                    value={username}
                    onChange={(e)=> setUsername(e.target.value)}
                    required
                />
                <input 
                    type="text"
                    placeholder="Email Adresa"
                    value={email}
                    onChange={(e)=> setEmail(e.target.value)}
                    required
                 />
                <input 
                    type="text"
                    placeholder="Password"
                    value={password}
                    onChange={(e)=> setPassword(e.target.value)} 
                />
                
                {error && <p style={{color:"red"}}>{error}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? "Registracija je u toku..." : "Registruj se"}
                </button>
            </form>

            <p>
                Već imaš nalog? <Link to="/login">Uloguj se</Link>
            </p>
        </div>
    );
};

export default RegisterPage;