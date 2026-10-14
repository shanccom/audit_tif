// ═══════════════════════════════════════════════════════════
// PIMS Agent UI — 3-Column Layout JavaScript
// Agente de Controles ISO/IEC 27701:2025 · UNSA
// ═══════════════════════════════════════════════════════════

const API_BASE = (window.location.protocol === "file:" || !window.location.port)
  ? "http://127.0.0.1:5000"
  : "";

// ── Catálogo oficial ──────────────────────────────────────
const CATALOGO_BASE = [
  { id: "A.1.2.2", nombre: "Identificar propósito",                      agente_responsable: "Agente de Inventario" },
  { id: "A.1.2.9", nombre: "Registros de tratamiento",                   agente_responsable: "Agente de Inventario" },
  { id: "A.1.2.6", nombre: "Evaluación de impacto de privacidad (DPIA)", agente_responsable: "Agente de Riesgos" },
  { id: "A.1.2.7", nombre: "Contratos con encargados",                   agente_responsable: "Agente de Terceros" },
  { id: "A.1.3.7", nombre: "Acceso, corrección o supresión",             agente_responsable: "Agente de Derechos" },
  { id: "A.1.3.9", nombre: "Copia de PII",                               agente_responsable: "Agente de Derechos" },
  { id: "A.2.5.7", nombre: "Divulgación de subcontratistas",             agente_responsable: "Agente de Terceros" },
  { id: "A.3.11",  nombre: "Planificación de incidentes",                agente_responsable: "Agente de Incidentes" },
  { id: "A.3.12",  nombre: "Respuesta a incidentes",                     agente_responsable: "Agente de Incidentes" },
  { id: "A.3.17",  nombre: "Concienciación y formación",                 agente_responsable: "Agente de Formación" },
];

// ── Mapa semántico control → política UNSA ────────────────
const POLITICAS_MAP = {
  "A.1.2.2": "Política UNSA - Finalidad de Datos de Estudiantes y Comedor Universitario",
  "A.1.2.9": "Política UNSA - Bancos de Datos Personales Registrados (RAT Institucional)",
  "A.1.2.6": "Política UNSA - Evaluación de Impacto (DPIA) y Acceso a Comedor Universitario",
  "A.1.2.7": "Política UNSA - Gestión de Terceros, Proveedores y Transferencias",
  "A.1.3.7": "Política UNSA - Ejercicio de Derechos ARCO (Mesa de Partes y odp@unsa.edu.pe)",
  "A.1.3.9": "Política UNSA - Ejercicio de Derechos ARCO (Mesa de Partes y odp@unsa.edu.pe)",
  "A.2.5.7": "Política UNSA - Gestión de Terceros, Proveedores y Transferencias",
  "A.3.11":  "Política UNSA - Seguridad de la Información, Vigilancia y Control de Incidentes",
  "A.3.12":  "Política UNSA - Seguridad de la Información, Vigilancia y Control de Incidentes",
  "A.3.17":  "Política UNSA - Datos de Docentes, Personal y Aula Virtual",
};

// ── Riesgos (Agente de Riesgos) ───────────────────────────
const RIESGOS_UNSA = [
  {
    id: "R-UNSA-01",
    descripcion: "Acceso no autorizado a datos de postulantes en SISUNSA",
    controles: ["A.1.2.2", "A.1.2.9", "A.3.11"]
  },
  {
    id: "R-UNSA-02",
    descripcion: "Tratamiento de datos biométricos en Comedor Universitario sin DPIA completo",
    controles: ["A.1.2.6", "A.1.2.7"]
  },
  {
    id: "R-UNSA-03",
    descripcion: "Ausencia de protocolo de respuesta a incidentes en OTIC-UNSA",
    controles: ["A.3.11", "A.3.12"]
  },
  {
    id: "R-UNSA-04",
    descripcion: "Personal sin capacitación en protección de datos personales",
    controles: ["A.3.17"]
  },
  {
    id: "R-UNSA-05",
    descripcion: "No se garantiza ejercicio de derechos ARCO en Admisión y Biblioteca",
    controles: ["A.1.3.7", "A.1.3.9"]
  },
];

