// Инициализация холста
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Переменные для игры (герой, платформы и лестница)
const hero = {
  x: 100,
  y: canvas.height - 150, // Начальная позиция героя
  width: 50,
  height: 50,
  speedX: 0,
  speedY: 0,
  gravity: 0.5,
};

// Установка платформ
const platforms = [];
const platformHeight = 10;
const platformWidth = canvas.width / 3;
for (let i = 0; i < 10; i++) {
  platforms.push({
    x: (i % 2) * (canvas.width - platformWidth), // Чередование платформ слева и справа
    y: canvas.height - i * (platformHeight + 100),
    width: platformWidth,
    height: platformHeight,
  });
}

// Лестница
const ladder = {
  x: canvas.width - platformWidth / 1 - 50,
  y: 0,
  width: 50,
  height: canvas.height,
};

function intersectRect(r1, r2) {
  return !(
    r2.x > r1.x + r1.width ||
    r2.x + r2.width < r1.x ||
    r2.y > r1.y + r1.height ||
    r2.y + r2.height < r1.y
  );
}

// Функции для отрисовки
function drawHero() {
  ctx.fillStyle = "#ff0000";
  ctx.fillRect(hero.x, hero.y, hero.width, hero.height);
}

function drawPlatforms() {
  ctx.fillStyle = "#8B4513";
  platforms.forEach((platform) => {
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
  });
}

function drawLadder() {
  ctx.fillStyle = "#555555";
  ctx.fillRect(ladder.x, ladder.y, ladder.width, ladder.height);
}

// Обработка нажатий на клавиши
function keyDownHandler(e) {
  switch (e.key) {
    case "ArrowLeft":
      hero.speedX = -3;
      break;
    case "ArrowRight":
      hero.speedX = 3;
      break;
    // Подняться по лестнице
    case "ArrowUp":
      if (hero.x + hero.width > ladder.x && hero.x < ladder.x + ladder.width) {
        hero.speedY = -3;
      }
      break;
    // Спуститься по лестнице
    case "ArrowDown":
      if (hero.x + hero.width > ladder.x && hero.x < ladder.x + ladder.width) {
        hero.speedY = 3;
      }
      break;
  }
}

function keyUpHandler(e) {
  switch (e.key) {
    case "ArrowLeft":
    case "ArrowRight":
      hero.speedX = 0;
      break;
    case "ArrowUp":
    case "ArrowDown":
      // Останавливаем героя, если он на лестнице
      if (hero.x + hero.width > ladder.x && hero.x < ladder.x + ladder.width) {
        hero.speedY = 0;
      }
      break;
  }
}

// Добавление слушателей событий для нажатия и отпускания клавиш
window.addEventListener("keydown", keyDownHandler);
window.addEventListener("keyup", keyUpHandler);

// Отслеживание столкновений
function checkCollisions() {
  // Гравитация влияет только если герой не на лестнице
  let onLadder =
    hero.x < ladder.x + ladder.width && hero.x + hero.width > ladder.x;

  hero.isOnPlatform = false;
  platforms.forEach((platform) => {
    if (
      hero.x < platform.x + platform.width &&
      hero.x + hero.width > platform.x &&
      hero.y + hero.height <= platform.y &&
      hero.y + hero.height + hero.speedY > platform.y
    ) {
      hero.isOnPlatform = true;
      hero.y = platform.y - hero.height; // Позиционируем героя на платформе
      if (!onLadder) hero.speedY = 0; // Герой стоит на платформе
    }
  });

  // Герой стоит на платформе или лестнице
  if (!hero.isOnPlatform && !onLadder) {
    hero.speedY += hero.gravity;
  } else if (onLadder) {
    hero.speedY = 0; // Остановка падения, если герой на лестнице
  }
}
function updateHero() {
  hero.speedY += hero.gravity; // Всегда применяем гравитацию
  hero.isOnLadder = false;
  hero.isOnPlatform = false;

  let potentialY = hero.y + hero.speedY;

  // Проверка столкновений с платформами
  for (let i = 0; i < platforms.length; i++) {
    let plat = platforms[i];
    // Проверка на столкновение с верхней частью платформы
    if (
      intersectRect(
        {
          x: hero.x,
          y: potentialY,
          width: hero.width,
          height: hero.height,
        },
        plat
      )
    ) {
      hero.isOnPlatform = true;
      potentialY = plat.y - hero.height; // Обновляем потенциальное Y для избежания проваливания
      hero.speedY = 0;
      break;
    }
  }

  // Проверка нахождения на лестнице
  if (hero.x < ladder.x + ladder.width && hero.x + hero.width > ladder.x) {
    if (hero.y + hero.height > ladder.y && hero.y < ladder.y + ladder.height) {
      hero.speedY = hero.speedY / 2; // Замедляем падение/подъем на лестнице
      hero.isOnLadder = true;
    }
  }

  // Применяем гравитацию только если герой не на платформе или лестнице
  if (!hero.isOnPlatform && !hero.isOnLadder) {
    hero.y += hero.speedY;
  } else if (hero.isOnPlatform || hero.isOnLadder) {
    hero.y = potentialY; // Позиция на платформе или лестнице
  }

  hero.x += hero.speedX;

  // Ограничение движения внутри холста по горизонтали
  if (hero.x < 0) {
    hero.x = 0;
  } else if (hero.x + hero.width > canvas.width) {
    hero.x = canvas.width - hero.width;
  }

  // Ограничение движения внутри холста по вертикали
  if (hero.y < 0) {
    hero.y = 0;
  } else if (hero.y + hero.height > canvas.height) {
    hero.y = canvas.height - hero.height;
    hero.isOnPlatform = true; // Герой стоит на нижней площадке
    hero.speedY = 0;
  }
}

// Основной игровой цикл
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlatforms();
  drawLadder();
  updateHero();
  checkCollisions();
  hero.x += hero.speedX;

  hero.y += hero.speedY;
  drawHero();

  // Ограничение движения внутри холста
  hero.x = Math.max(0, Math.min(canvas.width - hero.width, hero.x));
  hero.y = Math.max(0, Math.min(canvas.height - hero.height, hero.y));

  requestAnimationFrame(gameLoop);
}

gameLoop();
