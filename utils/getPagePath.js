import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const getPage = (page) => resolve(__dirname, "../public/", page);

export default getPage;