// ── Evidencias (Agente de Evidencia) ─────────────────────
let evidencias = [
  {
    control: "A.1.2.2",
    archivo: "reglamento_matricula_2020_modi.pdf",
    descripcion: "Reglamento General de Matrícula (RCU N° 0127-2020): Fines académicos legítimos y registro en SISUNSA",
    estado: "implementado"
  },
  {
    control: "A.1.2.2",
    archivo: "Declaracion-Jurada-Admision-Mayor-Edad.pdf",
    descripcion: "Cláusula de consentimiento informado y tratamiento biométrico de postulantes (DUA-UNSA)",
    estado: "implementado"
  },
  {
    control: "A.1.2.9",
    archivo: "Compilacion-Resoluciones-Sistemas-Oficiales-UNSA.pdf",
    descripcion: "Resoluciones RCU 0127-2020 y RCU 0009-2026: Registro oficial RAT de bancos de datos SISUNSA",
    estado: "implementado"
  },
  {
    control: "A.1.2.6",
    archivo: "RCU-0127-2025-Reglamento-Comedor-Universitario.pdf",
    descripcion: "Reglamento Comedor Universitario: DPIA para validación socioeconómica y huellas dactilares",
    estado: "parcial"
  },
  {
    control: "A.1.3.7",
    archivo: "TUPA-Procedimiento-Derechos-ARCO-UNSA.pdf",
    descripcion: "TUPA Institucional: Procedimiento oficial Derechos ARCO ante Secretaría General y odp@unsa.edu.pe",
    estado: "implementado"
  },
  {
    control: "A.1.3.9",
    archivo: "TUPA-Procedimiento-Derechos-ARCO-UNSA.pdf",
    descripcion: "TUPA Institucional: Expedición de constancias y copia legible de PII para estudiantes",
    estado: "implementado"
  },
  {
    control: "A.3.12",
    archivo: "Protocolo-Seguridad-CSIRT-UNSA-v0.2.docx",
    descripcion: "Borrador de protocolo de contención ante brechas en banco de datos Seguridad y Vigilancia (OTI-UNSA)",
    estado: "parcial"
  }
];

// ── Estado global ─────────────────────────────────────────
let catalogoActual   = CATALOGO_BASE;
let servidorOnline   = false;
let ultimoResultado  = null;
let filtroActual     = "todos";
let skillActual      = "generar_soa";
let soaFilasCache    = [];

// ═══════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", async () => {
  await verificarServidor();
  renderControlesGrid();
  renderRiesgos();
  renderEvidencias();
  renderPolicyMap();
  poblarSelects();
  initRoleTabs();
  initSkillSelector();
  initMiniForm();
  initFiltros();
  initRAGSearch();
  initExport();

  document.getElementById("btn-generar-soa").addEventListener("click", ejecutarGenerarSoA);
  document.getElementById("btn-verificar").addEventListener("click", ejecutarVerificarControl);
});

// ═══════════════════════════════════════════════════════════
// 1. CONECTIVIDAD
// ═══════════════════════════════════════════════════════════
async function verificarServidor() {
  const dot  = document.getElementById("status-dot");
  const txt  = document.getElementById("status-text");
  const alert = document.getElementById("server-alert");
  try {
    const res = await fetch(`${API_BASE}/api/controles/catalogo`);
    if (res.ok) {
      servidorOnline = true;
      catalogoActual = await res.json();
      dot.className = "status-dot online";
      txt.textContent = "Backend Activo (:5000)";
      alert.style.display = "none";
      return;
    }
  } catch (_) {}
  servidorOnline = false;
  dot.className = "status-dot offline";
  txt.textContent = "Motor Local Activo";
  alert.style.display = "block";
}

// ═══════════════════════════════════════════════════════════
// 2. COLUMNA INPUT
// ═══════════════════════════════════════════════════════════

