let qrcodeInstance = null;

function generateQR() {
    const text = document.getElementById("qr-text").value.trim();
    const color = document.getElementById("qr-color").value;
    const qrContainer = document.getElementById("qrcode");
    const downloadBtn = document.getElementById("download-btn");

    if (!text) {
        alert("Пожалуйста, введите текст или ссылку!");
        return;
    }

    // Очищаем предыдущий QR-код
    qrContainer.innerHTML = "";

    // Создаем новый QR-код
    qrcodeInstance = new QRCode(qrContainer, {
        text: text,
        width: 200,
        height: 200,
        colorDark: color,
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    // Небольшая задержка, чтобы библиотека успела отрендерить изображение внутри тега img
    setTimeout(() => {
        const qrImg = qrContainer.querySelector("img");
        if (qrImg && qrImg.src) {
            downloadBtn.style.display = "block";
        }
    }, 100);
}

function downloadQR() {
    const qrContainer = document.getElementById("qrcode");
    const qrImg = qrContainer.querySelector("img");

    if (!qrImg || !qrImg.src) {
        alert("Сначала сгенерируйте QR-код!");
        return;
    }

    // Создаем временную ссылку для скачивания картинки
    const link = document.createElement("a");
    link.href = qrImg.src;
    link.download = "qrcode.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Генерируем QR-код автоматически при первой загрузке страницы
window.onload = () => {
    generateQR();
};
