import mongoose from "mongoose";

const ConversionSchema = new mongoose.Schema(
    {
        name: {
            // archive name
            type: String,
            required: [true, "archive name"],
            // maxlength: 70,
        },
        status: {
            // status
            type: Boolean,
            required: [true, "status"],
        },
        createdBy: {
            // user
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: [true, "user"],
        },
        file: {
            type: String,
            required: [true, "link to .pdf file"],
        },
        cloudId: {
            type: String,
            required: [true, "cloudId"],
        },
    },
    { timestamps: true } // add time createdAt and updatedAt
);

export default mongoose.model("Conversion", ConversionSchema);