// 2a. Catálogo de controles
function renderControlesGrid() {
  const grid = document.getElementById("controls-grid");
  document.getElementById("count-controles").textContent = catalogoActual.length;
  grid.innerHTML = "";
  catalogoActual.forEach(c => {
    const prefix = c.id.slice(0, 3); // A.1, A.2, A.3
    const cls    = prefix === "A.1" ? "a1" : prefix === "A.2" ? "a2" : "a3";
    const chip   = document.createElement("div");
    chip.className = "ctrl-chip";
    chip.innerHTML = `
      <span class="ctrl-chip-id ${cls}">${c.id}</span>
      <span class="ctrl-chip-name">${c.nombre}</span>
      <span class="ctrl-chip-agent">${c.agente_responsable}</span>
    `;
    grid.appendChild(chip);
  });
}

// 2b. Riesgos
function renderRiesgos() {
  const list = document.getElementById("risk-list");
  document.getElementById("count-riesgos").textContent = RIESGOS_UNSA.length;
  list.innerHTML = "";
  RIESGOS_UNSA.forEach(r => {
    const card = document.createElement("div");
    card.className = "risk-card";
    card.innerHTML = `
      <div class="risk-card-id">${r.id}</div>
      <div class="risk-card-desc">${r.descripcion}</div>
      <div class="risk-card-ctrls">
        ${r.controles.map(c => `<span class="risk-ctrl-tag">${c}</span>`).join("")}
      </div>
    `;
    list.appendChild(card);
  });
}

// 2c. Evidencias
function renderEvidencias() {
  const list = document.getElementById("evidence-list");
  document.getElementById("count-evidencias").textContent = evidencias.length;
  list.innerHTML = "";

  if (evidencias.length === 0) {
    list.innerHTML = `<div style="color:var(--text-muted);font-size:11px;padding:6px 0;">Sin evidencias registradas.</div>`;
    return;
  }

  evidencias.forEach((e, idx) => {
    const card = document.createElement("div");
    card.className = "ev-card";
    const stCls = e.estado === "implementado" ? "impl" : "parcial";
    const stTxt = e.estado === "implementado" ? "Implementado" : "Parcial";
    card.innerHTML = `
      <div class="ev-card-left">
        <span class="ev-card-ctrl">${e.control}</span>
        <div class="ev-card-file">${e.archivo}</div>
        <div class="ev-card-desc">${e.descripcion}</div>
      </div>
      <span class="ev-estado ${stCls}">${stTxt}</span>
      <button class="btn-del-ev" data-idx="${idx}" title="Eliminar">✕</button>
    `;
    card.querySelector(".btn-del-ev").addEventListener("click", (ev) => {
      evidencias.splice(parseInt(ev.target.dataset.idx), 10);
      renderEvidencias();
    });
    list.appendChild(card);
  });
}

// 2d. Mini form
function initMiniForm() {
  const btnAdd    = document.getElementById("btn-add-evidence");
  const form      = document.getElementById("mini-form");
  const btnSave   = document.getElementById("mf-save");
  const btnCancel = document.getElementById("mf-cancel");

  btnAdd.addEventListener("click", () => {
    form.style.display = form.style.display === "none" ? "flex" : "none";
    if (form.style.display === "flex") form.style.flexDirection = "column";
  });

  btnCancel.addEventListener("click", () => { form.style.display = "none"; });

  btnSave.addEventListener("click", () => {
    const ctrl  = document.getElementById("mf-control").value;
    const est   = document.getElementById("mf-estado").value;
    const arch  = document.getElementById("mf-archivo").value.trim();
    const desc  = document.getElementById("mf-desc").value.trim();
    if (!arch || !desc) { alert("Completa el archivo y la descripción."); return; }
    evidencias.push({ control: ctrl, archivo: arch, descripcion: desc, estado: est });
    document.getElementById("mf-archivo").value = "";
    document.getElementById("mf-desc").value = "";
    form.style.display = "none";
    renderEvidencias();
  });
}

// 2e. Role tabs
function initRoleTabs() {
  document.querySelectorAll(".role-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".role-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      tab.querySelector("input").checked = true;
    });
  });
}

