// Type is success or error
export const hideAlert = () => {
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
};

export const showAlert = (type, msg) => {
    console.log("entered alert");
    hideAlert();
    const markup = `<div class="alert alert--${type}">${msg}</div>`; // Fix here
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, 5000);
};
