import { Schema, model } from 'mongoose';

const incomeSchema = Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: [true, 'User is required']
	},
	type: {
		type: String,
		enum: ['SALARY EXTRA', 'BONUS', 'AGUINALDO', 'EXTRA', 'OTHER'],
		required: [true, 'Income type is required']
	},
	amount: {
		type: Number,
		required: [true, 'Amount is required'],
		min: [0.01, 'Amount must be greater than 0']
	},
	frequency: {
		type: String,
		enum: ['WEEKLY', 'MONTHLY', 'BIMONTHLY','SEMESTERLY', 'YEARLY', 'IRREGULAR'],
		required: [true, 'Income frequency is required']
	},
	description: {
		type: String,
		trim: true,
		maxLength: [100, 'Description cannot exceed 100 characters'],
		default: null
	}
},
{
	versionKey: false,
	timestamps: true
});

incomeSchema.methods.toJSON = function () {
	const { __v, _id, ...income } = this.toObject();
	income.iid = _id;
	return income;
};

export default model('Income', incomeSchema);
