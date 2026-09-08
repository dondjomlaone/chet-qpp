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
       <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800">
                Prijavi se
            </h2>

            <p className="text-slate-500 mt-2">
                Dobrodošao nazad!
            </p>
        </div>

        <form onSubmit={handlerSubmit} className="space-y-5">

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                </label>

                <input
                    type="email"
                    placeholder="Unesite email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300
                    outline-none transition
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                    placeholder:text-slate-400"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Lozinka
                </label>

                <input
                    type="password"
                    placeholder="Unesite lozinku"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300
                    outline-none transition
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                    placeholder:text-slate-400"
                />
            </div>

            {error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200
                rounded-lg px-4 py-3">
                    {error}
                </p>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl
                bg-blue-600 text-white font-semibold
                hover:bg-blue-700
                active:scale-[0.98]
                transition-all duration-200
                disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
                {loading ? "Prijava u toku..." : "Uloguj se"}
            </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
            Nemaš nalog?{" "}
            <Link
                to="/register"
                className="text-blue-600 font-semibold
                hover:text-blue-700 hover:underline"
            >
                Registruj se
            </Link>
        </p>

    </div>
</div>

    );
};

export default LoginPage;