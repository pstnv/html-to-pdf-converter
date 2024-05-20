import mongoose from "mongoose";
import bcript from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";


// схема пользователя
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "имя пользователя"],
        minlength: 3,
        maxlength: 25,
    },
    email: {
        type: String,
        required: [true, "email"],
        validate: {
            validator: validator.isEmail,
            message: "действующий email"
        },
        unique: true,
    },
    password: {
        type: String,
        required: [true, "пароль"],
        minlength: 6,
    },
});

// Mongoose Middleware документация https://mongoosejs.com/docs/middleware.html#pre
UserSchema.pre("save", async function () {
    // хэшируем пароль перед сохранением
    const salt = await bcript.genSalt(10);
    this.password = await bcript.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcript.compare(candidatePassword, this.password);
    return isMatch;
};

export default mongoose.model("User", UserSchema);
