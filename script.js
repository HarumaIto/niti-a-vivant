// 人物名・所属・役割・画像パスは people.json にまとめています。
let people = [];

const introScreen = document.getElementById("intro-screen");
const profileScreen = document.getElementById("profile-screen");
const thumbnailList = document.getElementById("thumbnail-list");
const profileDetail = document.getElementById("profile-detail");
const detailImage = document.getElementById("detail-image");
const detailName = document.getElementById("detail-name");
const detailNameEn = document.getElementById("detail-name-en");
const detailAffiliation = document.getElementById("detail-affiliation");
const detailIndex = document.getElementById("detail-index");
const profileCounter = document.getElementById("profile-counter");
const enterButton = document.getElementById("enter-button");
const backButton = document.getElementById("back-button");
const loadStatus = document.getElementById("load-status");
const pageTabs = [...document.querySelectorAll(".page-tab")];
const charactersTab = document.getElementById("tab-characters");

function numberLabel(number) {
  return String(number).padStart(2, "0");
}

function fallbackImage(number) {
  const label = numberLabel(number);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#3d131b"/><stop offset="1" stop-color="#100e0f"/></linearGradient></defs><rect width="600" height="800" fill="url(#g)"/><circle cx="300" cy="268" r="100" fill="#71545a"/><path d="M85 800c5-195 85-335 215-335S510 605 515 800" fill="#71545a"/><text x="300" y="745" text-anchor="middle" fill="#be606a" font-family="Georgia" font-size="72" letter-spacing="12">${label}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function makeImage(src, alt, number, className) {
  const image = document.createElement("img");
  image.className = className;
  image.src = src;
  image.alt = alt;
  image.decoding = "async";
  image.addEventListener("error", () => {
    if (!image.dataset.fallback) {
      image.dataset.fallback = "true";
      image.src = fallbackImage(number);
    }
  });
  return image;
}

function renderRoster() {
  const fragment = document.createDocumentFragment();
  people.forEach((person, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "thumbnail";
    button.dataset.id = String(person.id);
    button.setAttribute("aria-label", `${person.name}のプロフィールを表示`);
    button.setAttribute("aria-pressed", "false");

    const meta = document.createElement("span");
    meta.className = "thumbnail__meta";
    const number = document.createElement("span");
    number.className = "thumbnail__number";
    number.textContent = numberLabel(index + 1);
    const name = document.createElement("span");
    name.className = "thumbnail__name";
    name.textContent = person.name;
    meta.append(number, name);

    button.append(makeImage(person.imageThumb, "", index + 1, "thumbnail__image"), meta);
    fragment.append(button);
  });
  thumbnailList.replaceChildren(fragment);
  if (people.length === 0) {
    const message = document.createElement("p");
    message.className = "thumbnail-list__empty";
    message.textContent = "人物データがありません。";
    thumbnailList.append(message);
  }
}

function selectPerson(id, animate = true) {
  const index = people.findIndex((person) => String(person.id) === String(id));
  if (index < 0) return;
  const person = people[index];

  delete detailImage.dataset.fallback;
  detailImage.src = person.imageLarge;
  detailImage.alt = `${person.name}のポートレート`;
  detailName.textContent = person.name;
  detailNameEn.textContent = person.nameEn;
  detailAffiliation.textContent = `${person.affiliation}　${person.role}`;
  detailIndex.textContent = `PROFILE ${numberLabel(index + 1)}`;
  profileCounter.textContent = `${numberLabel(index + 1)} / ${numberLabel(people.length)}`;

  thumbnailList.querySelectorAll(".thumbnail").forEach((button) => {
    const active = button.dataset.id === String(person.id);
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  if (animate) {
    profileDetail.classList.remove("is-changing");
    void profileDetail.offsetWidth;
    profileDetail.classList.add("is-changing");
  }
}

detailImage.addEventListener("error", () => {
  if (!detailImage.dataset.fallback) {
    detailImage.dataset.fallback = "true";
    const index = people.findIndex((person) => person.name === detailName.textContent);
    detailImage.src = fallbackImage(index + 1);
  }
});

function showScreen(screen) {
  const showingProfiles = screen === "profiles";
  introScreen.classList.toggle("is-active", !showingProfiles);
  profileScreen.classList.toggle("is-active", showingProfiles);
  introScreen.inert = showingProfiles;
  profileScreen.inert = !showingProfiles;
  introScreen.setAttribute("aria-hidden", String(showingProfiles));
  profileScreen.setAttribute("aria-hidden", String(!showingProfiles));

  const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 650;
  window.setTimeout(() => {
    if (showingProfiles && profileScreen.classList.contains("is-active")) detailName.focus({ preventScroll: true });
    if (!showingProfiles && introScreen.classList.contains("is-active")) enterButton.focus({ preventScroll: true });
  }, delay);
}

thumbnailList.addEventListener("click", (event) => {
  const button = event.target.closest(".thumbnail");
  if (button && thumbnailList.contains(button)) selectPerson(button.dataset.id);
});

function selectTab(selectedTab) {
  pageTabs.forEach((tab) => {
    const active = tab === selectedTab;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
    document.getElementById(tab.getAttribute("aria-controls")).hidden = !active;
  });
  profileCounter.style.visibility = selectedTab === charactersTab ? "" : "hidden";
}

pageTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectTab(tab));
  tab.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const step = event.key === "ArrowRight" ? 1 : -1;
    const nextTab = pageTabs[(index + step + pageTabs.length) % pageTabs.length];
    selectTab(nextTab);
    nextTab.focus();
  });
});

enterButton.addEventListener("click", () => {
  selectTab(charactersTab);
  showScreen("profiles");
});
backButton.addEventListener("click", () => showScreen("intro"));

async function loadPeople() {
  try {
    const response = await fetch("people.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("people.json must contain an array");
    const ids = new Set();
    for (const person of data) {
      if (!person || !["id", "name", "nameEn", "affiliation", "role", "imageThumb", "imageLarge"].every((key) => key in person)) {
        throw new Error("A profile is missing a required field");
      }
      if (ids.has(String(person.id))) throw new Error("Profile IDs must be unique");
      ids.add(String(person.id));
    }
    people = data;
    renderRoster();
    if (people.length > 0) {
      selectPerson(people[0].id, false);
      enterButton.disabled = false;
    } else {
      loadStatus.textContent = "人物データがありません。people.json に追加してください。";
      loadStatus.hidden = false;
    }
  } catch (error) {
    console.error("人物データの読み込みに失敗しました:", error);
    loadStatus.textContent = "people.json を読み込めません。ローカルサーバーから開いてください。";
    loadStatus.hidden = false;
  }
}

loadPeople();
