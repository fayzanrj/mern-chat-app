const mongoose = require("mongoose");

const chatModel = mongoose.Schema(
  {
    chatName: {
      type: String,
      trim: true
    },
    isGroupChat: {
      type: Boolean,
      default: false
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    pic: {
      type: "String",
      required: true,
      default:
        "https://icon-library.com/images/groups-icon/groups-icon-16.jpg",
    }
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatModel);

module.exports = Chat;