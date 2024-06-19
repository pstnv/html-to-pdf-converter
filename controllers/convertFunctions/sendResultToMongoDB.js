import Conversion from "../../models/Conversion.js";

const sendResultToMongoDB = async (req, res, next) => {
    // check authentication
    const user = req.user;
    // if user is not authenticated, skip and go to the next controller function - responseController
    if (!user) {
        return next();
    }
    // if user is authenticated, create record about conversion in mongoDB
    const { userId } = user;
    const { pdf } = req.file;

    // add property id (userid) to pdf,
    // to create record in MongoDB, associated with this user
    pdf.createdBy = userId;
    // create Conversion document
    // fileds - name, status - added in convertController
    // filed - file - added in cloudController
    // field - createdBy - added in this controller

    await Conversion.create(pdf);
    next();
};

export default sendResultToMongoDB;
