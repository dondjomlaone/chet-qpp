import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"
import { registerUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
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
            const data = await registerUser(username, email, phone, password);
            login(data.user, data.token);
            navigate("/chat");
        } catch (err) {
            setError(err.response?.data?.message || "Greška prilikom registracije")
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-800">
                        Registracija
                    </h2>
                    <p className="text-slate-500 mt-2">
                        Kreiraj svoj nalog
                    </p>
                </div>

                <form onSubmit={handleSubimt} className="space-y-5">

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Korisničko ime
                        </label>

                        <input
                            type="text"
                            placeholder="Unesite korisničko ime"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 
                    outline-none transition
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                    placeholder:text-slate-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Email adresa
                        </label>

                        <input
                            type="email"
                            placeholder="Unesite email adresu"
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
                            Broj telefona
                        </label>

                        <input
                            type="tel"
                            placeholder="Unesite broj telefona"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-300
        outline-none transition
        focus:border-blue-500 focus:ring-2 focus:ring-blue-200
        placeholder:text-slate-400"
                        />
                    </div>


                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Password
                        </label>

                        <input
                            type="password"
                            placeholder="Unesite password"
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
                        {loading ? "Registracija je u toku..." : "Registruj se"}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-6">
                    Već imaš nalog?{" "}
                    <Link
                        to="/login"
                        className="text-blue-600 font-semibold hover:text-blue-700 hover:underline"
                    >
                        Uloguj se
                    </Link>
                </p>

            </div>
        </div>

    );
};

export default RegisterPage;