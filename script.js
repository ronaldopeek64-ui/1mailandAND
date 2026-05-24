let currentEmail = "";
let emailLogin = "";
let emailDomain = "";

// Список доступных доменов от 1secmail
const domains = ["1secmail.com", "1secmail.org", "1secmail.net"];

// 1. Генерация случайного имени почты
function generateEmail() {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    emailLogin = "";
    for (let i = 0; i < 10; i++) {
        emailLogin += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    emailDomain = domains[Math.floor(Math.random() * domains.length)];
    currentEmail = `${emailLogin}@${emailDomain}`;
    
    document.getElementById("email-address").value = currentEmail;
    document.getElementById("letters-list").innerHTML = "Ожидание писем...";
}

// 2. Копирование адреса в буфер обмена
function copyEmail() {
    const emailInput = document.getElementById("email-address");
    emailInput.select();
    document.execCommand("copy");
    alert("Адрес скопирован: " + currentEmail);
}

// 3. Проверка почтового ящика
async function checkMail() {
    if (!emailLogin || !emailDomain) return;
    
    const url = `https://1secmail.com{emailLogin}&domain=${emailDomain}`;
    
    try {
        const response = await fetch(url);
        const emails = await response.json();
        const listContainer = document.getElementById("letters-list");
        
        if (emails.length === 0) {
            listContainer.innerHTML = "Писем пока нет. Проверьте позже.";
            return;
        }
        
        listContainer.innerHTML = "";
        
        for (let mail of emails) {
            const item = document.createElement("div");
            item.className = "letter-item";
            item.innerHTML = `<strong>От:</strong> ${mail.from} <br> <strong>Тема:</strong> ${mail.subject}`;
            
            const bodyDiv = document.createElement("div");
            bodyDiv.className = "letter-body";
            bodyDiv.id = `mail-${mail.id}`;
            
            item.onclick = () => toggleLetter(mail.id, bodyDiv);
            
            listContainer.appendChild(item);
            listContainer.appendChild(bodyDiv);
        }
    } catch (error) {
        console.error("Ошибка получения писем:", error);
    }
}

// 4. Открытие конкретного письма и загрузка его текста
async function toggleLetter(id, bodyDiv) {
    if (bodyDiv.style.display === "block") {
        bodyDiv.style.display = "none";
        return;
    }
    
    if (bodyDiv.innerHTML === "") {
        bodyDiv.innerHTML = "Загрузка содержания...";
        const url = `https://1secmail.com{emailLogin}&domain=${emailDomain}&id=${id}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            bodyDiv.innerHTML = data.textBody || data.htmlBody || "[Пустое письмо]";
        } catch (error) {
            bodyDiv.innerHTML = "Не удалось загрузить письмо.";
        }
    }
    
    bodyDiv.style.display = "block";
}

// Старт при загрузке страницы
generateEmail();
// Автоматическое обновление каждые 10 секунд
setInterval(checkMail, 10000);
