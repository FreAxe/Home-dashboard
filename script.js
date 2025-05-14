// Fil: script.js

let devices = JSON.parse(localStorage.getItem("devices")) || {};

function updateStatusUI(name) {
  const device = devices[name];
  const el = document.querySelector(`#device-${name.toLowerCase()} .status`);
  const icon = document.querySelector(`#lamp-icon-${name}`);
  const dimValue = document.getElementById(`dim-${name}`);
  const button = document.querySelector(`#device-${name.toLowerCase()} .toggle-button`);
  const range = document.querySelector(`#device-${name.toLowerCase()} input[type=range]`);

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
      if (range) range.value = level;
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

function animateDim(name, from, to, duration = 500) {
  const device = devices[name];
  const range = document.querySelector(`#device-${name.toLowerCase()} input[type=range]`);
  const label = document.getElementById(`dim-${name}`);
  const start = performance.now();

  function animate(now) {
    const progress = Math.min((now - start) / duration, 1);
    const current = Math.round(from + (to - from) * progress);
    if (range) {
      range.value = current;
      const hue = Math.round((current / 100) * 60); // from 0 (red) to 60 (yellow)
      range.style.background = `linear-gradient(to right, hsl(${hue}, 100%, 50%) ${current}%, #ccc ${current}%)`;
    }
    if (label) label.textContent = `${current}%`;
    device.dim = current;
    updateStatusUI(name);
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      saveDevices();
    }
  }

  requestAnimationFrame(animate);
}
    } else {
      saveDevices();
    }
  }

  requestAnimationFrame(animate);
}

function toggle(name) {
  const device = devices[name];
  if (device.type === "lamp") {
    if (device.mode === "dim") {
      const prevDim = device.dim || 50;
      if (device.status) {
        animateDim(name, prevDim, 0);
      } else {
        animateDim(name, 0, prevDim);
      }
    }
    device.status = !device.status;
    updateStatusUI(name);
    saveDevices();
  }
}

// ... resten av koden är oförändrad

applySavedTheme();
renderDevices();