function getRol() {
  const r = document.querySelector("input[name='rol']:checked");
  return r ? r.value : "responsable";
}

// ═══════════════════════════════════════════════════════════
// 3. COLUMNA SKILLS
// ═══════════════════════════════════════════════════════════

function initSkillSelector() {
  document.querySelectorAll(".skill-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".skill-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".skill-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      skillActual = btn.dataset.skill;
      const panel = document.getElementById(`sp-${skillActual}`);
      if (panel) panel.classList.add("active");
    });
  });
}

// Ejecutar generar-soa
async function ejecutarGenerarSoA() {
  const payload = {
    operacion: "generar_soa",
    perfil: {
      organizacion: document.getElementById("input-org").value.trim() || "Universidad Nacional de San Agustín (UNSA)",
      rol: getRol()
    },
    riesgos: RIESGOS_UNSA,
    evidencias: evidencias.map(e => ({
      control: e.control,
      descripcion: `[Archivo: ${e.archivo}] ${e.descripcion}`,
      estado: e.estado
    }))
  };
  await procesarPayload(payload);
}

// Ejecutar verificar-controles
async function ejecutarVerificarControl() {
  const ctrl = document.getElementById("sel-control-individual").value;
  const payload = {
    operacion: "verificar_control",
    control: ctrl,
    perfil: {
      organizacion: "Universidad Nacional de San Agustín (UNSA)",
      rol: getRol()
    },
    riesgos: RIESGOS_UNSA,
    evidencias: evidencias.map(e => ({
      control: e.control,
      descripcion: `[Archivo: ${e.archivo}] ${e.descripcion}`,
      estado: e.estado
    }))
  };
  await procesarPayload(payload);
}

