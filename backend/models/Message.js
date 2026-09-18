const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        text: {
            type: String,
            trim: true,
            default: "",
        },
        attachment: {
            url: {
                type: String,
                default: null,
            },

            type: {
                type: String,
                enum: ["image", "video"],
                default: null,
            },
        },
    },
    { timestamps: true }
)

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;