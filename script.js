// Fil: script.js

let devices = JSON.parse(localStorage.getItem("devices")) || {};

function updateStatusUI(name) {
  const device = devices[name];
  const el = document.querySelector(`#device-${name.toLowerCase()} .status`);
  const icon = document.querySelector(`#lamp-icon-${name}`);
  const dimValue = document.getElementById(`dim-${name}`);
  const button = document.querySelector(`#device-${name.toLowerCase()} .toggle-button`);

  if (el && device.type === "lamp") {
    if (device.mode === "dim") {
      const level = device.status ? device.dim || 0 : 0;
      el.innerText = level > 0 ? "På" : "Av";
      if (icon) {
        icon.classList.toggle("lamp-on", level > 0);
        icon.classList.add("lamp-glow");
        icon.style.textShadow = `0 0 ${Math.round(level / 10)}px rgba(255, 223, 70, ${Math.min(level / 100, 1)})`;
      }
      if (dimValue) dimValue.textContent = `${level}%`;
      if (button) button.textContent = level > 0 ? "Släck" : "Tänd";
    } else {
      el.innerText = device.status ? "På" : "Av";
      if (icon) {
        icon.classList.toggle("lamp-on", device.status);
        icon.classList.remove("lamp-glow");
        icon.style.textShadow = "none";
      }
      if (button) button.textContent = device.status ? "Släck" : "Tänd";
    }
  }
}

function toggle(name) {
  const device = devices[name];
  if (device.type === "lamp") {
    device.status = !device.status;
    updateStatusUI(name);
    saveDevices();
  }
}

function renderDevices() {
  const container = document.getElementById("devices-container");
  container.innerHTML = "";
  Object.keys(devices).forEach(name => {
    const dev = devices[name];
    const div = document.createElement("div");
    div.className = "device";
    div.id = `device-${name.toLowerCase()}`;

    if (dev.type === "sensor") {
      div.innerHTML = `
        <h2>${name}</h2>
        <p><strong>Temperatur:</strong> <span class="status">0.0 °C</span></p>
        <button onclick="removeDevice('${name}')" class="danger">Ta bort</button>
      `;
    } else if (dev.type === "lamp") {
      let controlHTML = "";
      if (dev.mode === "dim") {
        const value = dev.status ? dev.dim || 50 : 0;
        controlHTML = `
          <div class="dim-value" id="dim-${name}">${value}%</div>
          <input type='range' min='0' max='100' value='${value}' oninput='setDimValue("${name}", this.value)'/>
          <button class="toggle-button" onclick='toggle("${name}")'>${value > 0 ? "Släck" : "Tänd"}</button>
        `;
      } else {
        controlHTML = `<button class="toggle-button" onclick="toggle('${name}')">${dev.status ? "Släck" : "Tänd"}</button>`;
      }
      div.innerHTML = `
        <h2>${name}</h2>
        <p>
          Status: <span class="status">${dev.status ? "På" : "Av"}</span>
          <span id="lamp-icon-${name}" class="lamp-icon">💡</span>
        </p>
        ${controlHTML}<br>
        <button onclick="removeDevice('${name}')" class="danger">Ta bort</button>
      `;
    }
    container.appendChild(div);
    updateStatusUI(name);
  });
}

function showAddForm() {
  document.getElementById("popup").style.display = "block";
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

  if (!name || devices[name]) return;

  const newDevice = { type };
  if (type === "lamp") {
    newDevice.status = false;
    newDevice.mode = lampMode.value;
    if (lampMode.value === "dim") {
      newDevice.dim = 50;
    }
  }

  devices[name] = newDevice;
  saveDevices();
  renderDevices();
  nameInput.value = "";
  closePopup();
}

function setDimValue(name, value) {
  const device = devices[name];
  device.dim = parseInt(value);
  const label = document.getElementById(`dim-${name}`);
  if (label) label.textContent = `${value}%`;

  if (device.type === "lamp" && device.mode === "dim") {
    if (!device.status && parseInt(value) > 0) {
      device.status = true;
    }
    updateStatusUI(name);
    saveDevices();
  }
}

function removeDevice(name) {
  delete devices[name];
  saveDevices();
  renderDevices();
}

function saveDevices() {
  localStorage.setItem("devices", JSON.stringify(devices));
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");

  const popup = document.getElementById("popup");
  if (document.body.classList.contains("dark")) {
    popup.classList.add("dark");
  } else {
    popup.classList.remove("dark");
  }
}

function applySavedTheme() {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") {
    document.body.classList.add("dark");
    const popup = document.getElementById("popup");
    popup.classList.add("dark");
  }
}

applySavedTheme();
renderDevices();
