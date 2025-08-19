const timerElement = document.getElementById("timer");
const startBtn = document.querySelector("#startButton");
const icon = startBtn.querySelector("i");
const resetBtn = document.querySelector("#resetButton");
let audio = new Audio("./audio/berebere.mp3");
let timeLeft = 0;
let timer = null;
let pause = false;
let showingFirst = true;
let pauseTime;

startBtn.addEventListener("click", function (e) {
  if (!pause) {
    startTimer();
    pauseAndPlay();
    pause = true;
    lottieAnimate(true);
  } else {
    clearTimeInterval(timer);
    lottieAnimate(false);
    pauseAndPlay();
    pause = false;
  }
});

// toggle play / pause
function pauseAndPlay() {
  if (icon.classList.contains("fa-play")) {
    icon.classList.remove("fa-play");
    icon.classList.add("fa-pause");
    console.log("if");
  } else {
    icon.classList.remove("fa-pause");
    icon.classList.add("fa-play");
    console.log("else");
  }
}

// Reset
resetBtn.addEventListener("click", function () {
  if (pause) {
    resetBtn.classList.add("rotate");
    clearTimeInterval();
    renderTimer("25:00");
    setTimeout(() => {
      resetBtn.classList.remove("rotate");
    }, 300);
  }
});

// Starts the countdown timer and stops when time runs out
function startTimer() {
  if (!timer && timeLeft > 0) {
    timer = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateDisplay();
      } else {
        clearTimeInterval();
        playAlarm();
      }
    }, 1000);
  }
}

function clearTimeInterval() {
  clearInterval(timer);
  timer = null;
}

//Update displayTime
function renderTimer(timeInterval) {
  lottieAnimate(false);
  timerElement.textContent = timeInterval;
  let minutes = parseInt(timeInterval.split(":")[0], 10);
  pause = false;
  setTime(minutes);
  clearTimeInterval();
  icon.classList.remove("fa-pause");
  icon.classList.add("fa-play");
}

// Update time
function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  currentTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
  timerElement.textContent = currentTime;
}

//Pause time

function getPauseTime() {
  clearTimeInterval();
}

//Set time, depends on intervals
function setTime(time = 25) {
  timeLeft = time * 60;
}

function playAlarm() {
  audio.play();
}

function stopAudio() {
  audio.pause();
  audio.currentTime = 0;
}

//For lottie's animation
function lottieAnimate(bool) {
  showingFirst = bool;
  if (showingFirst) {
    lottie1.classList.replace("translate-x-0", "-translate-x-full");
    lottie2.classList.replace("translate-x-full", "translate-x-0");
  } else {
    lottie1.classList.replace("-translate-x-full", "translate-x-0");
    lottie2.classList.replace("translate-x-0", "translate-x-full");
  }
  showingFirst = !showingFirst;
}

setTime();
