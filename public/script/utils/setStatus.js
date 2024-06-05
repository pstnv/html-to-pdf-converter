const delayMsec = 3000;

const setStatus = ({
    container,
    message: textContent = "",
    html: innerHTML = "",
    clear = false,
}) => {
    // если не передан контейнер, возвращаемся
    if (!container) {
        return;
    }
    if (innerHTML) {
        container.innerHTML = innerHTML;
    } else {
        container.textContent = textContent;
    }
    // очищаем контейнер от сообщения через delayMsec
    if (clear) {
        setTimeout(() => {
            container.innerHTML = "";
        }, delayMsec);
    }
};

export default setStatus;
