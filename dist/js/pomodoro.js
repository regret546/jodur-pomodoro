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

// Expose pause state globally for todo.js
window.pause = pause;

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
let pendingAlarm = null; // Track alarm that should play when tab becomes visible
let timerEndTime = null; // Store when the timer should finish

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

  // 2. Audio Alarm - play immediately if tab is visible, otherwise queue it
  if (document.visibilityState === "visible") {
    playAlarm(soundKey, repeat);
  } else {
    // Tab is hidden, queue the alarm to play when tab becomes visible
    pendingAlarm = { soundKey, repeat };
  }

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
    window.pause = true; // Sync with global
    lottieAnimate(true);
    // Update todo buttons when timer starts
    if (typeof window.updateTodoButtons === "function") {
      window.updateTodoButtons();
    }
  } else {
    clearTimeInterval(timer);
    lottieAnimate(false);
    pauseAndPlay();
    pause = false;
    window.pause = false; // Sync with global
    // Update todo buttons when timer pauses
    if (typeof window.updateTodoButtons === "function") {
      window.updateTodoButtons();
    }
  }
});

// toggle play / pause
function pauseAndPlay() {
  icon.classList.toggle("fa-play");
  icon.classList.toggle("fa-pause");
}

// Reset
resetBtn.addEventListener("click", function () {
  resetBtn.classList.add("rotate");
  clearTimeInterval();
  setTimeout(() => resetBtn.classList.remove("rotate"), 300);
  renderTimer(activeMode);
  // Clear active todo and update buttons when reset
  if (window.activeTodoIndex !== undefined) {
    window.activeTodoIndex = null;
  }
  if (typeof window.updateTodoButtons === "function") {
    window.updateTodoButtons();
  }
});

// Function to handle timer completion
function handleTimerCompletion() {
  clearTimeInterval();
  timerEndTime = null; // Clear the end time
  renderTimer("work");
  // Clear active todo when timer finishes
  if (window.activeTodoIndex !== undefined) {
    window.activeTodoIndex = null;
  }
  if (typeof window.updateTodoButtons === "function") {
    window.updateTodoButtons();
  }
  notifyUser("Time's up!", "Take a break 🎉", audio, audioRepeatCount);
}

// Starts the countdown timer
function startTimer() {
  if (!timer && timeLeft > 0) {
    // Mark the "finish time" in ms
    timerEndTime = Date.now() + timeLeft * 1000;
    let lastDisplayedSeconds = -1;

    // Update display immediately
    updateDisplay();
    lastDisplayedSeconds = timeLeft;

    timer = setInterval(() => {
      const now = Date.now();
      // Recalculate remaining seconds based on actual elapsed time
      timeLeft = Math.max(0, Math.round((timerEndTime - now) / 1000));

      // Only update display when seconds actually change (more efficient)
      if (timeLeft !== lastDisplayedSeconds) {
        updateDisplay();
        lastDisplayedSeconds = timeLeft;
      }

      if (timeLeft <= 0) {
        handleTimerCompletion();
      }
    }, 100); // Check frequently for accuracy, but only update display when needed
  }
}

// Expose startTimer globally for todo.js
window.startTimer = startTimer;

function clearTimeInterval() {
  clearInterval(timer);
  timer = null;
  timerEndTime = null; // Clear end time when timer is cleared
}

//Update displayTime
function renderTimer(mode) {
  activeMode = mode;
  lottieAnimate(false);
  timerElement.textContent = pomoSettings[mode];
  let minutes = parseInt(pomoSettings[mode].split(":")[0], 10);
  pause = false;
  window.pause = false; // Sync with global
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
  const modeElement = document.querySelector(`li[${mode}]`);
  if (modeElement) {
    modeElement.classList.add("bg-brand-btn/40");
  }

  // Update todo buttons when timer is reset
  if (typeof window.updateTodoButtons === "function") {
    window.updateTodoButtons();
  }
}

// Expose renderTimer globally for todo.js
window.renderTimer = renderTimer;

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

  // Only update title if it's not flashing (during notification)
  if (!document.title.includes("⏰")) {
    document.title = `${capitalizeFirstLetter(activeMode)}: ${currentTime}`;
  }
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

  // Set volume to ensure it's audible
  audioEl.volume = 1.0;

  audioEl.onended = () => {
    playsDone++;
    if (playsDone < repeatCount) {
      audioEl.currentTime = 0;
      audioEl.play().catch((err) => {
        console.log("Audio replay blocked:", err);
      });
    } else {
      audioEl.onended = null;
      currentAlarm = null;
    }
  };

  // Handle errors during loading
  audioEl.onerror = (err) => {
    console.error("Audio loading error:", err);
    // Fallback: show notification if audio fails
    if (Notification.permission === "granted") {
      new Notification("Time's up!", { body: "Take a break 🎉" });
    }
  };

  currentAlarm = audioEl;

  // Try to play - use a small delay if called from visibility change to ensure tab is active
  const tryPlay = () => {
    const playPromise = audioEl.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.log("Audio play blocked:", err);
        // Retry once after a short delay
        setTimeout(() => {
          audioEl.play().catch((retryErr) => {
            console.log("Audio retry also blocked:", retryErr);
            // If audio fails, at least ensure notification shows
            if (Notification.permission === "granted") {
              new Notification("Time's up!", { body: "Take a break 🎉" });
            }
          });
        }, 100);
      });
    }
  };

  // If audio is already loaded, play immediately, otherwise wait for canplay
  if (audioEl.readyState >= 2) {
    tryPlay();
  } else {
    audioEl.addEventListener("canplay", tryPlay, { once: true });
    audioEl.load();
  }
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

// Function to check and handle timer completion when tab becomes visible
function checkTimerOnVisibility() {
  // Small delay to ensure tab is fully active and browser allows audio
  setTimeout(() => {
    // Check if timer should have finished while tab was hidden
    // This handles the case where the interval was throttled and never fired
    if (timerEndTime && Date.now() >= timerEndTime) {
      // Timer finished while tab was hidden
      // Check if we have a pending alarm (interval fired but alarm was queued)
      if (pendingAlarm) {
        // Interval fired, alarm was queued, now play it
        playAlarm(pendingAlarm.soundKey, pendingAlarm.repeat);
        pendingAlarm = null;
      } else if (timer) {
        // Interval never fired, timer is still "running" but time has passed
        // Force completion now
        handleTimerCompletion();
      }
      return;
    }

    // Play any pending alarm if timer hasn't finished yet
    if (pendingAlarm) {
      playAlarm(pendingAlarm.soundKey, pendingAlarm.repeat);
      pendingAlarm = null;
      return;
    }

    // Update display immediately when tab becomes visible to fix any drift
    if (timer && timerEndTime) {
      const now = Date.now();
      const calculatedTimeLeft = Math.max(
        0,
        Math.round((timerEndTime - now) / 1000)
      );

      // If calculated time is 0 or less but timer is still running, force completion
      if (calculatedTimeLeft <= 0) {
        handleTimerCompletion();
        return;
      }

      timeLeft = calculatedTimeLeft;
      updateDisplay();
    }
  }, 50); // Small delay to ensure browser allows audio after tab switch
}

// Handle Page Visibility - play pending alarm when tab becomes visible
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    checkTimerOnVisibility();
  }
});

// Also check on window focus as a backup
window.addEventListener("focus", () => {
  checkTimerOnVisibility();
});

// Request Notification Permission on Page Load
document.addEventListener("DOMContentLoaded", () => {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
});

setTime();
