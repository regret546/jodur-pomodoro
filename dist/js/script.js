const startBtn = document.querySelector("#startButton");

startBtn.addEventListener("click", function (e) {
  startTimer();
});

let timeLeft = 25 * 60; // total seconds
let timer;

function startTimer() {
  if (!timer) {
    timer = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateDisplay();
      } else {
        clearInterval(timer);
        alert("Time's up!");
      }
    }, 1000);
  }
}

function updateDisplay() {
  const timerElement = document.getElementById("timer");
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerElement.textContent = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;
}
