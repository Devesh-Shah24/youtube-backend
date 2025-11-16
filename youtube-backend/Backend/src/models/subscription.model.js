import mongoose, {Schema} from "mongoose"

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, //who is subscribes user channel
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId, // user subscribed other channel
        ref: "User"
    }
}, {timestamps: true})



export const Subscription = mongoose.model("Subscription", subscriptionSchema)