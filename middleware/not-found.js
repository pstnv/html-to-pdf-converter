import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const notFoundMiddleware = (req, res) => {
    res.status(404).sendFile(resolve(__dirname, "../public/not-found.html"));
};

export default notFoundMiddleware;
