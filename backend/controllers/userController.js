const User = require("../models/User");

const updateProfile = async(req, res) =>{
    try{
        const user = await User.findById(req.userId);

        if(!user){
            return res.status(404).json({ message: "Korisnik nije pronađen"})
        }

        if(req.body.bio !== undefined){
            user.bio = req.body.bio;
        }

        if(req.file){
            user.avatar = `/uploads/avatars/${req.file.filename}`
        }

        await user.save();

        res.status(200).json({
            message: "Profil ažuriran",
            user:{
                id: user.id,
                username: user.username,
                email: user.email,
                bio: user.bio,
                avatar: user.avatar,
            },
        });
    } catch(error){
        res.status(500).json({ message: "Greška na serveru", error: error.message });
    }
};

const getProfile = async(req, res) => {
    try{
        const user = await User.findById(req.userId).select("-password");

        if(!user){
            return res.status(404).json({message:"Korisnik nije pronađen"});
        }

        res.status(200).json(user);
    }catch(error){
        res.status(500).json({ message: "Greška na serveru", error: error.message });
    }
}

module.exports = {updateProfile, getProfile};
