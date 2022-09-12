import  mongoose from 'mongoose'

const carSchema = new mongoose.Schema({
    make: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    carKeys: {
        type: String,
        required: true,
    },
    heatedCarSeatMembership: {
        type: Boolean,
        default: false,
    },
    token: {
        type: String
    }
})

const car = mongoose.model("car", carSchema);

export default car
