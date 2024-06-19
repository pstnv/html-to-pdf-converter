import getElement from "./getElement.js";

const fieldsetDOM = getElement("fieldset");
const spinnerDOM = getElement(".spinner-container");

const toggleSpinner = (start = 0) => {
    const isSpinning = !spinnerDOM.classList.contains("hide");
    const spinningTime = (Date.now() - start) / 1000;

    // if the spinner is displayed and spins for less than 1 second,
    // make a delay - (at least) 400 milliseconds
    // so that the screen does not twitch if the process is fast
    const spinnerDelay = isSpinning && spinningTime < 0.4 ? 400 : 0;

    // lock the form and display the spinner for the duration of the conversion
    // or unlock the form and hide the spinner after conversion or in case of an error
    setTimeout(() => {
        fieldsetDOM.disabled = !fieldsetDOM.disabled;
        spinnerDOM.classList.toggle("hide");
    }, spinnerDelay);
};

export default toggleSpinner;
