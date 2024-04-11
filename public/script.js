const url = "/api/v1/convertion/uploads";
const formDOM = document.forms[0];
const fileInputDOM = formDOM.querySelector("#formFile");

formDOM.addEventListener("submit", async (e) => {
    e.preventDefault();
    const file = fileInputDOM.files[0];
    if (!file) {
        console.log("Загрузите архив!")
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
        const params = {
            method: "POST",
            body: formData,
        };
        const response = await fetch(`${url}`, params);
        const blob = await response.blob();

        // имя из заголовка ответа
        const contentDisposition = response.headers.get("content-disposition");
        const filenameResponse = contentDisposition.split("filename=").pop();
        // резервное имя из отправляемого файла
        const filenameRequest = file.name.split(".zip").shift() + ".pdf";
        const filename =
            filenameRequest ||
            filenameResponse;

        let dataURL = URL.createObjectURL(blob);
        let anchor = document.createElement("a");
        anchor.href = dataURL;
        anchor.download = filename;
        document.body.append(anchor);
        anchor.style = "display:none";
        anchor.click();
        anchor.remove();
    } catch (error) {
        console.log(error);
    }
});
