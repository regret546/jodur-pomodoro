function updateClock() {
  const timeZones = [
    { id: "denmark", tz: "Europe/Copenhagen" },
    { id: "india", tz: "Asia/Kolkata" },
    { id: "us", tz: "America/New_York" },
    { id: "ph", tz: "Asia/Manila" },
  ];

  timeZones.forEach((zone) => {
    const now = new Date();
    const options = {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
      timeZone: zone.tz,
    };
    const formatted = new Intl.DateTimeFormat("en-US", options).format(now);

    const [time, ampm] = formatted.split(" "); // split into HH:MM:SS and AM/PM
    document.getElementById("time-" + zone.id).textContent = time;
    document.getElementById("ampm-" + zone.id).textContent = ampm;
  });
}

setInterval(updateClock, 1000);
updateClock();
