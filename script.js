// SECTION: Date display
const todayDateEl = document.getElementById("today-date");
if (todayDateEl) {
  const now = new Date();
  const formatted = now.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  todayDateEl.textContent = formatted;
}

// SECTION: Checkmark persistence
const STORAGE_KEY = "dog-med-tracker-v1";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch (e) {
    console.warn("Could not load medication state", e);
    return {};
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Could not save medication state", e);
  }
}

// Map of med-id + day + dose-id -> checked (boolean)
let medState = loadState();

function makeKey(medId, dayIndex, doseId) {
  return `${medId}__day-${dayIndex}__dose-${doseId}`;
}

function handleCheckboxChange(key, checkbox) {
  medState[key] = checkbox.checked;
  saveState(medState);
}

const MEDS = [
  {
    id: "oflox",
    name: "Oflox",
    posologia: "1 gota no olho esquerdo",
    frequencia: "4x/dia",
    duracao: 15,
    dosesPorDia: 4,
    firstDayStart: "19:00",
  },
  {
    id: "nevanac",
    name: "Nevanac",
    posologia: "1 gota no olho esquerdo",
    frequencia: "2x/dia",
    duracao: 15,
    dosesPorDia: 2,
    firstDayStart: "19:05",
  },
  {
    id: "azorga",
    name: "Azorga",
    posologia: "1 gota no olho esquerdo",
    frequencia: "De 8/8 horas",
    duracao: 15,
    dosesPorDia: 3,
    firstDayStart: "22:00",
  },
  {
    id: "viofta",
    name: "Viofta",
    posologia: "1 gota em cada olho",
    frequencia: "2x/dia",
    duracao: 15,
    dosesPorDia: 2,
    firstDayStart: "19:10",
  },
];

const TOTAL_DAYS = 15;

const viewSelect = document.getElementById("view-select");
const tableBody = document.getElementById("med-table-body");
const dosesHeader = document.getElementById("doses-header");
const viewDescription = document.getElementById("view-description");

function formatTimeLabel(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function addMinutesToTime(baseTime, minutesToAdd) {
  const [hours, minutes] = baseTime.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes + minutesToAdd, 0, 0);
  return date;
}

function renderTable(view) {
  if (!tableBody) return;
  tableBody.innerHTML = "";

  const today = new Date();

  for (let dayIndex = 0; dayIndex < TOTAL_DAYS; dayIndex++) {
    if (view === "today" && dayIndex !== 0) continue;

    const date = new Date(today);
    date.setDate(today.getDate() + dayIndex);
    const dayLabel = date.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "2-digit",
    });

    for (let medIndex = 0; medIndex < MEDS.length; medIndex++) {
      const med = MEDS[medIndex];
      const row = document.createElement("tr");
      row.setAttribute("data-med-id", med.id);
      row.setAttribute("data-day-index", String(dayIndex));

      row.innerHTML = `
        <td>${dayLabel}</td>
        <th scope="row">
          ${med.name}
          <span class="pill-tag pill-tag--eye">Tópico</span>
        </th>
        <td>${med.posologia}</td>
        <td>${med.frequencia}</td>
        <td>${
          med.duracao === 15
            ? "15 dias"
            : med.duracao === Infinity
            ? "Contínuo"
            : med.duracao + " dias"
        }</td>
        <td class="cell-check cell-check--multi"></td>
      `;

      const cellCheck = row.querySelector(".cell-check");
      if (cellCheck) {
        for (let dose = 1; dose <= med.dosesPorDia; dose++) {
          const currentDose = dose;
          const label = document.createElement("label");
          label.className = "check-pill";

          const input = document.createElement("input");
          input.type = "checkbox";
          input.className = "check-pill__input";
          input.setAttribute("data-dose-id", String(currentDose));

          let timeLabel = "";
          if (dayIndex === 0 && med.firstDayStart) {
            const minutesOffset = (currentDose - 1) * 5;
            const dateForDose = addMinutesToTime(
              med.firstDayStart,
              minutesOffset
            );
            timeLabel = formatTimeLabel(dateForDose);
            input.setAttribute(
              "aria-label",
              `${med.name} dose ${currentDose} aplicada no dia ${dayLabel} às ${timeLabel}`
            );
          } else {
            input.setAttribute(
              "aria-label",
              `${med.name} dose ${currentDose} aplicada no dia ${dayLabel}`
            );
          }

          const key = makeKey(med.id, dayIndex, currentDose);
          input.checked = Boolean(medState[key]);

          input.addEventListener(
            "change",
            handleCheckboxChange.bind(null, key, input)
          );

          const span = document.createElement("span");
          span.className = "check-pill__visual";

          if (timeLabel) {
            const timeSpan = document.createElement("span");
            timeSpan.className = "check-pill__time";
            timeSpan.textContent = timeLabel;
            span.appendChild(timeSpan);
          }

          label.appendChild(input);
          label.appendChild(span);
          cellCheck.appendChild(label);
        }
      }

      tableBody.appendChild(row);
    }
  }
}

function updateView(view) {
  if (dosesHeader) {
    dosesHeader.textContent =
      view === "today" ? "Doses de hoje" : "Doses do dia";
  }
  if (viewDescription) {
    viewDescription.innerHTML =
      view === "today"
        ? "Exibindo as doses de <strong>hoje</strong> com horários sugeridos e intervalo de 5 minutos entre medicações. Clique nos quadrados à direita após administrar a medicação."
        : "Exibindo a <strong>programação completa de 15 dias</strong>. As doses do primeiro dia mostram horários sugeridos com intervalo de 5 minutos entre medicações.";
  }
  renderTable(view);
}

const clearTodayBtn = document.getElementById("clear-today");
if (clearTodayBtn) {
  clearTodayBtn.addEventListener("click", () => {
    const currentView = viewSelect ? viewSelect.value : "today";

    if (!tableBody) return;

    const rows = tableBody.querySelectorAll("tr");
    rows.forEach((row) => {
      const medId = row.getAttribute("data-med-id");
      const dayIndexAttr = row.getAttribute("data-day-index");
      if (!medId || dayIndexAttr === null) return;
      const dayIndex = Number(dayIndexAttr);

      if (currentView === "today" && dayIndex !== 0) return;

      const checkboxes = row.querySelectorAll(".check-pill__input");
      checkboxes.forEach((checkbox) => {
        const doseIdAttr = checkbox.getAttribute("data-dose-id");
        if (!doseIdAttr) return;
        const doseId = Number(doseIdAttr);
        const key = makeKey(medId, dayIndex, doseId);
        checkbox.checked = false;
        medState[key] = false;
      });
    });

    saveState(medState);
  });
}

// Print full 15-day schedule
const printBtn = document.getElementById("print-schedule");
if (printBtn) {
  printBtn.addEventListener("click", () => {
    if (viewSelect) {
      viewSelect.value = "all";
      updateView("all");
    }
    window.print();
  });
}

const initialView = viewSelect ? viewSelect.value : "today";
updateView(initialView);

if (viewSelect) {
  viewSelect.addEventListener("change", () => {
    const view = viewSelect.value;
    updateView(view);
  });
}
