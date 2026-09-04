import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("")
    const [error, setError] = useState("");
    const [loading, setLoeading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handlerSubmit = async (e) => {
        e.preventDefault();
        setError("")
        setLoeading(true)

        try {
            const data = await loginUser(email, password);
            login(data.user, data.token);
            navigate("/chat");
        } catch (err) {
            setError(err.response?.data?.message || "Greska prilikom prijave")
        } finally {
            setLoeading(false);
        }
    };

    return (
        <div>
            <h2>Prijavi se</h2>
            <form onSubmit={handlerSubmit}>
                <input
                    type="text"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Lozinka"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {error && <p style={{ color: "red" }}>{error}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? "Prijava u toku..." : "Uloguj se"}
                </button>
            </form>

            <p>
                Nemaš nalog? <Link to="/register">Registruj se</Link>
            </p>
        </div>
    );
};

export default LoginPage;