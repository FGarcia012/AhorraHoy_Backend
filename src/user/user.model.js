import { Schema, model } from 'mongoose';

const userSchema = Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        mxLength: [35, 'Name cannot exceed 35 characters']
    },
    surname: {
        type: String,
        required: [true, 'Surname is required'],
        mxLength: [35, 'Surname cannot exceed 35 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'The password must contain a minimum length of 8 characters, one lowercase letter, one uppercase letter, one number and one symbol.'],
    },
    profile: {
        type: String,
        required: [false, 'Profile is not required'],
    },
    role: {
        type: String,
        default: 'USER',
        enum: ['USER', 'ADMIN'],
    },
    status: {
        type: Boolean,
        default: true,
    }
},
{
    versionKey: false,
    timestamps: true
})

userSchema.methods.toJSON = function () {
    const { __v, password, _id, ...usuario } = this.toObject()
    usuario.uid = _id
    return usuario
}

export default model('User', userSchema)