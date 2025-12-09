const settingsBtn = document.querySelector("#gearIcon");
const timerElement = document.querySelector("#timer");
const startBtn = document.querySelector("#startButton");
const icon = startBtn.querySelector("i");
const resetBtn = document.querySelector("#resetButton");
const pomoBackground = document.querySelector("#pomoBg");
const lottie1 = document.querySelector("#lottie1");
const lottie2 = document.querySelector("#lottie2");

let timeLeft = 0;
let timer = null;
let pause = false;
let showingFirst = true;
let activeMode = "work";
let audio = "default";
let audioRepeatCount = 1;

let pomoSettings = {
  work: "25:00",
  shortbreak: "5:00",
  longbreak: "15:00",
};

let pomoAudios = {
  default: "berebere.mp3",
  loudAlarm: "loudAlarm.mp3",
  digitalAlarm: "digitalAlarm.mp3",
  iphoneAlarm: "iphoneAlarm.mp3",
};

let currentAlarm;

// -------------------------
// Notifications + Audio
// -------------------------
function notifyUser(title, body, soundKey, repeat = 1) {
  // 1. Desktop Notification
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission();
  }

  // 2. Audio Alarm
  playAlarm(soundKey, repeat);

  // 3. Title flash fallback
  const oldTitle = document.title;
  let flash = true;
  const titleInterval = setInterval(() => {
    document.title = flash ? `⏰ ${title}` : oldTitle;
    flash = !flash;
  }, 1000);

  // stop flashing after 10s
  setTimeout(() => {
    clearInterval(titleInterval);
    document.title = oldTitle;
  }, 10000);
}

// -------------------------
// Timer Controls
// -------------------------
startBtn.addEventListener("click", function () {
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
  icon.classList.toggle("fa-play");
  icon.classList.toggle("fa-pause");
}

// Reset
resetBtn.addEventListener("click", function () {
  if (pause) {
    resetBtn.classList.add("rotate");
    clearTimeInterval();
    setTimeout(() => resetBtn.classList.remove("rotate"), 300);
    renderTimer("work");
  }
});

// Starts the countdown timer
function startTimer() {
  if (!timer && timeLeft > 0) {
    // Mark the "finish time" in ms
    const endTime = Date.now() + timeLeft * 1000;

    timer = setInterval(() => {
      const now = Date.now();
      // Recalculate remaining seconds
      timeLeft = Math.max(0, Math.round((endTime - now) / 1000));

      updateDisplay();

      if (timeLeft <= 0) {
        clearTimeInterval();
        renderTimer("work");
        notifyUser("Time's up!", "Take a break 🎉", audio, audioRepeatCount);
      }
    }, 1000);
  }
}

function clearTimeInterval() {
  clearInterval(timer);
  timer = null;
}

//Update displayTime
function renderTimer(mode) {
  activeMode = mode;
  lottieAnimate(false);
  timerElement.textContent = pomoSettings[mode];
  let minutes = parseInt(pomoSettings[mode].split(":")[0], 10);
  pause = false;
  setTime(minutes);
  clearTimeInterval();
  icon.classList.remove("fa-pause");
  icon.classList.add("fa-play");
  changeBackgroundColor(mode);

  // Remove highlight from all li's
  document.querySelectorAll("#timer-modes li").forEach((li) => {
    li.classList.remove("bg-brand-btn/40");
  });

  // Add highlight to the clicked one
  document.querySelector(`li[${mode}]`).classList.add("bg-brand-btn/40");
}

function changeBackgroundColor(mode) {
  const removeBg = () => {
    pomoBackground.classList.forEach((c) => {
      if (c.startsWith("bg-") || c.startsWith("bg[")) {
        pomoBackground.classList.remove(c);
      }
    });
  };

  if (mode === "work") {
    removeBg();
    pomoBackground.classList.add("bg-brand-box-background");
  } else if (mode === "shortbreak") {
    removeBg();
    pomoBackground.classList.add("bg-[#1B5E20]");
  } else {
    removeBg();
    pomoBackground.classList.add("bg-[#001F4D]");
  }
}

function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const currentTime = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;
  timerElement.textContent = currentTime;
  document.title = `${capitalizeFirstLetter(activeMode)}: ${currentTime}`;
}

//Set time
function setTime(time = 25) {
  timeLeft = time * 60;
}

// -------------------------
// Audio Handling
// -------------------------
function stopCurrent() {
  if (currentAlarm) {
    currentAlarm.onended = null;
    currentAlarm.pause();
    currentAlarm.currentTime = 0;
    currentAlarm = null;
  }
}

function playAlarm(audioKey, repeatCount = 1) {
  stopCurrent();
  const soundFile = `./audio/${pomoAudios[audioKey]}`;
  const audioEl = new Audio(soundFile);
  let playsDone = 0;

  audioEl.onended = () => {
    playsDone++;
    if (playsDone < repeatCount) {
      audioEl.currentTime = 0;
      audioEl.play();
    } else {
      audioEl.onended = null;
      currentAlarm = null;
    }
  };

  currentAlarm = audioEl;
  audioEl.play().catch((err) => {
    console.log("Audio blocked by browser:", err);
  });
}

//For lottie's animation
function lottieAnimate(bool) {
  if (!lottie1 || !lottie2) return; // Guard against missing elements
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

// Request Notification Permission on Page Load
document.addEventListener("DOMContentLoaded", () => {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
});

setTime();
