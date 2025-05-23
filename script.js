console.log("script.js är laddad");

let devices = JSON.parse(localStorage.getItem("devices")) || {};
let order = JSON.parse(localStorage.getItem("deviceOrder")) || [];

function saveDevices() {
  localStorage.setItem("devices", JSON.stringify(devices));
  localStorage.setItem("deviceOrder", JSON.stringify(order));
}

function updateStatusUI(name) {
  const device = devices[name];
  const el = document.querySelector(`#device-${name.toLowerCase()} .status`);
  if (!el) return;

  if (device.type === "lamp") {
    const isOn = device.status;
    el.innerText = isOn ? "På" : "Av";

    const btn = document.querySelector(`#device-${name.toLowerCase()} .toggle-btn`);
    if (btn) btn.innerText = isOn ? "Släck" : "Tänd";

    const icon = document.querySelector(`#lamp-icon-${name}`);
    if (icon) {
      if (isOn) {
        icon.classList.add("lamp-on", "lamp-glow");
        icon.style.textShadow = device.mode === "dim"
          ? `0 0 ${device.dim / 10}px rgba(255, 223, 70, ${device.dim / 100})`
          : `0 0 5px rgba(255, 223, 70, 0.8)`;
      } else {
        icon.classList.remove("lamp-on", "lamp-glow");
        icon.style.textShadow = "";
      }
    }
  }
}

function setDimValue(name, value, updateSlider = true) {
  const device = devices[name];
  value = parseInt(value);

  if (device) {
    device.dim = value;

    const label = document.getElementById(`dim-${name}`);
    if (label) label.textContent = `${value}%`;

    const icon = document.querySelector(`#lamp-icon-${name}`);
    if (icon) {
      if (value > 0) {
        icon.classList.add("lamp-on", "lamp-glow");
        icon.style.textShadow = `0 0 ${value / 10}px rgba(255, 223, 70, ${value / 100})`;
      } else {
        icon.classList.remove("lamp-on", "lamp-glow");
        icon.style.textShadow = "";
      }
    }

    device.status = value > 0;
    updateStatusUI(name);
    saveDevices();
  }

  if (updateSlider) {
    const slider = document.querySelector(`#device-${name.toLowerCase()} input[type=range]`);
    if (slider) slider.value = value;
  }
}

function animateDim(name, from, to, duration = 500) {
  const start = performance.now();
  function animate(time) {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    const current = Math.round(from + (to - from) * progress);
    setDimValue(name, current, true);
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }
  requestAnimationFrame(animate);
}

function toggle(name) {
  const device = devices[name];
  if (!device || device.type !== "lamp") return;

  if (device.mode === "dim") {
    if (device.status) {
      device.lastDim = device.dim;
      animateDim(name, device.dim, 0);
    } else {
      animateDim(name, 0, device.lastDim || 50);
    }
  } else if (device.mode === "toggle") {
    device.status = !device.status;
    updateStatusUI(name);
    saveDevices();
  }
}

function removeDevice(name) {
  delete devices[name];
  order = order.filter(n => n !== name);
  saveDevices();
  renderDevices();
}

