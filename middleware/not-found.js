import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const notFound = (req, res) => {
    res.status(404).sendFile(resolve(__dirname, "../public/not-found.html"));
};
