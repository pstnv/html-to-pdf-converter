const url = "/api/v1/convertion/uploads";
const formDOM = document.forms[0];
const fileInputDOM = formDOM.querySelector("#formFile");

formDOM.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("hey");
    const file = fileInputDOM.files[0];
    console.log(file);
    const formData = new FormData();
    formData.append("file", file);
    try {
        const params = {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            body: formData,
        };
        const response = await fetch(`${url}/uploads`, params);
        console.log(response);
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.log(error);
    }
});
