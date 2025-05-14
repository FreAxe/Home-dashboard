const devices = {
  "Vardagsrum": { status: false },
  "Kök": { status: false }
};

function updateStatusUI(name) {
  const device = devices[name];
  const el = document.querySelector(`#device-${name.toLowerCase()} .status`);
  el.innerText = device.status ? "På" : "Av";
}

function toggle(name) {
  devices[name].status = !devices[name].status;
  updateStatusUI(name);
}

Object.keys(devices).forEach(updateStatusUI);
