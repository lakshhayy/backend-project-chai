import mongoose from "mongoose";
import { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // the user who is subscribing
        ref: "User",
        required: true
    },
    channel: {
        type: Schema.Types.ObjectId, // the user who is being subscribed to
        ref: "User",
        required: true
    }
}, {timestamps: true});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export { Subscription };