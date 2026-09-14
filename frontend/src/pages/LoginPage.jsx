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

    const handleSubmit = async (e) => {
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
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-pink-600 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-pulse"></div>

            <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r  from-pink-500 to-cyan-400">
                    Prijava
                </h2>
                <p className="text-gray-400 mt-2 mb-6">Dobrodošao nazad!</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="Unesite email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Lozinka
                        </label>
                        <input
                            type="password"
                            placeholder="Unesite lozinku"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-pink-300 bg-pink-500/10 border border-pink-500/30 rounded-lg px-4 py-3">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-linear-to-r from-pink-600 to-cyan-500 hover:from-pink-500 hover:to-cyan-400 transition-all text-white py-3 rounded-lg font-semibold disabled:opacity-50 shadow-lg shadow-pink-500/30"
                    >
                        {loading ? "Prijava u toku..." : "Uloguj se"}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-400 mt-6">
                    Nemaš nalog?{" "}
                    <Link to="/register" className="text-cyan-400 font-semibold hover:text-cyan-300 hover:underline">
                        Registruj se
                    </Link>
                </p>
            </div>
        </div>

    );
};

export default LoginPage;