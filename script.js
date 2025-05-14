<!-- script.js -->
<script>
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

function showAddForm() {
  document.getElementById("add-form").style.display = "block";
}

function addDevice() {
  const nameInput = document.getElementById("new-device-name");
  const name = nameInput.value.trim();
  if (!name || devices[name]) return;

  devices[name] = { status: false };

  const container = document.getElementById("devices-container");
  const div = document.createElement("div");
  div.className = "device";
  div.id = `device-${name.toLowerCase()}`;
  div.innerHTML = `
    <h2>${name}</h2>
    <p>Status: <span class="status">Okänd</span></p>
    <button onclick="toggle('${name}')">Tänd/Släck</button>
  `;
  container.appendChild(div);
  updateStatusUI(name);
  nameInput.value = "";
  document.getElementById("add-form").style.display = "none";
}
</script>
