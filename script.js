const bases = {
  black: { name: "Black tea", icon: "◌", bottom: "#5a3429", description: "bold black tea" },
  green: { name: "Green tea", icon: "⌁", bottom: "#6e8051", description: "fresh green tea" },
  milk: { name: "Milk tea", icon: "☁", bottom: "#81543f", description: "smooth milk tea" }
};

const flavors = {
  brown: { name: "Brown sugar", icon: "✦", top: "#f3d9a7", middle: "#c18a53", accent: "#ad7147", title: "Brown Sugar Cloud", note: "caramel-like brown sugar" },
  mango: { name: "Mango", icon: "✺", top: "#ffe49c", middle: "#efaa4e", accent: "#e99639", title: "Mango Daydream", note: "sunny mango" },
  strawberry: { name: "Strawberry", icon: "♥", top: "#f6c6c3", middle: "#db8786", accent: "#d77983", title: "Strawberry Picnic", note: "sweet strawberry" },
  taro: { name: "Taro", icon: "✿", top: "#e6d9ee", middle: "#aa91bd", accent: "#9e83b0", title: "Taro Twilight", note: "soft, earthy taro" },
  matcha: { name: "Matcha", icon: "⌁", top: "#d7e1b1", middle: "#91a568", accent: "#71884f", title: "Matcha Meadow", note: "gentle matcha" }
};

const toppings = [
  { id: "pearls", name: "Tapioca pearls", icon: "●", kind: "pearl" },
  { id: "popping", name: "Popping boba", icon: "◉", kind: "popping" },
  { id: "jelly", name: "Crystal jelly", icon: "◇", kind: "jelly" },
  { id: "aloe", name: "Aloe cubes", icon: "▧", kind: "aloe" }
];

const defaultState = { base: "black", flavor: "brown", sweetness: 75, toppings: ["pearls"] };
let state = structuredClone(defaultState);
let toastTimer;

const $ = (selector) => document.querySelector(selector);
const baseChoices = $("#base-choices");
const flavorChoices = $("#flavor-choices");
const toppingChoices = $("#topping-choices");
const sweetnessInput = $("#sweetness");
const savedList = $("#saved-list");

function makeChoiceButtons(collection, options, activeId, onChoose) {
  collection.replaceChildren();
  Object.entries(options).forEach(([id, item]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-button" + (id === activeId ? " is-active" : "");
    button.setAttribute("aria-pressed", String(id === activeId));
    button.innerHTML = `<span class="choice-icon" aria-hidden="true">${item.icon}</span>${item.name}`;
    button.addEventListener("click", () => onChoose(id));
    collection.append(button);
  });
}

function renderToppings() {
  toppingChoices.replaceChildren();
  toppings.forEach((item) => {
    const label = document.createElement("label");
    label.className = "topping-option";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = item.id;
    checkbox.checked = state.toppings.includes(item.id);
    checkbox.addEventListener("change", () => {
      state.toppings = checkbox.checked
        ? [...state.toppings, item.id]
        : state.toppings.filter((id) => id !== item.id);
      render();
    });
    const glyph = document.createElement("span");
    glyph.className = "topping-glyph";
    glyph.setAttribute("aria-hidden", "true");
    glyph.textContent = item.icon;
    const name = document.createElement("span");
    name.textContent = item.name;
    label.append(checkbox, glyph, name);
    toppingChoices.append(label);
  });
}

function getRecipe() {
  const base = bases[state.base];
  const flavor = flavors[state.flavor];
  const toppingNames = state.toppings.map((id) => toppings.find((item) => item.id === id)?.name).filter(Boolean);
  const toppingText = toppingNames.length ? toppingNames.join(" and ").toLowerCase() : "no toppings";
  const sweetText = state.sweetness === 0 ? "barely sweet" : state.sweetness === 25 ? "lightly sweet" : state.sweetness === 50 ? "half-sweet" : state.sweetness === 75 ? "just-right sweetness" : "extra-sweet";
  return {
    base: state.base,
    flavor: state.flavor,
    sweetness: state.sweetness,
    toppings: [...state.toppings],
    name: flavor.title,
    description: `A ${base.description} sip with ${flavor.note}, ${toppingText}, and ${sweetText}.`,
    tags: [base.name, flavor.name, `${state.sweetness}% sweet`, ...toppingNames]
  };
}

