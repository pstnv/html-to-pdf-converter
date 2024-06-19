import mongoose from "mongoose";
import bcript from "bcryptjs";
import validator from "validator";

// user's scheme
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "username"],
        minlength: 3,
        maxlength: 25,
    },
    email: {
        type: String,
        required: [true, "email"],
        validate: {
            validator: validator.isEmail,
            message: "valid email",
        },
        unique: true,
    },
    password: {
        type: String,
        required: [true, "password"],
        minlength: 6,
    },
    verificationToken: String,
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationTokenExpirationDate: {
        type: Date,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verified: Date,
    passwordToken: {
        type: String,
    },
    passwordTokenExpirationDate: {
        type: Date,
    },
    emailToken: {
        type: String,
    },
    emailTokenExpirationDate: {
        type: Date,
    },
});

// Mongoose Middleware docs https://mongoosejs.com/docs/middleware.html#pre
UserSchema.pre("save", async function () {
    // console.log(this.modifiedPaths()); // return arrays of fields that can be modified
    // console.log(this.isModified('name')); returns true || false
    // if change fields (name, email, etc), but not password, exit from this method
    // check, if modified field is not password, - exit function
    if (!this.isModified("password")) {
        return;
    }
    // hash password before saving
    const salt = await bcript.genSalt(10);
    this.password = await bcript.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcript.compare(candidatePassword, this.password);
    return isMatch;
};

export default mongoose.model("User", UserSchema);