function renderDevices() {
  const container = document.getElementById("devices-container");
  container.innerHTML = "";

  const sorted = order.filter(name => devices[name]);

  sorted.forEach(name => {
    const dev = devices[name];
    const div = document.createElement("div");
    div.className = "device";
    div.id = `device-${name.toLowerCase()}`;
    div.setAttribute("draggable", true);

    div.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", name);
    });

    div.addEventListener("dragover", e => {
      e.preventDefault();
      div.classList.add("drag-over");
    });

    div.addEventListener("dragleave", () => {
      div.classList.remove("drag-over");
    });

    div.addEventListener("drop", e => {
      e.preventDefault();
      const draggedName = e.dataTransfer.getData("text/plain");
      const fromIndex = order.indexOf(draggedName);
      const toIndex = order.indexOf(name);
      if (fromIndex > -1 && toIndex > -1 && fromIndex !== toIndex) {
        order.splice(fromIndex, 1);
        order.splice(toIndex, 0, draggedName);
        saveDevices();
        renderDevices();
      }
    });

    if (dev.type === "sensor") {
      div.innerHTML = `
        <h2>${name}</h2>
        <p><strong>Temperatur:</strong> <span class="status">0.0 °C</span></p>
        <button onclick="removeDevice('${name}')" class="danger">Ta bort</button>
      `;
    } else if (dev.type === "lamp") {
      const icon = `<span id="lamp-icon-${name}" class="lamp-icon">💡</span>`;
      let controlHTML = "";

      if (dev.mode === "dim") {
        controlHTML = `
          <div class="dim-value" id="dim-${name}">${dev.dim || 50}%</div>
          <input type="range" id="slider-${name}" min="0" max="100" value="${dev.dim || 50}"
            oninput="setDimValue('${name}', this.value)" />
          <button onclick="toggle('${name}')" class="toggle-btn">${dev.status ? "Släck" : "Tänd"}</button>
        `;
      } else if (dev.mode === "toggle") {
        controlHTML = `
          <button onclick="toggle('${name}')" class="toggle-btn">${dev.status ? "Släck" : "Tänd"}</button>
        `;
      }

      div.innerHTML = `
        <h2>${name}</h2>
        <p>Status: <span class="status">${dev.status ? "På" : "Av"}</span> ${icon}</p>
        ${controlHTML}
        <br />
        <button onclick="removeDevice('${name}')" class="danger">Ta bort</button>
      `;

      const slider = div.querySelector(`#slider-${name}`);
      if (slider) {
        slider.addEventListener("mousedown", () => div.setAttribute("draggable", false));
        slider.addEventListener("mouseup", () => div.setAttribute("draggable", true));
        slider.addEventListener("touchstart", () => div.setAttribute("draggable", false));
        slider.addEventListener("touchend", () => div.setAttribute("draggable", true));
      }
    }

    container.appendChild(div);
    updateStatusUI(name);
  });
}

function showAddForm() {
  document.getElementById("popup").style.display = "flex";
  document.getElementById("popup-error").textContent = "";
  document.getElementById("popup").classList.toggle("dark", document.body.classList.contains("dark"));
  updateFormOptions();
}

function updateFormOptions() {
  const type = document.getElementById("device-type").value;
  document.getElementById("lamp-options").style.display = type === "lamp" ? "block" : "none";
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
}

function addDevice() {
  const nameInput = document.getElementById("new-device-name");
  const typeSelect = document.getElementById("device-type");
  const lampMode = document.getElementById("lamp-mode");
  const name = nameInput.value.trim();
  const type = typeSelect.value;
  const error = document.getElementById("popup-error");

  if (!name) {
    error.textContent = "Du måste ange ett namn.";
    return;
  }

  if (devices[name]) {
    error.textContent = `Enheten "${name}" finns redan.`;
    return;
  }

  const newDevice = { type };
  if (type === "lamp") {
    newDevice.status = false;
    newDevice.mode = lampMode.value;
    if (lampMode.value === "dim") {
      newDevice.dim = 50;
      newDevice.lastDim = 50;
    }
  }

  devices[name] = newDevice;
  order.push(name);
  saveDevices();
  renderDevices();
  nameInput.value = "";
  closePopup();
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
}

function applySavedTheme() {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") {
    document.body.classList.add("dark");
  }
}

function removeHiddenDevices() {
  let hiddenCount = 0;

  for (const name in devices) {
    if (!order.includes(name)) {
      delete devices[name];
      hiddenCount++;
    }
  }

  saveDevices();
  renderDevices();

  alert(`🧼 Rensade ${hiddenCount} dold(a) enhet(er).`);
}

function toggleMenu() {
  document.querySelector('.sidebar').classList.toggle('open');
}

function showView(view) {
  document.querySelectorAll('.dashboard-view').forEach(el => el.style.display = 'none');
  document.getElementById(`${view}-view`).style.display = 'block';
}

applySavedTheme();
renderDevices();
