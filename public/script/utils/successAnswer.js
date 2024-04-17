const displaySuccessAnswer = (name) => {
    return `
            <div class="text-center my-1">
                <i class="fa-solid fa-check fa-4x"></i>
            </div>
            <h2 class="fs-4">Вы были успешно зарегистрированы</h2>
            <p class="greet-msg">
                Добро пожаловать в PDFConverter, ${name}
            </p>
            <p> Сейчас Вы будете перенаправлены на главную страницу.
                Если это не произошло, нажмите на кнопку ниже
            </p>
            <a
                class="link link-light rounded-2 bg-danger link-underline-opacity-0 mt-4 p-2 text-center"
                href="index.html"
                >Начать использование PDFConverter</a
            >`;
};

export default displaySuccessAnswer;
