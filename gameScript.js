document.addEventListener("DOMContentLoaded", function () {
    const grid = document.getElementById("grid");
    const timerDisplay = document.getElementById("timer");
    const scoreDisplay = document.getElementById("score"); // Убедитесь, что это поле существует
    const FULL_DASH_ARRAY = 188.5;
    const TIME_LIMIT = 60;
    let timeLeft = TIME_LIMIT;
    let score = 0; // Счёт
    // Telegram Web App initialization
    const tg = window.Telegram.WebApp;
    // Wait for the Web App to be ready
    tg.ready();
     // Dynamically adjust game height
    function adjustGameHeight() {
        const viewportHeight = tg.viewportStableHeight || tg.viewportHeight || window.innerHeight;
        gameContainer.style.height = `${viewportHeight}px`;
    }

    adjustGameHeight();

    tg.onEvent("viewportChanged", adjustGameHeight);
    const usernameElement = document.getElementById('username');
const errorElement = document.getElementById('error');
    const progressCircle = document.querySelector('.circle-progress');
    const timerText = document.getElementById('timer-text');

    const backImage = "./src/back.png";
    const frontImage = "./src/front.png";

    async function sendUserDataToServer() {
        try {
        const user = tg.initDataUnsafe?.user || {};
        const userData = {
        userId: user.id,
        username: user.username || '0',
        firstName: user.first_name || '0',
        lastName: user.last_name || '0',
        sessionStarts: parseInt(0) || 0,
        sessionEnds: parseInt(0) || 0,
        points: score || 0,
        boostsUsed: parseInt(0) || 0,
        };
        
           // Send user data to the server
    const response = await fetch('https://servertg.onrender.com/api/saveUserData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
  
      if (response.ok) {
        alert('User data successfully sent to the server!');
      } else {
        const errorText = await response.text();
        console.error('Error saving user data:', errorText);
        alert('Failed to send user data to the server.');
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('An error occurred while sending data to the server.');
    }
    }

    function startGame() {
        generateGrid();
        startTimer();
    }

    function generateGrid() {
        if (!grid) {
            console.error("Grid element not found!");
            return;
        }
        grid.innerHTML = "";

        for (let i = 0; i < 9; i++) {
            const gridItem = document.createElement("div");
            gridItem.classList.add("grid-item");

            const img = document.createElement("img");
            img.src = backImage;
            gridItem.appendChild(img);

            let isFront = false; // Флаг состояния карточки
            let clickedOnce = false; // Флаг для второго клика

            gridItem.addEventListener("click", () => {
                if (!isFront) {
                    img.src = frontImage;
                    score++;
                    scoreDisplay.textContent = score;
                    isFront = true; // Устанавливаем состояние "лицо"
                    clickedOnce = true; // Первый клик выполнен
                } else if (clickedOnce) {
                    score++;
                    scoreDisplay.textContent = score;
                    clickedOnce = false; // Больше не увеличиваем счёт
                }

                setTimeout(() => {
                    img.src = backImage;
                    isFront = false; // Возвращаем состояние "обратная сторона"
                    clickedOnce = false; // Сбрасываем флаг для новых кликов
                }, 1000); // Увеличено время до 1 секунды
            });

            grid.appendChild(gridItem);
        }
    }

    function startTimer() {
        const timerInterval = setInterval(() => {
            timeLeft--;
            updateTimer();

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                endGame();
            }
        }, 1000);
    }

    function updateTimer() {
        timerText.textContent = timeLeft;
        const offset = -(FULL_DASH_ARRAY / TIME_LIMIT) * (TIME_LIMIT - timeLeft);
        progressCircle.style.strokeDashoffset = offset;
    }

    function endGame() {
        alert("Game Over! Your score is " + score);
        sendUserDataToServer(); // Отправляем данные на сервер после окончания игры
    }

    startGame();
});
