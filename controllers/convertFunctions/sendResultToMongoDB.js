import Conversion from "../../models/Conversion.js";

const sendResultToMongoDB = async (req, res, next) => {
    // проверяем авторизацию
    const user = req.user;
    // если пользователь не авторизован, пропускаем и переходим в responseController
    if (!user) {
        return next();
    }
    // если пользователь авторизован, создаем запись о конвертации в mongoDB
    const { userId } = user;
    const { pdf } = req.file;

    // добавляем к pdf свойство - id пользователя,
    // чтобы создать в MongoDB запись, привязанную к id пользователя
    pdf.createdBy = userId;
    // создаем документ conversion
    // поля name, status записаны в convertController
    // поле file записано в cloudController
    // поле createdBy добавлено в этом контроллере

    await Conversion.create(pdf);
    next();
};

export default sendResultToMongoDB;
