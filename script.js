// ----------------------
// Theme Toggle
// ----------------------
const toggleBtn = document.getElementById("theme-toggle");
const DELETE_PASSWORD = "Praju@123"; // Change this password as needed
let draggedId = null;

function setTheme(mode) {
  if (mode === "light") {
    document.body.classList.add("light");
    toggleBtn.textContent = "🌙 Dark";
    localStorage.setItem("theme", "light");
  } else {
    document.body.classList.remove("light");
    toggleBtn.textContent = "🌞 Light";
    localStorage.setItem("theme", "dark");
  }
}

setTheme(localStorage.getItem("theme") || "dark");
toggleBtn.addEventListener("click", () => {
  const isLight = document.body.classList.contains("light");
  setTheme(isLight ? "dark" : "light");
});

// ----------------------
// Live Clocks
// ----------------------
function fmt(zone) {
  const now = new Date();
  const date = new Intl.DateTimeFormat("en-GB", {
    timeZone: zone, weekday: "short", day: "2-digit", month: "short", year: "numeric"
  }).format(now);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: zone, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true
  }).format(now);
  return { date, time };
}

// function tick() {
//   const zones = [
//     ["clock-ist", "date-ist", "Asia/Kolkata"],
//     ["clock-ct", "date-ct", "America/Chicago"],
//     ["clock-utc", "date-utc", "UTC"]
//   ];
//   zones.forEach(([clockId, dateId, zone]) => {
//     const { date, time } = fmt(zone);
//     document.getElementById(clockId).textContent = time;
//     document.getElementById(dateId).textContent = date;
//   });
// }
// tick();
// setInterval(tick, 1000);

// ----------------------
// Dynamic Bookmark Manager with localStorage
// ----------------------
let bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
let editId = null;

const listEl = document.getElementById("bookmark-list");
const form = document.getElementById("bookmark-form");
const catInput = document.getElementById("bm-category");
const emojiInput = document.getElementById("bm-emoji");
const labelInput = document.getElementById("bm-label");
const urlInput = document.getElementById("bm-url");
const clearBtn = document.getElementById("bm-clear");

function save() {
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
}


function render() {
  listEl.innerHTML = "";

  if (bookmarks.length === 0) {
    listEl.innerHTML = "<p>No bookmarks yet 🚀</p>";
    return;
  }

  const grouped = {};

  // Group bookmarks by category
  bookmarks.forEach(bm => {
    if (!grouped[bm.category]) grouped[bm.category] = [];
    grouped[bm.category].push(bm);
  });

  // Render each category
  for (const [cat, items] of Object.entries(grouped)) {
    const section = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = cat;
    section.appendChild(title);

    items.forEach(bm => {
      const div = document.createElement("div");
      div.className = "link";
      div.dataset.id = bm.id;

      // ✅ Add drag handle inside HTML
      div.innerHTML = `
        <span class="drag-handle">☰</span>
        <span>${bm.emoji}</span>
        <a href="${bm.url}" target="_blank" title="${bm.url}">${bm.label}</a>
        <span style="margin-left:auto;">
          <button onclick="editBookmark(${bm.id})">✏️</button>
          <button onclick="requestDelete(${bm.id})">🗑️</button>
        </span>
      `;

      const handle = div.querySelector(".drag-handle");

      // ----------------------
      // DRAG EVENTS (HANDLE ONLY)
      // ----------------------

      handle.draggable = true;

      handle.addEventListener("dragstart", () => {
        draggedId = bm.id;
        div.classList.add("dragging");
      });

      handle.addEventListener("dragend", () => {
        div.classList.remove("dragging");
      });

      // ----------------------
      // DROP EVENTS (ON CARD)
      // ----------------------

      div.addEventListener("dragover", (e) => {
        e.preventDefault();
        div.classList.add("drag-over");
      });

      div.addEventListener("dragleave", () => {
        div.classList.remove("drag-over");
      });

      div.addEventListener("drop", () => {
        div.classList.remove("drag-over");

        if (draggedId === bm.id) return;

        const draggedItem = bookmarks.find(b => b.id === draggedId);
        if (!draggedItem || draggedItem.category !== bm.category) return;

        const fromIndex = bookmarks.findIndex(b => b.id === draggedId);
        const toIndex = bookmarks.findIndex(b => b.id === bm.id);

        if (fromIndex === -1 || toIndex === -1) return;

        // Reorder within same category
        const [movedItem] = bookmarks.splice(fromIndex, 1);
        bookmarks.splice(toIndex, 0, movedItem);

        save();
        render();
      });

      //  div.addEventListener("mouseenter", () => {
      //   const preview = document.createElement("iframe");
      //   preview.src = bm.url;
      //   preview.style.width = "200px";
      //   preview.style.height = "120px";
      //   preview.style.position = "absolute";
      //   preview.style.top = "-130px"; // position above the link
      //   preview.style.left = "0";
      //   preview.style.zIndex = 999;
      //   preview.style.border = "1px solid var(--accent)";
      //   preview.style.borderRadius = "8px";
      //   preview.style.boxShadow = "0 4px 12px rgba(0,0,0,0.25)";
      //   div.appendChild(preview);
      // });

      // div.addEventListener("mouseleave", () => {
      //   const iframe = div.querySelector("iframe");
      //   if (iframe) div.removeChild(iframe);
      // });


      section.appendChild(div);
    });

    listEl.appendChild(section);
  }
 
}



