const Message = require("../models/Message");

const getMessages = async (req, res) => {
    try {
        const messages = await Message.find({ recipient: null})
            .populate("sender", "username avatar")
            .sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: "Greška na server", error })
    }
};

const getPrivateMessages = async(req,res) => {
    try {
        const otherUserId = req.params.userId;
        const myId = req.userId;

        const messages = await Message.find({
            $or: [
                {sender: myId, recipient: otherUserId},
                {sender: otherUserId, recipient: myId},
            ],
        })
        .populate("sender", "username avatar")
        .populate("recipient", "username avatar")
        .sort({createdAt: 1});
        res.status(200).json(messages)
        
    } catch(error){
        res.status(500).json({message: "Greška na serveru", error: error.message})
    }
}

module.exports = { getMessages, getPrivateMessages };