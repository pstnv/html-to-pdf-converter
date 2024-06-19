const displaySuccessAnswer = (name, timeDelay = 0) => {
    const seconds = timeDelay === 1 ? "second" : "seconds";
    return `
            <div class="text-center my-1">
                <i class="fa-solid fa-check fa-4x"></i>
            </div>
            <p class="greet-msg">
                Welcome to PDFConverter, ${name}
            </p>
            <p>Within ${timeDelay} ${seconds} You will be redirected to the main page.
                If this does not happen, click on the button below
            </p>
            <a
                class="link link-light rounded-2 bg-danger link-underline-opacity-0 mt-4 p-2 text-center"
                href="index.html"
                >Start using PDFConverter</a
            >`;
};

export default displaySuccessAnswer;
