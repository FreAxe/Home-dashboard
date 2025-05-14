let devices = JSON.parse(localStorage.getItem("devices")) || {};

function updateStatusUI(name) {
  const device = devices[name];
  const el = document.querySelector(`#device-${name.toLowerCase()} .status`);
  if (el && device.type === "lamp") el.innerText = device.status ? "På" : "Av";
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
        controlHTML = `
          <input type='range' min='0' max='100' value='${dev.dim || 50}' onchange='setDimValue("${name}", this.value)'/>
          <div class="dim-value" id="dim-${name}">${dev.dim || 50}%</div>
        `;
      } else {
        controlHTML = `<button onclick="toggle('${name}')">Tänd/Släck</button>`;
      }
      div.innerHTML = `
        <h2>${name}</h2>
        <p>Status: <span class="status">${dev.status ? "På" : "Av"}</span></p>
        ${controlHTML}<br>
        <button onclick="removeDevice('${name}')" class="danger">Ta bort</button>
      `;
    }
    container.appendChild(div);
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
  devices[name].dim = parseInt(value);
  const label = document.getElementById(`dim-${name}`);
  if (label) label.textContent = `${value}%`;
  saveDevices();
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
}

function applySavedTheme() {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") {
    document.body.classList.add("dark");
  }
}

applySavedTheme();
renderDevices();
