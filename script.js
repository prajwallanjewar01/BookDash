// ----------------------
// Theme Toggle
// ----------------------
const toggleBtn = document.getElementById("theme-toggle");
const DELETE_PASSWORD = "Praju@123"; // Change this password as needed

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

function tick() {
  const zones = [
    ["clock-ist", "date-ist", "Asia/Kolkata"],
    ["clock-ct", "date-ct", "America/Chicago"],
    ["clock-utc", "date-utc", "UTC"]
  ];
  zones.forEach(([clockId, dateId, zone]) => {
    const { date, time } = fmt(zone);
    document.getElementById(clockId).textContent = time;
    document.getElementById(dateId).textContent = date;
  });
}
tick();
setInterval(tick, 1000);

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
  const grouped = {};
  bookmarks.forEach(bm => {
    if (!grouped[bm.category]) grouped[bm.category] = [];
    grouped[bm.category].push(bm);
  });

  for (const [cat, items] of Object.entries(grouped)) {
    const section = document.createElement("div");
    section.innerHTML = `<h3>${cat}</h3>`;
    items.forEach(bm => {
      const div = document.createElement("div");
      div.className = "link";
      div.innerHTML = `
        <span>${bm.emoji}</span>
        <a href="${bm.url}" target="_blank">${bm.label}</a>
        <span style="margin-left:auto;">
          <button onclick="editBookmark(${bm.id})">✏️</button>
          <button onclick="requestDelete(${bm.id})">🗑️</button>

        </span>
      `;
      section.appendChild(div);
    });
    listEl.appendChild(section);
  }
}

function addBookmark(e) {
  e.preventDefault();
  const newBM = {
    id: editId || Date.now(),
    category: catInput.value.trim(),
    emoji: emojiInput.value.trim(),
    label: labelInput.value.trim(),
    url: urlInput.value.trim()
  };

  if (editId) {
    bookmarks = bookmarks.map(b => (b.id === editId ? newBM : b));
    editId = null;
  } else {
    bookmarks.push(newBM);
  }

  save();
  render();
  form.reset();
}

window.editBookmark = function(id) {
  const bm = bookmarks.find(b => b.id === id);
  if (!bm) return;
  catInput.value = bm.category;
  emojiInput.value = bm.emoji;
  labelInput.value = bm.label;
  urlInput.value = bm.url;
  editId = id;
};

// 🔐 Ask password before deleting
window.requestDelete = function(id) {
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


