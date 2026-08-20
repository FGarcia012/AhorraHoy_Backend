import { Schema, model } from 'mongoose';

const goalSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    goalPicture: {
        type: String,
        required: [false, 'Goal picture is not required'],
        default: null
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        maxLength: [50, 'Name cannot exceed 50 characters'],
        trim: true
    },
    targetAmount: {
        type: Number,
        required: [true, 'Target amount is required'],
        min: [0.01, 'Target amount cannot be negative']
    },
    currentAmount: {
        type: Number,
        required: [true, 'Current amount is required'],
        default: 0
    },
    savingAmount: {
        type: Number,
        required: [false, 'Saving amount is not required'],
        default: null
    },
    savingFrequency: {
        type: String,
        enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'],
        required: [false, 'Saving frequency is not required'],
        default: null
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'COMPLETED', 'CANCELLED'],
        default: 'ACTIVE'
    }
},
{
    versionKey: false,
    timestamps: true
})

goalSchema.methods.toJSON = function () {
    const { __v, _id, ...meta } = this.toObject()
    meta.gid = _id
    return meta
}

export default model('Meta', goalSchema)