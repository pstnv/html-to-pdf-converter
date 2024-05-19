import { v2 as cloudinary } from "cloudinary";
// streamifier используется для отправки buffer в cloudinary
import streamifier from "streamifier";

const sendPDFToCloudinary = async (req, res, next) => {
    // проверяем, если пользователь авторизован
    const user = req.user;
    // если пользователь не авторизован, переходим к контроллеру ответа
    if (!user) {
        return next();
    }
    // если пользователь авторизован, отправляем файл в cloudinary
    const {
        pdf: { buffer: pdfBuffer },
    } = req.file;
    //  отправляем потоком pdfBuffer на cloudinary
    let cld_upload_stream = cloudinary.uploader.upload_stream(
        {
            folder: "converter-upload",
            unique_filename: true,
        },
        function (error, result) {
            if (error) {
                // если в процессе отправки pdfBuffer в cloudinary вернулась ошибка,
                // выводим в консоль сообщение об ошибке
                // но не выбрасываем ее,
                // а исполняем следующий контроллер - responseController
                // чтобы вернуть результат пользователю
                console.log(error);
            }
            // если результат успешный,
            // добавляем путь к файлу на cloudinary (для скачивания)
            // и его id (для удаления)
            if (result) {
                // путь к файлу pdf на cloudinary
                req.file.pdf.file = result.secure_url;
                // public_id используется для доступа к файлу при его удалении с cloudinary
                req.file.pdf.cloudId = result.public_id;
            }

            next();
        }
    );
    streamifier.createReadStream(pdfBuffer).pipe(cld_upload_stream);
};

export default sendPDFToCloudinary;
