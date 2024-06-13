const USER = "userLoggedIn";

const getUser = () => localStorage.getItem(USER);

const setUser = () => localStorage.setItem(USER, true);

const removeUser = () => localStorage.removeItem(USER);

export { getUser, setUser, removeUser };