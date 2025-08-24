import Swal from "./lib/sweetalert.js";

settingsBtn.addEventListener("click", function () {
  Swal.fire({
    title: "Change your settings here!",
    draggable: true,
    html: `
      <div class="settings grid gap-4 bg-brand-box-background w-full max-w-md">
        <!-- Timer -->
        <div class="timer">
          <h2 class="font-semibold mb-2 flex items-center gap-2">
            <i class="fa-solid fa-clock"></i> Timer
          </h2>
          <div class="flex gap-2 justify-center">
            <div class="grid w-[25%] sm:w-auto">
              <label for="work" class="text-sm font-medium mb-1">Work Duration</label>
              <input id="work" name="work" type="number" min="1"
                class="bg-brand-text timerField text-brand-box-background rounded p-2 w-full"
                value="${parseInt(pomoSettings.work, 10)}" />
            </div>
            <div class="grid w-[25%] sm:w-auto">
              <label for="shortbreak" class="text-sm font-medium mb-1">Short Break</label>
              <input id="shortbreak" name="shortbreak" type="number" min="1"
                class="bg-brand-text timerField text-brand-box-background rounded p-2 w-full"
                value="${parseInt(pomoSettings.shortbreak, 10)}" />
            </div>
            <div class="grid w-[25%] sm:w-auto">
              <label for="longbreak" class="text-sm font-medium mb-1">Long Break</label>
              <input id="longbreak" name="longbreak" type="number" min="1"
                class="bg-brand-text timerField text-brand-box-background rounded p-2 w-full"
                value="${parseInt(pomoSettings.longbreak, 10)}" />
            </div>
          </div>
        </div>

        <!-- Sound -->
        <div class="grid gap-4">
          <div>
            <h2 class="font-semibold mt-4 flex items-center gap-2">
              <i class="fa-solid fa-music"></i> Sound
            </h2>
            <div class="flex items-center gap-3">
              <label class="text-sm font-medium whitespace-nowrap" for="sound">Sound:</label>
              <select class="bg-brand-text text-black" name="sound" id="sound">
                <option value="default" ${
                  audio === "default" ? "selected" : ""
                }>Bere Bere Bere</option>
                <option value="loudAlarm" ${
                  audio === "loudAlarm" ? "selected" : ""
                }>Loud Alarm</option>
                <option value="digitalAlarm" ${
                  audio === "digitalAlarm" ? "selected" : ""
                }>Digital Alarm</option>
                <option value="iphoneAlarm" ${
                  audio === "iphoneAlarm" ? "selected" : ""
                }>iPhone Alarm</option>
              </select>

              <!-- Preview button -->
              <button type="button" id="previewSound"
                class="cursor-pointer bg-brand-btn/70 border-2 border-brand-text text-brand-text font-semibold p-2 rounded-lg hover:bg-brand-btn/40 transition-colors duration-300 whitespace-nowrap">
                Listen
              </button>
            </div>
          </div>

          <div class="mr-[50%]">
            <div class="flex items-center gap-4">
              <label for="repeat" class="text-sm font-medium whitespace-nowrap">Repeat:</label>
              <input id="repeat" name="repeat" type="number" min="1"
                class="bg-brand-text timerField text-brand-box-background rounded p-2 w-full"
                value="${audioRepeatCount}" />
            </div>
          </div>
        </div>
      </div>
    `,
    customClass: {
      popup: "overflow-hidden",
      confirmButton:
        "cursor-pointer bg-brand-btn/70 border-2 border-brand-text text-brand-text font-semibold px-5 py-2 sm:px-10 sm:py-4 rounded-lg hover:bg-brand-btn/40 transition-colors duration-300",
    },
    buttonsStyling: false,
    confirmButtonText: "Save Changes",

    preConfirm: () => {
      const timers = document.querySelectorAll(".timerField");
      let values = {};

      for (let timer of timers) {
        const val = parseInt(timer.value, 10);
        if (isNaN(val) || val < 1) {
          Swal.showValidationMessage("All times must be greater than 0");
          return false;
        }
        values[timer.name] = val;
      }

      const sound = document.querySelector("#sound").value;
      if (!sound) {
        Swal.showValidationMessage("Please select a sound");
        return false;
      }
      values.sound = sound;

      const repeat = parseInt(document.querySelector("#repeat").value, 10) || 1;
      values.repeat = repeat;

      return values;
    },

    didOpen: () => {
      const soundSelect = document.querySelector("#sound");
      const repeatInput = document.querySelector("#repeat");
      const previewBtn = document.querySelector("#previewSound");

      const preview = () => {
        const key = soundSelect.value || audio;
        const count = parseInt(repeatInput.value, 10) || 1;
        playAlarm(key, count);
      };

      soundSelect.addEventListener("change", preview);
      previewBtn.addEventListener("click", preview);
    },

    willClose: () => {
      stopCurrent();
    },
  }).then((result) => {
    stopCurrent();
    if (result.isConfirmed) {
      audio = result.value.sound;
      audioRepeatCount = result.value.repeat;

      pomoSettings.work = `${result.value.work}:00`;
      pomoSettings.shortbreak = `${result.value.shortbreak}:00`;
      pomoSettings.longbreak = `${result.value.longbreak}:00`;

      clearTimeInterval();
      renderTimer("work");
    }
  });
});
