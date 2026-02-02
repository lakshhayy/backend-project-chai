import mongoose from "mongoose";
import { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; 

const videoSchema = new Schema({
    videofile: {
        type: String,
        required: true,
    }, 
    title: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    views: {                        
        type: Number,
        default: 0,
    }, 
    isPublished: {
        type: Boolean,
        default: false,
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    dislikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, 
{ timestamps: true });

videoSchema.plugin(mongooseAggregatePaginate);

const Video = mongoose.model("Video", videoSchema);
export default Video;                                            