import Swal from "./lib/sweetalert.js";
// Settings
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
              <input
                id="work"
                name="work"
                type="number"
                min="1"
                class="bg-brand-text timerField text-brand-box-background rounded p-2 w-full"
              />
            </div>

            <div class="grid w-[25%] sm:w-auto">
              <label for="shortbreak" class="text-sm font-medium mb-1">Short Break</label>
              <input
                id="shortbreak"
                name="shortbreak"
                type="number"
                min="1"
                class="bg-brand-text timerField text-brand-box-background rounded p-2 w-full"
              />
            </div>

            <div class="grid w-[25%] sm:w-auto">
              <label for="longbreak" class="text-sm font-medium mb-1">Long Break</label>
              <input
                id="longbreak"
                name="longbreak"
                type="number"
                min="1"
                class="bg-brand-text timerField text-brand-box-background rounded p-2 w-full"
              />
            </div>
          </div>
        </div>

        <!-- Sound -->
        <div>
          <h2 class="font-semibold mt-4 flex items-center gap-2">
            <i class="fa-solid fa-music"></i> Audio
          </h2>
        </div>
      </div>
    `,
    customClass: {
      popup: "overflow-hidden", // 👈 disable both x and y scroll inside modal
      confirmButton:
        "cursor-pointer bg-brand-btn/70 border-2 border-brand-text text-brand-text font-semibold px-5 py-2 sm:px-10 sm:py-4 rounded-lg hover:bg-brand-btn/40 transition-colors duration-300",
    },
    buttonsStyling: false,
    confirmButtonText: "Save Changes",

    // Validation for inputs
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

      return values;
    },
  }).then((result) => {
    if (result.isConfirmed) {
      pomoSettings.work = `${result.value.work}:00`;
      pomoSettings.shortbreak = `${result.value.shortbreak}:00`;
      pomoSettings.longbreak = `${result.value.longbreak}:00`;
      clearTimeInterval();
      renderTimer("work");
    }
  });
});
