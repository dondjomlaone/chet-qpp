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
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Moj profil</h2>
                    <Link to="/chat" className="text-sm text-blue-600 hover:underline">
                        Nazad na chat
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden mb-3 flex items-center justify-center">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-gray-400 text-sm">Bez slike</span>
                            )}
                        </div>
                        <label className="cursor-pointer text-sm text-blue-600 hover:underline">
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Opis (bio)
                        </label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            maxLength={200}
                            rows={4}
                            placeholder="Napiši nešto o sebi..."
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                        <p className="text-xs text-gray-400 text-right mt-1">{bio.length}/200</p>
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}
                    {success && <p className="text-sm text-green-600">{success}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                        {loading ? "Čuvanje..." : "Sačuvaj izmene"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;