const PRODUCTS = {
  apple: { name: "Apple", emoji: "🍏" },
  banana: { name: "Banana", emoji: "🍌" },
  lemon: { name: "Lemon", emoji: "🍋" },
};

function getBasket() {
  try {
    const basket = localStorage.getItem("basket");
    if (!basket) return [];
    const parsed = JSON.parse(basket);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Error parsing basket from localStorage:", error);
    return [];
  }
}

function addToBasket(product) {
  const basket = getBasket();
  basket.push(product);
  localStorage.setItem("basket", JSON.stringify(basket));
}

function clearBasket() {
  localStorage.removeItem("basket");
}

function renderBasket() {
  const basket = getBasket();
  const basketList = document.getElementById("basketList");
  const cartButtonsRow = document.querySelector(".cart-buttons-row");
  if (!basketList) return;
  basketList.innerHTML = "";
  if (basket.length === 0) {
    basketList.innerHTML = "<li>No products in basket.</li>";
    if (cartButtonsRow) cartButtonsRow.style.display = "none";
    // remove smoothie controls when empty
    const smoothieContainerEmpty = document.getElementById("smoothieOption");
    if (smoothieContainerEmpty) smoothieContainerEmpty.innerHTML = "";
    return;
  }
  basket.forEach((product) => {
    const item = PRODUCTS[product];
    if (item) {
      const li = document.createElement("li");
      li.innerHTML = `<span class='basket-emoji'>${item.emoji}</span> <span>${item.name}</span>`;
      basketList.appendChild(li);
    }
  });
  if (cartButtonsRow) cartButtonsRow.style.display = "flex";
}

function getSmoothieFlavor(basket) {
  const unique = Array.from(new Set(basket));
  if (unique.length === 0) return { label: "No fruits selected", emoji: "" };
  if (unique.length === 1) {
    const key = unique[0];
    const p = PRODUCTS[key];
    if (p) return { label: `${p.name} Smoothie`, emoji: p.emoji };
  }
  // multiple fruits -> blended
  const names = unique.map((k) => (PRODUCTS[k] ? PRODUCTS[k].name : k));
  const emojis = unique.map((k) => (PRODUCTS[k] ? PRODUCTS[k].emoji : ""));
  return { label: `Mixed Smoothie: ${names.join(" + ")}`, emoji: emojis.join("") };
}

function renderSmoothieOption() {
  const container = document.getElementById("smoothieOption");
  if (!container) return;
  const basket = getBasket();
  container.innerHTML = "";
  const checkboxId = "blendSmoothie";

  const wrapper = document.createElement("div");
  wrapper.className = "smoothie-wrapper";

  const label = document.createElement("label");
  label.setAttribute("for", checkboxId);
  label.textContent = "Blend to smoothie";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = checkboxId;
  checkbox.name = checkboxId;

  const preview = document.createElement("div");
  preview.id = "smoothiePreview";
  preview.className = "smoothie-preview";
  preview.style.marginTop = "8px";

  function updatePreview() {
    if (!checkbox.checked) {
      preview.textContent = "";
      return;
    }
    const flavor = getSmoothieFlavor(basket);
    preview.textContent = `${flavor.emoji} ${flavor.label}`;
  }

  checkbox.addEventListener("change", updatePreview);

  // initial preview (unchecked by default)
  wrapper.appendChild(checkbox);
  wrapper.appendChild(label);
  wrapper.appendChild(preview);
  container.appendChild(wrapper);

  // expose flavor preview update when basket changes externally
  updatePreview();
}

function renderBasketIndicator() {
  const basket = getBasket();
  let indicator = document.querySelector(".basket-indicator");
  if (!indicator) {
    const basketLink = document.querySelector(".basket-link");
    if (!basketLink) return;
    indicator = document.createElement("span");
    indicator.className = "basket-indicator";
    basketLink.appendChild(indicator);
  }
  if (basket.length > 0) {
    indicator.textContent = basket.length;
    indicator.style.display = "flex";
  } else {
    indicator.style.display = "none";
  }
}

// Call this on page load and after basket changes
if (document.readyState !== "loading") {
  renderBasketIndicator();
} else {
  document.addEventListener("DOMContentLoaded", renderBasketIndicator);
}

// ensure smoothie option is rendered too
if (document.readyState !== "loading") {
  renderSmoothieOption();
} else {
  document.addEventListener("DOMContentLoaded", renderSmoothieOption);
}

// Patch basket functions to update indicator
const origAddToBasket = window.addToBasket;
window.addToBasket = function (product) {
  origAddToBasket(product);
  renderBasketIndicator();
  renderBasket();
  renderSmoothieOption();
};
const origClearBasket = window.clearBasket;
window.clearBasket = function () {
  origClearBasket();
  renderBasketIndicator();
  renderBasket();
  renderSmoothieOption();
};
