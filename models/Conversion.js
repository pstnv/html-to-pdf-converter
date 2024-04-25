import mongoose from "mongoose";

const ConversionSchema = new mongoose.Schema(
    {
        name: {
            // имя архива
            type: String,
            required: [true, "имя архива"],
            // maxlength: 70,
        },
        status: {
            // статус
            type: Boolean,
            required: [true, "статус"]
        },
        createdBy: {
            // пользователь
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: [true, "пользователь"],
        },
        file: {
            type: String,
            required: [true, "ссылка на .pdf файл"],
        },
    },
    { timestamps: true } // добавить время createdAt и updatedAt
);

export default mongoose.model("Conversion", ConversionSchema);