function addBookmark(e) {
  e.preventDefault();

  const category = catInput.value.trim().replace(/\b\w/g, c => c.toUpperCase());
  const emoji = emojiInput.value.trim();
  const label = labelInput.value.trim();
  const url = urlInput.value.trim();

  // ✅ Prevent duplicate URLs
  const existing = bookmarks.find(b => b.url === url && b.id !== editId);
  if (existing) {
    alert("⚠️ This URL is already in your bookmarks!");
    return;
  }

  const newBM = {
    id: editId || Date.now(),
    category,
    emoji,
    label,
    url
  };

  if (editId) {
    // Update existing bookmark
    bookmarks = bookmarks.map(b => (b.id === editId ? newBM : b));
    editId = null;
  } else {
    // Add new bookmark
    bookmarks.push(newBM);
  }

  save();
  render();
  form.reset();
}

window.editBookmark = function (id) {
  const bm = bookmarks.find(b => b.id === id);
  if (!bm) return;
  catInput.value = bm.category;
  emojiInput.value = bm.emoji;
  labelInput.value = bm.label;
  urlInput.value = bm.url;
  editId = id;
};

// 🔐 Ask password before deleting
window.requestDelete = function (id) {
  const entered = prompt("Enter password to delete this bookmark:");
  if (entered === DELETE_PASSWORD) {
    deleteBookmark(id);
  } else if (entered !== null) {
    alert("❌ Incorrect password. Deletion cancelled.");
  }
};

function deleteBookmark(id) {
  bookmarks = bookmarks.filter(b => b.id !== id);
  save();
  render();
}


clearBtn.addEventListener("click", () => {
  const entered = prompt("Enter password to clear all bookmarks:");
  if (entered === DELETE_PASSWORD) {
    if (confirm("Are you sure you want to clear all bookmarks?")) {
      bookmarks = [];
      save();
      render();
    }
  } else if (entered !== null) {
    alert("❌ Incorrect password. Clearing cancelled.");
  }
});


form.addEventListener("submit", addBookmark);
render();

// ----------------------
// Search Filter
// ----------------------
const filterInput = document.getElementById("filter");
const countBadge = document.getElementById("count");

filterInput.addEventListener("input", () => {
  const term = filterInput.value.toLowerCase().trim();
  const links = document.querySelectorAll("#bookmark-list .link");
  let visible = 0;
  links.forEach(link => {
    const text = link.innerText.toLowerCase();
    if (text.includes(term)) {
      link.style.display = "";
      visible++;
    } else {
      link.style.display = "none";
    }
  });
  countBadge.textContent = `${visible} shown`;
});


function getDayPhase(hour) {
  if (hour >= 5 && hour < 7) {
    return { label: "Morning - Dawn 🌅" };
  } else if (hour >= 7 && hour < 12) {
    return { label: "Morning ☀️" };
  } else if (hour >= 12 && hour < 17) {
    return { label: "Afternoon 🌤️" };
  } else if (hour >= 17 && hour < 19) {
    return { label: "Evening - Dusk 🌇" };
  } else if (hour >= 19 && hour < 21) {
    return { label: "Evening 🌆" };
  } else {
    return { label: "Night 🌙" };
  }
}

function updateClock(idPrefix, timeZone, label) {
  const now = new Date();
  const tzTime = new Date(now.toLocaleString("en-US", { timeZone }));

  const hours = tzTime.getHours();
  const minutes = tzTime.getMinutes().toString().padStart(2, "0");
  const seconds = tzTime.getSeconds().toString().padStart(2, "0");

  document.getElementById(`clock-${idPrefix}`).textContent =
    hours + ":" + minutes + ":" + seconds;

  document.getElementById(`date-${idPrefix}`).textContent =
    tzTime.toDateString();

  const phase = getDayPhase(hours);
  document.getElementById(`phase-${idPrefix}`).textContent =
    label + " - " + phase.label;
}

