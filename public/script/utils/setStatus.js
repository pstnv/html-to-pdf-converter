const delayMsec = 3000;

const setStatus = ({
    container,
    message: textContent = "",
    html: innerHTML = "",
    clear = false,
}) => {
    // if the container is not transferred, we return
    if (!container) {
        return;
    }
    if (innerHTML) {
        container.innerHTML = innerHTML;
    } else {
        container.textContent = textContent;
    }
    // clear the container from the message via delayMsec
    if (clear) {
        setTimeout(() => {
            container.innerHTML = "";
        }, delayMsec);
    }
};

export default setStatus;
