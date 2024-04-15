const getAllConversions = async (req, res) => {
    res.send("get all Conversion");
};

const getConversion = (req, res) => {
    res.send("get single Conversion");
};

const createConversion = (req, res) => {
    res.send("create Conversion");
};

const updateConversion = (req, res) => {
    res.send("update Conversion");
};

const deleteConversion = (req, res) => {
    res.send("delete Conversion");
};

export {
    getAllConversions,
    getConversion,
    createConversion,
    updateConversion,
    deleteConversion,
};
