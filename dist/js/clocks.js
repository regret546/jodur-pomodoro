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

    // Display time and AM/PM together as one string
    document.getElementById("time-" + zone.id).textContent = formatted;
  });
}

setInterval(updateClock, 1000);
updateClock();
