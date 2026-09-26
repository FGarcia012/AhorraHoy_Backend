import { Schema, model } from 'mongoose';

const financialSchema = Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: [true, 'User is required'],
		unique: true
	},
	hasJob: {
		type: Boolean,
		required: [true, 'Has job is required'],
		default: false
	},
	monthlySalary: {
		type: Number,
		default: null,
		min: [0, 'Monthly salary cannot be negative']
	}
},
{
	versionKey: false,
	timestamps: true
});

financialSchema.methods.toJSON = function () {
	const { __v, _id, ...financial } = this.toObject();
	financial.fid = _id;
	return financial;
};

export default model('Financial', financialSchema);