// IST
setInterval(() => updateClock("ist", "Asia/Kolkata", "IST"), 1000);
// CT
setInterval(() => updateClock("ct", "America/Chicago", "CT"), 1000);
// UTC
setInterval(() => updateClock("utc", "Etc/UTC", "UTC"), 1000);

function setDefaultTime() {
  const input = document.getElementById("time-input");

  // Current date & time in IST
  const now = new Date();
  const istString = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Kolkata",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false
  }).format(now);

  // Format as YYYY-MM-DDTHH:MM for datetime-local
  const formatted = istString.replace(" ", "T").slice(0,16);
  input.value = formatted;

  // Set dropdowns
  document.getElementById("from-tz").value = "Asia/Kolkata";
  document.getElementById("to-tz").value = "America/Chicago";

  // Auto-convert
  convertTime();
}

function convertTime() {
  const input = document.getElementById("time-input").value;
  const fromTZ = document.getElementById("from-tz").value;
  const toTZ = document.getElementById("to-tz").value;
  const outputEl = document.getElementById("time-output");
  
  if (!input) {
    outputEl.innerText = "⚠️ Please select a date and time!";
    return;
  }
  
  // Parse input in the "from" timezone
  const dateInFromTZ = new Date(new Date(input).toLocaleString("en-US", { timeZone: fromTZ }));
  
  // Convert to "to" timezone
  const converted = new Intl.DateTimeFormat("en-US", {
    timeZone: toTZ,
    dateStyle: "medium",
    timeStyle: "medium"
  }).format(dateInFromTZ);
  
  outputEl.innerText = `${converted} (${toTZ})`;
}

// Auto-update on input or dropdown change
document.getElementById("time-input").addEventListener("input", convertTime);
document.getElementById("from-tz").addEventListener("change", convertTime);
document.getElementById("to-tz").addEventListener("change", convertTime);

// Set default IST→CT on page load
setDefaultTime();
setGreeting();
setInterval(setGreeting, 60 * 60 * 1000); // every 1 hr
document.getElementById("convert-btn").addEventListener("click", convertTime);

document.getElementById("now-btn").addEventListener("click", () => {
  const now = new Date();
  
  // Convert to IST timezone string for datetime-local
  const istString = now.toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" }).replace(" ", "T");
  document.getElementById("time-input").value = istString;
});


// function updateTimer(idPrefix, timeZone) {
//   const now = new Date();
//   const tzTime = new Date(now.toLocaleString("en-US", { timeZone }));

//   // Countdown to next full hour
//   const nextHour = new Date(tzTime);
//   nextHour.setHours(tzTime.getHours() + 1, 0, 0, 0);

//   let diff = nextHour - tzTime; // in ms
//   const h = Math.floor(diff / (1000 * 60 * 60));
//   diff %= 1000 * 60 * 60;
//   const m = Math.floor(diff / (1000 * 60));
//   diff %= 1000 * 60;
//   const s = Math.floor(diff / 1000);

//   document.getElementById(`timer-${idPrefix}`).textContent =
//     `Next hour in: ${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
// }

// // Update all timers every second
// setInterval(() => {
//   updateTimer("ist", "Asia/Kolkata");
//   updateTimer("ct", "America/Chicago");
//   updateTimer("utc", "Etc/UTC");
// }, 1000);


// ⏳ Countdown Timer
const cdStart = document.getElementById("cd-start");
const cdStop = document.getElementById("cd-stop");
const cdReset = document.getElementById("cd-reset");
const cdTime = document.getElementById("cd-time");
const cdAdd = document.getElementById("cd-add");
const cdSub = document.getElementById("cd-sub");

const cdHr = document.getElementById("cd-hr");
const cdMin = document.getElementById("cd-min");
const cdSec = document.getElementById("cd-sec");

const circle = document.querySelector(".cd-circle circle:last-child");
const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

circle.style.strokeDasharray = CIRCUMFERENCE;

let totalTime = 0;
let remainingTime = 0;
let countdownInterval = null;
let originalTime = 0;

// Initialize with default time (current HH:MM:SS or 0)
function initCountdown() {
  const now = new Date();
  cdHr.value = now.getHours();
  cdMin.value = now.getMinutes();
  cdSec.value = now.getSeconds();
  totalTime = getTimeFromInput();
  remainingTime = totalTime;
  originalTime = totalTime;
  updateCountdownDisplay();
}

