import { v2 as cloudinary } from "cloudinary";
// streamifier используется для отправки buffer в cloudinary
import streamifier from "streamifier";

const cloudinaryController = async (req, res, next) => {
    // проверяем, если пользователь авторизован
    const user = req.user;
    console.log("user здесь ", user);
    // если пользователь не авторизован, переходим к контроллеру ответа
    if (!user) {
        return next();
    }
    console.log("ЮЗЕР ТУТ");
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
                console.log(error);
            }
            console.log(result);
            // если результат успешный, добавляем путь к файлу на cloudinary
            if (result) {
                req.file.pdf.file = result.secure_url;
            }

            next();
        }
    );
    streamifier.createReadStream(pdfBuffer).pipe(cld_upload_stream);
};

export default cloudinaryController;
