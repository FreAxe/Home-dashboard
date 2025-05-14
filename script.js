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
        <button onclick="removeDevice('${name}')" style="background:#ef4444; margin-top:0.5rem;">Ta bort</button>
      `;
    } else if (dev.type === "lamp") {
      let controlButton = dev.mode === "dim" ? "<input type='range' min='0' max='100' value='50' onchange='setDimValue(\"" + name + "\", this.value)'/>" : `<button onclick="toggle('${name}')">Tänd/Släck</button>`;
      div.innerHTML = `
        <h2>${name}</h2>
        <p>Status: <span class="status">${dev.status ? "På" : "Av"}</span></p>
        ${controlButton}<br>
        <button onclick="removeDevice('${name}')" style="background:#ef4444; margin-top:0.5rem;">Ta bort</button>
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
  }

  devices[name] = newDevice;
  saveDevices();
  renderDevices();
  nameInput.value = "";
  closePopup();
}

function setDimValue(name, value) {
  console.log(`Dimvärde för ${name}: ${value}%`);
}

function removeDevice(name) {
  delete devices[name];
  saveDevices();
  renderDevices();
}

function saveDevices() {
  localStorage.setItem("devices", JSON.stringify(devices));
}

renderDevices();
