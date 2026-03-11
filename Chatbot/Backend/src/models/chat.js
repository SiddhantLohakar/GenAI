import mongoose from "mongoose"

const chatSchema = mongoose.Schema({
    convo_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "metadata",
        required : true
    },
    user_type:{
        type: String,
        enum: ["model", "user"],
        default: "user",
        required: true 
    },
    content: {
        type: String,
        required: true
    }
}, {timestamps: true})


export default mongoose.model("Chat", chatSchema);