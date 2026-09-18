import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "../context/AuthContext"

const getInitials = (username) => {
    return username ? username.chartAt(0).toUpperCase() : "?";
}

const getAvatarUrl = (avatarPath) =>{
    if(!avatarPath) return null;
    return `${import.meta.env.VITE_API_URL.replace("/api", "")}${avatarPath}`;
}

const UserProfileModel = ({ userId, onClose, onStartChat }) => {
    const { token } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        const loadProfile = async () => {
            setLoading(true);
            try{
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/users/${userId}`,
                { headers: {Authorization: `Bearer ${token}`}}
                )
                setProfile(response.data);
            }catch(error){
                console.log("Greška pri učitavanju profila:", error)
            }finally{
                setLoading(false);
            }
        };

        if(userId) loadProfile();
    }, [userId, token]);

    if(!userId) return null;

    return (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
      <div
        className="relative bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
      >
        ✕
      </button>

      {loading ? (
        <p className="text-center text-gray-400 py-8">Učitavanje...</p>
        ) : profile ? (
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-white/10 overflow-hidden mb-4 flex items-center justify-center ring-4 ring-pink-500/20 text-2xl font-bold text-white">
              {getAvatarUrl(profile.avatar) ? (
                <img src={getAvatarUrl(profile.avatar)} alt={profile.username} className="w-full h-full object-cover" />
              ) : (
                getInitials(profile.username)
              )}
            </div>

            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-linear-to-r from-pink-500 to-cyan-400 mb-2">
              {profile.username}
            </h3>

            <p className="text-sm text-gray-300 leading-relaxed">
              {profile.bio || "Ovaj korisnik još nije napisao opis."}  
            </p>
            <button
              onClick={()=>{
                onStartChat(profile);
                onClose()
              }}
              className="mt-6 w-full bg-linear-to-r from-pink-600 to-cyan-500 hover:from-pink-500 hover:to-cyan-400 transition-all text-white py-2.5 rounded-lg text-sm font-semibold shadow-lg shadow-pink-500/30"
            >
              Pošalji privatnu poruku
            </button>
          </div>
        ) : (
          <p className="text-center text-gray-400 py-8">Korisnik nije pronađen</p>
        )}
      </div>
    </div>
  );
};

export default UserProfileModel;