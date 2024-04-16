import mongoose from "mongoose";
import bcript from "bcryptjs";
import jwt from "jsonwebtoken";


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
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Введите корректный email",
        ],
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
// метод, создающий и возвращающий токен
UserSchema.methods.createJWT = function () {
    const token = jwt.sign(
        { userId: this._id, name: this.name },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_LIFETIME,
        }
    );
    return token;
};

UserSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcript.compare(candidatePassword, this.password);
    return isMatch;
};

export default mongoose.model("User", UserSchema);