function renderPearls() {
  const pearlContainer = $("#preview-pearls");
  pearlContainer.replaceChildren();
  const pearlKinds = state.toppings.flatMap((id) => {
    const topping = toppings.find((item) => item.id === id);
    const quantity = id === "pearls" ? 8 : 4;
    return topping ? Array.from({ length: quantity }, () => topping.kind) : [];
  });
  pearlKinds.forEach((kind) => {
    const pearl = document.createElement("i");
    pearl.className = `preview-pearl pearl-${kind}`;
    pearl.setAttribute("aria-hidden", "true");
    pearlContainer.append(pearl);
  });
}

function renderTags(recipe) {
  const target = $("#recipe-tags");
  target.replaceChildren();
  recipe.tags.forEach((tag) => {
    const badge = document.createElement("span");
    badge.className = "recipe-tag";
    badge.textContent = tag;
    target.append(badge);
  });
}

function render() {
  const base = bases[state.base];
  const flavor = flavors[state.flavor];
  const recipe = getRecipe();
  makeChoiceButtons(baseChoices, bases, state.base, (id) => { state.base = id; render(); });
  makeChoiceButtons(flavorChoices, flavors, state.flavor, (id) => { state.flavor = id; render(); });
  renderToppings();

  $("#base-current").textContent = base.name;
  $("#flavor-current").textContent = flavor.name;
  $("#sweetness-current").textContent = `${state.sweetness}%`;
  $("#topping-current").textContent = `${state.toppings.length} ${state.toppings.length === 1 ? "topping" : "toppings"}`;
  sweetnessInput.value = String(state.sweetness);
  sweetnessInput.style.setProperty("--range-progress", `${state.sweetness}%`);
  $("#cup-stage").style.setProperty("--drink-top", flavor.top);
  $("#cup-stage").style.setProperty("--drink-mid", flavor.middle);
  $("#cup-stage").style.setProperty("--drink-bottom", base.bottom);
  $("#cup-stage").style.setProperty("--accent", flavor.accent);
  $("#recipe-name").textContent = recipe.name;
  $("#recipe-description").textContent = recipe.description;
  renderTags(recipe);
  renderPearls();
  syncMoodButtons();
  syncSavedButton();
}

function syncMoodButtons() {
  document.querySelectorAll(".mood-chip").forEach((button) => button.classList.remove("is-active"));
}

