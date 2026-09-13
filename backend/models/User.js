const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    },
    phone:{
      type: Number,
      required:true,
    },
    password: {
    type: String,
    required: true,
  },
  bio:{
    type: String,
    default:"",
    maxlength: 200,
  },
  avatar:{
    type: String,
    default:"",
  },
},
{
  timestamps: true,
});

const User = mongoose.model("User", userSchema);

module.exports = User;