// Procesar payload → backend o motor local
async function procesarPayload(payload) {
  setLoading(true);
  let resultado = null;

  if (servidorOnline) {
    try {
      const res = await fetch(`${API_BASE}/api/controles/ejecutar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) resultado = await res.json();
    } catch (_) {}
  }

  if (!resultado) resultado = motorLocal(payload);

  ultimoResultado = resultado;
  setLoading(false);
  renderResultado(resultado);
}

// Motor determinista local (misma lógica que controles.py)
function motorLocal(entrada) {
  const op   = entrada.operacion || "generar_soa";
  const perf = entrada.perfil || {};
  const rol  = perf.rol || "responsable";
  const rsk  = entrada.riesgos || [];
  const evs  = entrada.evidencias || [];

  if (op === "verificar_control") {
    const ctrl = catalogoActual.find(c => c.id === entrada.control) || catalogoActual[0];
    const fila = evaluarFila(ctrl, rol, rsk, evs);
    fila.recomendacion = recomendar(fila);
    return {
      agente: "controles", operacion: "verificar_control", estado: "ok",
      respuesta: `Control ${fila.control} (${fila.nombre}): ${fila.estado}. ${fila.recomendacion}`,
      datos: fila, fuentes: ["catalogo_controles.json"], confianza: 1.0,
      requiere_revision_humana: true
    };
  }

  const soa       = catalogoActual.map(c => evaluarFila(c, rol, rsk, evs));
  const aplicables = soa.filter(f => f.aplica);
  const brechas   = aplicables
    .filter(f => f.estado !== "implementado")
    .map(f => ({ control: f.control, nombre: f.nombre, estado: f.estado, solicitar_a: f.responsable }));
  const resumen = {
    controles_evaluados: soa.length,
    aplican: aplicables.length,
    excluidos: soa.length - aplicables.length,
    implementados: aplicables.filter(f => f.estado === "implementado").length,
    parciales:     aplicables.filter(f => f.estado === "parcial").length,
    no_implementados: aplicables.filter(f => f.estado === "no implementado").length,
  };
  const org = perf.organizacion || "UNSA";
  return {
    agente: "controles", operacion: "generar_soa", estado: "ok",
    respuesta: `SoA generada para ${org} (rol: ${rol}). Evaluados: ${resumen.controles_evaluados}; Aplican: ${resumen.aplican}; Implementados: ${resumen.implementados}; Brechas: ${brechas.length}.`,
    datos: { soa, brechas, resumen },
    fuentes: ["catalogo_controles.json"], confianza: 1.0,
    requiere_revision_humana: true
  };
}

function evaluarFila(control, rol, riesgos, evs) {
  const pref = control.id.slice(0, 3);
  let aplica = false, justif = "";

  if (pref === "A.3") {
    aplica = true;
    justif = "Control común: aplica a cualquier rol institucional.";
  } else if (pref === "A.1") {
    if (rol === "responsable" || rol === "ambos") {
      aplica = true; justif = "La UNSA actúa como responsable del tratamiento (PII Controller).";
    } else {
      aplica = false; justif = "Excluido: la UNSA no actúa como responsable (controles A.1).";
    }
  } else if (pref === "A.2") {
    if (rol === "encargado" || rol === "ambos") {
      aplica = true; justif = "La UNSA actúa como encargada del tratamiento (PII Processor).";
    } else {
      aplica = false; justif = "Excluido: la UNSA no actúa como encargada (controles A.2).";
    }
  }

  const vinculados = riesgos.filter(r => (r.controles || []).includes(control.id)).map(r => r.id);
  if (aplica && vinculados.length) justif += ` Vinculado a: ${vinculados.join(", ")}.`;

  let estado = "no aplica", docs = [];
  if (aplica) {
    const propias = evs.filter(e => e.control === control.id);
    docs = propias.map(e => e.descripcion);
    if (propias.some(e => e.estado === "implementado"))  estado = "implementado";
    else if (propias.some(e => e.estado === "parcial"))  estado = "parcial";
    else                                                  estado = "no implementado";
  }

  return {
    control: control.id, nombre: control.nombre,
    aplica, justificacion: justif, estado,
    evidencias: docs,
    politica_relacionada: POLITICAS_MAP[control.id] || null,
    responsable: control.agente_responsable
  };
}

function recomendar(fila) {
  if (!fila.aplica)                      return "Documentar la exclusión y su justificación en la SoA.";
  if (fila.estado === "implementado")    return "Mantener la evidencia vigente para la auditoría interna (Cláusula 9.2).";
  if (fila.estado === "parcial")         return `Completar la implementación con el ${fila.responsable}.`;
  return `Solicitar evidencia o implementación al ${fila.responsable}.`;
}

// ── Render resultados ─────────────────────────────────────
function renderResultado(res) {
  const resultBox = document.getElementById("skill-result");
  resultBox.style.display = "flex";

  const esSoA  = res.operacion === "generar_soa";
  const esCrtl = res.operacion === "verificar_control";

  // Métricas
  const mStrip = document.getElementById("metrics-strip");
  mStrip.style.display = esSoA ? "flex" : "none";
  if (esSoA && res.datos && res.datos.resumen) {
    const r = res.datos.resumen;
    document.getElementById("m-evaluados").textContent = r.controles_evaluados;
    document.getElementById("m-aplican").textContent   = r.aplican;
    document.getElementById("m-impl").textContent      = r.implementados;
    document.getElementById("m-parciales").textContent = r.parciales;
    document.getElementById("m-brechas").textContent   = r.no_implementados;
  }

  // Filtros + tabla SoA
  document.getElementById("filter-row").style.display    = esSoA ? "flex" : "none";
  document.getElementById("soa-table-wrap").style.display = esSoA ? "block" : "none";
  document.getElementById("single-result").style.display  = esCrtl ? "block" : "none";

  if (esSoA && res.datos && res.datos.soa) {
    soaFilasCache = res.datos.soa;
    renderTabla(soaFilasCache);
  }

  if (esCrtl && res.datos) {
    renderSingle(res.datos, res.respuesta);
  }

  // Brechas
  const gapSec = document.getElementById("gaps-section");
  const brechas = esSoA ? (res.datos && res.datos.brechas) || [] : [];
  gapSec.style.display = (esSoA && brechas.length > 0) ? "flex" : "none";
  if (esSoA) renderBrechas(brechas);
}

function renderTabla(filas) {
  const tbody = document.getElementById("soa-tbody");
  tbody.innerHTML = "";

  const filtradas = filas.filter(f => {
    if (filtroActual === "todos")         return true;
    if (filtroActual === "implementados") return f.estado === "implementado";
    if (filtroActual === "brechas")       return f.aplica && f.estado === "no implementado";
    if (filtroActual === "parciales")     return f.estado === "parcial";
    if (filtroActual === "excluidos")     return !f.aplica;
    return true;
  });

  filtradas.forEach(f => {
    const stInfo = estadoInfo(f.estado);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="ctrl-id">${f.control}</span></td>
      <td>${f.nombre}</td>
      <td style="text-align:center;">${f.aplica ? "✓" : "–"}</td>
      <td><span class="st-tag ${stInfo.cls}">${stInfo.txt}</span></td>
      <td style="font-size:10px;color:var(--text-muted);">${f.responsable}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderSingle(datos, respuesta) {
  const box = document.getElementById("single-result");
  const stInfo = estadoInfo(datos.estado);
  box.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
      <span class="ctrl-id">${datos.control}</span>
      <strong style="font-size:12px;">${datos.nombre}</strong>
      <span class="st-tag ${stInfo.cls}" style="margin-left:auto;">${stInfo.txt}</span>
    </div>
    <div style="font-size:11px;color:var(--text-secondary);margin-bottom:8px;">${datos.justificacion || ""}</div>
    ${datos.politica_relacionada ? `<div style="font-size:10px;color:var(--violet);background:var(--violet-dim);padding:5px 8px;border-radius:5px;margin-bottom:8px;">📋 ${datos.politica_relacionada}</div>` : ""}
    ${datos.evidencias && datos.evidencias.length ? `<div style="font-size:10px;color:var(--green);margin-bottom:8px;">📎 ${datos.evidencias.join("<br>📎 ")}</div>` : `<div style="font-size:10px;color:var(--text-muted);margin-bottom:8px;">Sin evidencias registradas.</div>`}
    <div style="font-size:11px;background:var(--green-dim);border:1px solid rgba(63,185,80,0.25);border-radius:6px;padding:8px 10px;color:var(--green);">
      💡 ${datos.recomendacion || ""}
    </div>
  `;
}

function renderBrechas(brechas) {
  const grid = document.getElementById("gaps-grid");
  grid.innerHTML = "";
  brechas.forEach(b => {
    const stInfo = estadoInfo(b.estado);
    const card = document.createElement("div");
    card.className = "gap-card";
    card.innerHTML = `
      <strong>${b.control}: ${b.nombre}</strong>
      <div class="gc-status">Estado: ${stInfo.txt}</div>
      <div class="gc-agent">Solicitar a: <strong>${b.solicitar_a}</strong></div>
    `;
    grid.appendChild(card);
  });
}

function estadoInfo(estado) {
  return {
    "implementado":    { cls: "st-impl",   txt: "Implementado" },
    "parcial":         { cls: "st-parc",   txt: "Parcial" },
    "no implementado": { cls: "st-noimpl", txt: "No Implementado" },
    "no aplica":       { cls: "st-noap",   txt: "No Aplica" },
  }[estado] || { cls: "st-noap", txt: estado };
}

// Loading state
function setLoading(on) {
  document.getElementById("skill-loading").style.display = on ? "flex" : "none";
  document.getElementById("skill-result").style.display  = on ? "none" : (ultimoResultado ? "flex" : "none");
}

// ── Filtros ───────────────────────────────────────────────
function initFiltros() {
  document.querySelectorAll(".fpill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".fpill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      filtroActual = pill.dataset.filter;
      if (soaFilasCache.length) renderTabla(soaFilasCache);
    });
  });
}