function readSaved() {
  try {
    const parsed = JSON.parse(localStorage.getItem("boba-lab-recipes") || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSaved(items) {
  try {
    localStorage.setItem("boba-lab-recipes", JSON.stringify(items));
    return true;
  } catch {
    showToast("Your browser couldn't save this recipe.");
    return false;
  }
}

function signature(recipe) {
  return [recipe.base, recipe.flavor, recipe.sweetness, [...recipe.toppings].sort().join(",")].join("|");
}

function syncSavedButton() {
  const active = readSaved().some((item) => signature(item) === signature(getRecipe()));
  $("#save-button").classList.toggle("is-saved", active);
  $("#save-button").textContent = active ? "♥" : "♡";
  $("#save-button").setAttribute("aria-label", active ? "Recipe saved" : "Save this recipe");
}

function renderSaved() {
  const recipes = readSaved();
  savedList.replaceChildren();
  if (!recipes.length) {
    const empty = document.createElement("div");
    empty.className = "empty-notebook";
    empty.textContent = "Your notebook is waiting for a favorite. Tap the little heart on a recipe to save it.";
    savedList.append(empty);
    syncSavedButton();
    return;
  }
  recipes.forEach((recipe, index) => {
    const card = document.createElement("article");
    card.className = "saved-card";
    const copy = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = recipe.name;
    const details = document.createElement("p");
    details.textContent = `${bases[recipe.base]?.name || "Tea"} · ${flavors[recipe.flavor]?.name || "Flavor"} · ${recipe.sweetness}% sweet`;
    copy.append(title, details);
    const actions = document.createElement("div");
    actions.className = "saved-actions";
    const load = document.createElement("button");
    load.type = "button";
    load.textContent = "Mix it";
    load.addEventListener("click", () => {
      state = { base: recipe.base, flavor: recipe.flavor, sweetness: recipe.sweetness, toppings: [...recipe.toppings] };
      render();
      document.querySelector("#mixer").scrollIntoView({ behavior: "smooth" });
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.setAttribute("aria-label", `Remove ${recipe.name} from notebook`);
    remove.textContent = "×";
    remove.addEventListener("click", () => {
      const next = readSaved().filter((_, itemIndex) => itemIndex !== index);
      if (writeSaved(next)) { renderSaved(); syncSavedButton(); }
    });
    actions.append(load, remove);
    card.append(copy, actions);
    savedList.append(card);
  });
  syncSavedButton();
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2300);
}

function chooseMood(mood) {
  const presets = {
    cozy: { base: "black", flavor: "brown", sweetness: 75, toppings: ["pearls"] },
    sunny: { base: "green", flavor: "mango", sweetness: 50, toppings: ["popping", "jelly"] },
    dreamy: { base: "milk", flavor: "taro", sweetness: 50, toppings: ["pearls", "aloe"] }
  };
  state = structuredClone(presets[mood]);
  document.querySelectorAll(".mood-chip").forEach((button) => button.classList.toggle("is-active", button.dataset.mood === mood));
  render();
  document.querySelector(`.mood-chip[data-mood="${mood}"]`).classList.add("is-active");
}

function surpriseMe() {
  const baseIds = Object.keys(bases);
  const flavorIds = Object.keys(flavors);
  const toppingIds = toppings.map((item) => item.id);
  state = {
    base: baseIds[Math.floor(Math.random() * baseIds.length)],
    flavor: flavorIds[Math.floor(Math.random() * flavorIds.length)],
    sweetness: [25, 50, 75, 100][Math.floor(Math.random() * 4)],
    toppings: toppingIds.filter(() => Math.random() > 0.52)
  };
  syncMoodButtons();
  render();
  showToast("A fresh little mix, just for you ✳");
}

async function copyRecipe() {
  const recipe = getRecipe();
  const text = `${recipe.name}\n${recipe.description}\n\nMade in Boba Lab`;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const field = document.createElement("textarea");
    field.value = text;
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    document.execCommand("copy");
    field.remove();
  }
  $("#copy-feedback").textContent = "Recipe copied to clipboard!";
  window.setTimeout(() => { $("#copy-feedback").textContent = ""; }, 2500);
}

baseChoices.addEventListener("click", (event) => {
  if (!event.target.closest("button")) return;
  syncMoodButtons();
});
flavorChoices.addEventListener("click", (event) => {
  if (!event.target.closest("button")) return;
  syncMoodButtons();
});
sweetnessInput.addEventListener("input", () => {
  state.sweetness = Number(sweetnessInput.value);
  syncMoodButtons();
  render();
});
document.querySelectorAll(".mood-chip").forEach((button) => button.addEventListener("click", () => chooseMood(button.dataset.mood)));
$("#surprise-button").addEventListener("click", surpriseMe);
$("#reset-button").addEventListener("click", () => {
  state = structuredClone(defaultState);
  syncMoodButtons();
  render();
  showToast("Back to the first sip.");
});
$("#save-button").addEventListener("click", () => {
  const recipe = getRecipe();
  const items = readSaved();
  const index = items.findIndex((item) => signature(item) === signature(recipe));
  if (index >= 0) items.splice(index, 1);
  else items.unshift(recipe);
  if (writeSaved(items)) {
    renderSaved();
    showToast(index >= 0 ? "Removed from your notebook." : "Saved to your notebook ♥");
  }
});
$("#copy-button").addEventListener("click", copyRecipe);

render();
renderSaved();
