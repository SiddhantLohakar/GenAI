import mongoose from "mongoose";

const metadataSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxlength: [70, "The title limit should be less than 70"] 
    },
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, 
{
    timestamps: true
}
)


export default mongoose.model("Metadata", metadataSchema);