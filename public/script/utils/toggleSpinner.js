import getElement from "./getElement.js";

const fieldsetDOM = getElement("fieldset");
const spinnerDOM = getElement(".spinner-container");

const toggleSpinner = (start = 0) => {
    const isSpinning = !spinnerDOM.classList.contains("hide");
    const spinningTime = (Date.now() - start) / 1000;

    // если спиннер отображается, и вращается меньше 1 секунды,
    // сделать задержку - (at least) 400миллисекунд
    // чтобы не дергался экран, если процесс быстрый
    const spinnerDelay = isSpinning && spinningTime < 0.4 ? 400 : 0;

    // блокируем форму и отображаем спиннер на время конвертации
    // или разблокируем форму и скрываем спиннер после конвертации или при ошибке
    setTimeout(() => {
        fieldsetDOM.disabled = !fieldsetDOM.disabled;
        spinnerDOM.classList.toggle("hide");
    }, spinnerDelay);
};

export default toggleSpinner;
