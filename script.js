let currentEmail = "";
let accountToken = "";
let accountId = "";

const API_URL = "https://mail.tm";

// 1. Генерация случайной почты через Mail.tm
async function generateEmail() {
    const listContainer = document.getElementById("letters-list");
    listContainer.innerHTML = "Генерация адреса...";

    try {
        // Получаем доступный домен
        const domainResponse = await fetch(`${API_URL}/domains`);
        const domainsData = await domainResponse.json();
        const domain = domainsData["hydra:member"][0].domain;

        // Генерируем случайные логин и пароль
        const randomString = Math.random().toString(36).substring(2, 12);
        const email = `${randomString}@${domain}`;
        const password = Math.random().toString(36).substring(2, 12);

        // Создаем аккаунт
        const createResponse = await fetch(`${API_URL}/accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: email, password: password })
        });
        const accountData = await createResponse.json();
        accountId = accountData.id;

        // Авторизуемся для получения токена (прав доступа)
        const tokenResponse = await fetch(`${API_URL}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: email, password: password })
        });
        const tokenData = await tokenResponse.json();
        accountToken = tokenData.token;

        currentEmail = email;
        document.getElementById("email-address").value = currentEmail;
        listContainer.innerHTML = "Ожидание писем... (Обновление каждые 5 сек)";

        // Запускаем регулярную проверку
        setInterval(checkMail, 5000);

    } catch (error) {
        listContainer.innerHTML = `<span style="color:red;">Ошибка инициализации: ${error.message}. Попробуйте включить VPN.</span>`;
    }
}

function copyEmail() {
    const emailInput = document.getElementById("email-address");
    emailInput.select();
    navigator.clipboard.writeText(currentEmail);
    alert("Адрес скопирован: " + currentEmail);
}

// 2. Проверка ящика
async function checkMail() {
    if (!accountToken) return;

    try {
        const response = await fetch(`${API_URL}/messages`, {
            headers: { 'Authorization': `Bearer ${accountToken}` }
        });
        const data = await response.json();
        const emails = data["hydra:member"];
        const listContainer = document.getElementById("letters-list");

        if (emails.length === 0) return;

        listContainer.innerHTML = "";

        emails.forEach(mail => {
            const item = document.createElement("div");
            item.className = "letter-item";
            item.innerHTML = `<strong>От:</strong> ${mail.from.address} (${mail.from.name || ''})<br><strong>Тема:</strong> ${mail.subject || '(Без темы)'}`;

            const bodyDiv = document.createElement("div");
            bodyDiv.className = "letter-body";
            bodyDiv.id = `mail-${mail.id}`;

            item.onclick = () => toggleLetter(mail.id, bodyDiv);

            listContainer.appendChild(item);
            listContainer.appendChild(bodyDiv);
        });
    } catch (error) {
        console.error("Ошибка обновления:", error);
    }
}

// 3. Чтение письма
async function toggleLetter(id, bodyDiv) {
    if (bodyDiv.style.display === "block") {
        bodyDiv.style.display = "none";
        return;
    }

    if (bodyDiv.innerHTML === "") {
        bodyDiv.innerHTML = "Загрузка...";
        try {
            const response = await fetch(`${API_URL}/messages/${id}`, {
                headers: { 'Authorization': `Bearer ${accountToken}` }
            });
            const data = await response.json();
            bodyDiv.innerHTML = data.text || data.html || "[Пустое письмо]";
        } catch (error) {
            bodyDiv.innerHTML = "Не удалось загрузить текст письма.";
        }
    }

    bodyDiv.style.display = "block";
}

// Старт
generateEmail();
