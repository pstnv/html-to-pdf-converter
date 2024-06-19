import { v2 as cloudinary } from "cloudinary";
// streamifier is used to send buffer to cloudinary
import streamifier from "streamifier";

const sendPDFToCloudinary = async (req, res, next) => {
    // check if user is authenticated
    const user = req.user;
    // if user is not authenticated move to next controller - response
    if (!user) {
        return next();
    }
    // if user is authenticated send file to cloudinary
    const {
        pdf: { buffer: pdfBuffer },
    } = req.file;
    //  send as a buffer pdfBuffer to cloudinary
    let cld_upload_stream = cloudinary.uploader.upload_stream(
        {
            folder: "converter-upload",
            unique_filename: true,
        },
        function (error, result) {
            if (error) {
                // in case if we received error in process of sending pdfBuffer to cloudinary,
                // console.log this error
                // do not throw it,
                // but call next controller function - responseController
                // to send the result to user
                console.log(error);
            }
            // if success,
            // add path to the fileon cloudinary (for downloading by user)
            // and it's id (for deleting request by user)
            if (result) {
                // pathto the .pdf file on cloudinary
                req.file.pdf.file = result.secure_url;
                // public_id is usedfor access to the file on cloudinary when delete it from cloudinary
                req.file.pdf.cloudId = result.public_id;
            }

            next();
        }
    );
    streamifier.createReadStream(pdfBuffer).pipe(cld_upload_stream);
};

export default sendPDFToCloudinary;