function getTimeFromInput() {
  const h = parseInt(cdHr.value) || 0;
  const m = parseInt(cdMin.value) || 0;
  const s = parseInt(cdSec.value) || 0;
  return h * 3600 + m * 60 + s;
}

function updateCountdownDisplay() {
  let t = remainingTime;
  const h = Math.floor(t / 3600).toString().padStart(2,"0");
  t %= 3600;
  const m = Math.floor(t / 60).toString().padStart(2,"0");
  const s = (t % 60).toString().padStart(2,"0");
  cdTime.textContent = `${h}:${m}:${s}`;

  // Update circular progress
  // const percent = remainingTime / totalTime;
  const percent = totalTime ? (remainingTime / totalTime) : 0;
  circle.style.strokeDashoffset = CIRCUMFERENCE * (1 - percent);
}

// Start countdown
cdStart.addEventListener("click", () => {
  if (countdownInterval) return; // already running
  remainingTime = remainingTime || getTimeFromInput();
  countdownInterval = setInterval(() => {
    if (remainingTime <= 0) {
      clearInterval(countdownInterval);
      countdownInterval = null;
      playSound();
      alert("⏰ Countdown finished!");
      return;
    }
    remainingTime--;
    updateCountdownDisplay();
  }, 1000);
});

// Stop countdown
cdStop.addEventListener("click", () => {
  clearInterval(countdownInterval);
  countdownInterval = null;
});


// +0.5 min
cdAdd.addEventListener("click", () => {
  remainingTime += 30;
  totalTime += 30;
  updateCountdownDisplay();
});

// -0.5 min
cdSub.addEventListener("click", () => {
  if (remainingTime >= 30) {
    remainingTime -= 30;
    totalTime -= 30;
  } else {
    remainingTime = 0;
    totalTime = 0;
  }
  updateCountdownDisplay();
});

// Sound alert
function playSound() {
  const audio = new Audio("https://www.soundjay.com/buttons/sounds/beep-07.mp3");
  audio.play();
}
// Reset countdown
cdReset.addEventListener("click", () => {
  clearInterval(countdownInterval);
  countdownInterval = null;
  remainingTime = 0;
  totalTime = 0;
  updateCountdownDisplay();
  // Optionally also clear inputs
  cdHr.value = "00";
  cdMin.value = "00";
  cdSec.value = "00";
});

// Initialize on page load
initCountdown();





document.getElementById("now-btn").addEventListener("click", () => {
  const now = new Date();

  // Format for datetime-local
  const offset = now.getTimezoneOffset();
  const localISOTime = new Date(now.getTime() - offset * 60000)
    .toISOString()
    .slice(0, 16);

  document.getElementById("time-input").value = localISOTime;
});


async function setGreeting() {
  const greetingEl = document.getElementById("greeting-text");
  const quoteEl = document.getElementById("quote-text");
  const authorEl = document.getElementById("quote-author");

  const name = "PRAJWAL";

  // IST Time
  const now = new Date();
  const istTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  const hour = istTime.getHours();

  let greeting = "";

  if (hour >= 5 && hour < 12) {
    greeting = `Good Morning, ${name} ☀️`;
  } else if (hour >= 12 && hour < 18) {
    greeting = `Good Afternoon, ${name} 🌤️`;
  } else {
    greeting = `Good Evening, ${name} 🌙`;
  }

  greetingEl.textContent = greeting;

  // Loading state
  quoteEl.textContent = "Loading quote...";
  authorEl.textContent = "";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(
      "https://api.quotable.io/random?tags=philosophy|wisdom",
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    if (!res.ok) throw new Error("API failed");

    const data = await res.json();

    quoteEl.textContent = `"${data.content}"`;
    authorEl.textContent = `- ${data.author}`;

  } catch (err) {
    console.warn("Using fallback quotes");

    const fallbackQuotes = [
      { q: "He who knows himself is wise.", a: "Socrates" },
      { q: "Happiness depends upon ourselves.", a: "Aristotle" },
      { q: "What you seek is seeking you.", a: "Rumi" },
      { q: "Silence is a source of great strength.", a: "Lao Tzu" }
    ];

    const index = new Date().getDate() % fallbackQuotes.length;
    const random = fallbackQuotes[index];

    quoteEl.textContent = `"${random.q}"`;
    authorEl.textContent = `- ${random.a}`;
  }
}
