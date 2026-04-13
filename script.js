const game = {
    timerInterval: null,
    numbers: [],
    current: 1,
    hidden: false,
    startTime: 0,
    maxNumber: 9,
    timerStarted: false,
    readyToStart: false
};

// hent scores
function getScores(size) {
    let s = JSON.parse(localStorage.getItem("scores_" + size));
    return Array.isArray(s) ? s : [];
}

// start spil
function startGame() {
    resetGame();
    setupGrid();
    createCells();
}

// reset
function resetGame() {
    clearInterval(game.timerInterval);

    const grid = document.getElementById("grid");
    grid.innerHTML = "";

    game.numbers = [];
    game.current = 1;
    game.hidden = false;
    game.timerStarted = false;
    game.readyToStart = false;

    game.maxNumber = Number(document.getElementById("difficulty").value);

    document.getElementById("timer").innerText = "0,000 sek";
}

// grid setup
function setupGrid() {
    const grid = document.getElementById("grid");
    const columnsMap = { 4: 2, 6: 3, 9: 3 };
    grid.style.gridTemplateColumns = `repeat(${columnsMap[game.maxNumber]}, 100px)`;
}

// lav celler
function createCells() {
    const grid = document.getElementById("grid");

    let nums = Array.from({ length: game.maxNumber }, (_, i) => i + 1)
        .sort(() => Math.random() - 0.5);

    nums.forEach(num => {
        const div = document.createElement("div");
        div.className = "cell";
        div.innerText = num;
        div.dataset.value = num;

        div.addEventListener("click", () => clickCell(div));

        grid.appendChild(div);
        game.numbers.push(div);
    });
}

// start timer
function startTimer() {
    game.startTime = performance.now();

    game.timerInterval = setInterval(() => {
        const time = (performance.now() - game.startTime) / 1000;
        document.getElementById("timer").innerText =
            time.toFixed(3).replace(".", ",") + " sek";
    }, 16);
}

// klik
function clickCell(cell) {
    const value = Number(cell.dataset.value);

    if (value !== game.current) {
        handleWrong();
        return;
    }

    // 👉 START TIMER HER (første klik efter skjul)
    if (game.readyToStart && !game.timerStarted) {
        game.timerStarted = true;
        startTimer();
    }

    handleCorrect(cell);
}

// korrekt klik
function handleCorrect(cell) {
    cell.style.visibility = "hidden";
    game.current++;

    if (game.current === 2 && !game.hidden) {
        hideNumbers();
    }

    if (game.current === game.maxNumber + 1) {
        winGame();
    }
}

// skjul tal
function hideNumbers() {
    game.hidden = true;

    setTimeout(() => {
        game.numbers.forEach(c => {
            if (c.dataset.value != 1) {
                c.innerText = "";
            }
        });

        // 👉 klar til at starte timer ved næste klik
        game.readyToStart = true;

    }, 300);
}

// win
function winGame() {
    clearInterval(game.timerInterval);

    const time = (performance.now() - game.startTime) / 1000;
    document.getElementById("timer").innerText =
        time.toFixed(3).replace(".", ",") + " sek";

    saveScore(time);

    alert("🔥 Du vandt på " + time.toFixed(3).replace(".", ",") + " sek!");
}

// forkert klik
function handleWrong() {
    clearInterval(game.timerInterval);
    alert("❌ Forkert!");
    startGame();
}

// gem score
function saveScore(time) {
    const name = document.getElementById("playername").value || "Anonym";

    let scores = getScores(game.maxNumber);

    scores.push({ name, time });
    scores.sort((a, b) => a.time - b.time);
    scores = scores.slice(0, 10);

    localStorage.setItem("scores_" + game.maxNumber, JSON.stringify(scores));

    updateLeaderboard();
}

// leaderboards
function updateLeaderboard() {
    updateSingleLeaderboard(4, "leaderboard_easy");
    updateSingleLeaderboard(6, "leaderboard_medium");
    updateSingleLeaderboard(9, "leaderboard_hard");
}

// leaderboard
function updateSingleLeaderboard(size, elementId) {
    let list = document.getElementById(elementId);
    list.innerHTML = "";

    let scores = getScores(size);

    if (size === 9 && scores.length === 0) {
        scores.push({ name: "Ayumu", time: 0.2 });
        localStorage.setItem("scores_9", JSON.stringify(scores));
    }

    scores.sort((a, b) => a.time - b.time);
    scores = scores.slice(0, 10);

    scores.forEach((score, index) => {
        let li = document.createElement("li");
        li.innerText =
            `${index + 1}. ${score.name} - ${score.time.toFixed(3).replace(".", ",")}s`;

        if (index === 0) li.style.color = "gold";

        list.appendChild(li);
    });
}

// reset
function resetScores() {
    localStorage.removeItem("scores_4");
    localStorage.removeItem("scores_6");
    localStorage.removeItem("scores_9");

    updateLeaderboard();
}

// start knap
document.getElementById("startBtn").addEventListener("click", startGame);

// vis ved start
updateLeaderboard();