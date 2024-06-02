const displaySuccessAnswer = (name, timeDelay = 0) => {
    const seconds = timeDelay === 1 ? "секунды" : "секунд";
    return `
            <div class="text-center my-1">
                <i class="fa-solid fa-check fa-4x"></i>
            </div>
            <h2 class="fs-4">Вы были успешно зарегистрированы</h2>
            <p class="greet-msg">
                Добро пожаловать в PDFConverter, ${name}
            </p>`;
};

export default displaySuccessAnswer;
