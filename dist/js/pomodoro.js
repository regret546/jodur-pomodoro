const startBtn = document.querySelector("#startButton");
startBtn.addEventListener("click", function (e) {
  startTimer();
});

let timeLeft = 0;
let timer = null;

// Starts the countdown timer and stops when time runs out
function startTimer() {
  if (!timer && timeLeft > 0) {
    // only start if no timer running
    timer = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateDisplay();
      } else {
        clearTimeInterval();
        alert("Time's up!");
      }
    }, 1000);
  }
}

function clearTimeInterval() {
  clearInterval(timer);
  timer = null;
}

const timerElement = document.getElementById("timer");
//Update displayTime
function renderTimer(timeInterval) {
  timerElement.textContent = timeInterval;
  let minutes = parseInt(timeInterval.split(":")[0], 10);
  setTime(minutes);
  clearTimeInterval();
}

// Update time
function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerElement.textContent = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;
}

//Set time, depends on intervals
function setTime(time = 25) {
  timeLeft = time * 60;
}

setTime();
