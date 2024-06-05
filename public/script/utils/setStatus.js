const delayMsec = 3000;

const setStatus = ({
    container,
    message: textContent = "",
    html: innerHTML = "",
    clear = false,
}) => {
    console.log(container);
    // если передан контейнер и есть html(innerHTML), отображаем
    if (!container) {
        console.log("не передан container");
        return;
    }
    if (innerHTML) {
        container.innerHTML = innerHTML;
    } else if (textContent) {
        container.textContent = textContent;
    }
    if (clear) {
        setTimeout(() => {
            container.innerHTML = "";
        }, delayMsec);
    }
};

export default setStatus;