// ── Poblar selects ────────────────────────────────────────
function poblarSelects() {
  const selCtrl = document.getElementById("sel-control-individual");
  const mfCtrl  = document.getElementById("mf-control");
  [selCtrl, mfCtrl].forEach(sel => {
    sel.innerHTML = "";
    catalogoActual.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = `${c.id} — ${c.nombre}`;
      sel.appendChild(opt);
    });
  });
}

// ═══════════════════════════════════════════════════════════
// 4. COLUMNA RAG
// ═══════════════════════════════════════════════════════════

function initRAGSearch() {
  const btn   = document.getElementById("btn-rag-search");
  const input = document.getElementById("rag-query");
  const box   = document.getElementById("rag-result-box");

  async function buscar() {
    const q = input.value.trim();
    if (!q) return;

    box.innerHTML = `<div class="skill-loading"><div class="loading-spinner"></div><span>Buscando en la base de conocimiento...</span></div>`;

    if (servidorOnline) {
      try {
        const res = await fetch(`${API_BASE}/api/controles/ejecutar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ solicitud: q })
        });
        if (res.ok) {
          const data = await res.json();
          renderRAGResult(data, box);
          return;
        }
      } catch (_) {}
    }

    // Fallback local: búsqueda en POLITICAS_MAP
    renderRAGFallback(q, box);
  }

  btn.addEventListener("click", buscar);
  input.addEventListener("keydown", e => { if (e.key === "Enter") buscar(); });
}

function renderRAGResult(data, box) {
  if (data.estado === "ok" && data.respuesta) {
    const parrafos = data.respuesta.split("\n\n").filter(p => p.trim());
    box.innerHTML = parrafos.map((p, i) => `
      <div class="rag-hit">
        <div class="rag-hit-score">Score: ${data.confianza ? data.confianza.toFixed(3) : "—"}</div>
        <div class="rag-hit-src">${(data.fuentes || [])[0] || "Base de conocimiento UNSA"}</div>
        <div class="rag-hit-text">${p}</div>
      </div>
    `).join("");
  } else {
    box.innerHTML = `<div class="rag-placeholder"><div class="rag-placeholder-icon">🔍</div><p>No se encontró información relevante en la base de conocimiento para esa consulta.</p></div>`;
  }
}

function renderRAGFallback(q, box) {
  // Búsqueda básica por keywords en políticas
  const ql = q.toLowerCase();
  const matches = Object.entries(POLITICAS_MAP)
    .filter(([k, v]) => v.toLowerCase().includes(ql) || k.toLowerCase().includes(ql));

  if (matches.length > 0) {
    box.innerHTML = matches.slice(0, 3).map(([ctrl, pol]) => `
      <div class="rag-hit">
        <div class="rag-hit-score">Motor local</div>
        <div class="rag-hit-src">${ctrl} — Mapa semántico UNSA</div>
        <div class="rag-hit-text">${pol}</div>
      </div>
    `).join("");
  } else {
    box.innerHTML = `<div class="rag-placeholder"><div class="rag-placeholder-icon">🔍</div><p>No se encontró información relevante. Inicia el servidor Flask para usar el índice FAISS completo.</p></div>`;
  }
}

function renderPolicyMap() {
  const map = document.getElementById("policy-map");
  map.innerHTML = "";
  Object.entries(POLITICAS_MAP).forEach(([ctrl, pol]) => {
    const row = document.createElement("div");
    row.className = "pol-row";
    const polShort = pol.replace("Política UNSA - ", "");
    row.innerHTML = `
      <span class="pol-ctrl">${ctrl}</span>
      <span class="pol-arrow">→</span>
      <span class="pol-name">${polShort}</span>
    `;
    map.appendChild(row);
  });
}

// ═══════════════════════════════════════════════════════════
// 5. EXPORTAR
// ═══════════════════════════════════════════════════════════
function initExport() {
  document.getElementById("btn-export-json").addEventListener("click", () => {
    if (!ultimoResultado) return;
    const blob = new Blob([JSON.stringify(ultimoResultado, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `SoA_UNSA_ISO27701_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById("btn-imprimir").addEventListener("click", () => window.print());
}
