import mongoose from "mongoose";

const ConversionSchema = new mongoose.Schema(
    {
        name: {
            // имя архива
            type: String,
            required: [true, "Введите имя архива"],
            // maxlength: 70,
        },
        status: {
            // статус
            type: String,
            enum: ["Конвертация не завершена", "Конвертация выполнена успешно"],
        },
        createdBy: {
            // пользователь
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: [true, "Укажите пользователя"],
        },
        file: {
            type: String,
            required: [true, "Добавьте ссылку на .pdf файл"],
        },
    },
    { timestamps: true } // добавить время createdAt и updatedAt
);

export default mongoose.model("Conversion", ConversionSchema);
