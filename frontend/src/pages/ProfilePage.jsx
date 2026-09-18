import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom"
import axios from "axios";

const ProfilePage = () => {
    const { token, login } = useAuth()

    const [bio, setBio] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/users/profile`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setBio(response.data.bio || "");
                if (response.data.avatar) {
                    setPreviewUrl(`${import.meta.env.VITE_API_URL.replace("/api", "")}${response.data.avatar}`);
                }
            } catch (err) {
                console.error("Greška pri učitavanju profila:", err);
            }
        };

        loadProfile();
    }, [token]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("bio", bio);
            if (avatarFile) {
                formData.append("avatar", avatarFile);
            }

            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/users/profile`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            const currentToken = token;
            login(response.data.user, currentToken);

            setSuccess("Profil uspešno ažuriran!");
        } catch (err) {
            setError(err.response?.data?.message || "Greška prilikom ažuriranja profila");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0f0c29]">
            {/* Neonski krugovi u pozadini */}
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-pink-600 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-pulse pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-pulse pointer-events-none"></div>

            <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-pink-500 to-cyan-400">
                        Moj profil
                    </h2>
                    <Link to="/chat" className="text-sm text-cyan-400 hover:text-cyan-300 hover:underline">
                        Nazad na chat
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-white/10 overflow-hidden mb-3 flex items-center justify-center ring-4 ring-pink-500/20">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-gray-500 text-sm">Bez slike</span>
                                )}
                            </div>
                        </div>
                        <label className="cursor-pointer text-sm text-cyan-400 hover:text-cyan-300 hover:underline">
                            Promeni sliku
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Opis (bio)
                        </label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            maxLength={200}
                            rows={4}
                            placeholder="Napiši nešto o sebi..."
                            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none"
                        />
                        <p className="text-xs text-gray-500 text-right mt-1">{bio.length}/200</p>
                    </div>

                    {error && (
                        <p className="text-sm text-pink-300 bg-pink-500/10 border border-pink-500/30 rounded-lg px-4 py-3">
                            {error}
                        </p>
                    )}
                    {success && (
                        <p className="text-sm text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-4 py-3">
                            {success}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-linear-to-r from-pink-600 to-cyan-500 hover:from-pink-500 hover:to-cyan-400 transition-all text-white py-3 rounded-lg font-semibold disabled:opacity-50 shadow-lg shadow-pink-500/30"
                    >
                        {loading ? "Čuvanje..." : "Sačuvaj izmene"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;