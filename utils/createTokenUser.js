const createTokenUser = (user) => {
    return { name: user.name, userId: user._id };
};

export default createTokenUser;
