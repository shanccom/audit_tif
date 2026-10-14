// Sistema de Auditoría de Privacidad PIMS (ISO/IEC 27701:2025)
// Universidad Nacional de San Agustín de Arequipa (UNSA)
// Diseño Minimalista Ejecutivo en Tonos Plomo / Slate

const API_BASE = (window.location.protocol === "file:" || !window.location.port)
  ? "http://127.0.0.1:5000"
  : "";

// Catálogo normativo oficial de respaldo
const CATALOGO_BASE = [
  {"id": "A.1.2.2", "nombre": "Identificar propósito", "agente_responsable": "Agente de Inventario"},
  {"id": "A.1.2.9", "nombre": "Registros de tratamiento", "agente_responsable": "Agente de Inventario"},
  {"id": "A.1.2.6", "nombre": "Evaluación de impacto de privacidad (DPIA)", "agente_responsable": "Agente de Riesgos"},
  {"id": "A.1.2.7", "nombre": "Contratos con encargados", "agente_responsable": "Agente de Terceros"},
  {"id": "A.1.3.7", "nombre": "Acceso, corrección o supresión", "agente_responsable": "Agente de Derechos"},
  {"id": "A.1.3.9", "nombre": "Copia de PII", "agente_responsable": "Agente de Derechos"},
  {"id": "A.2.5.7", "nombre": "Divulgación de subcontratistas", "agente_responsable": "Agente de Terceros"},
  {"id": "A.3.11", "nombre": "Planificación de incidentes", "agente_responsable": "Agente de Incidentes"},
  {"id": "A.3.12", "nombre": "Respuesta a incidentes", "agente_responsable": "Agente de Incidentes"},
  {"id": "A.3.17", "nombre": "Concienciación y formación", "agente_responsable": "Agente de Formación"}
];

// Mapeo semántico a la directiva institucional de la UNSA
const POLITICAS_MAP = {
  "A.1.2.2": "DIR-OTIC-004-UNSA: Finalidad de Datos de Estudiantes y Comedor Universitario",
  "A.1.2.9": "DIR-OTIC-004-UNSA: Bancos de Datos Registrados (RAT Institucional)",
  "A.1.2.6": "DIR-OTIC-004-UNSA: Evaluación de Impacto (DPIA) en Comedor Universitario",
  "A.1.2.7": "DIR-OTIC-004-UNSA: Gestión de Terceros, Proveedores y Transferencias",
  "A.1.3.7": "DIR-OTIC-004-UNSA: Procedimiento Derechos ARCO (odp@unsa.edu.pe)",
  "A.1.3.9": "DIR-OTIC-004-UNSA: Expedición de Copias de Datos Personales",
  "A.2.5.7": "DIR-OTIC-004-UNSA: Supervisión de Subcontratistas y Encargados",
  "A.3.11": "DIR-OTIC-004-UNSA: Planificación y Vigilancia de Incidentes de Seguridad",
  "A.3.12": "DIR-OTIC-004-UNSA: Protocolo de Respuesta ante Brechas (CSIRT-UNSA)",
  "A.3.17": "DIR-OTIC-004-UNSA: Formación Continua de Docentes y Administrativos"
};

// Evidencias Documentales de la UNSA
let evidenciasDocumentadas = [
  {
    control: "A.1.2.2",
    archivo: "RCU-0127-2020-Reglamento-Matricula.pdf",
    descripcion: "Fines académicos legítimos, deberes de estudiantes y registro oficial en SISUNSA",
    estado: "implementado"
  },
  {
    control: "A.1.2.2",
    archivo: "DJ-Consentimiento-Admision.pdf",
    descripcion: "Cláusula de consentimiento previo informado y tratamiento biométrico de postulantes",
    estado: "implementado"
  },
  {
    control: "A.1.2.9",
    archivo: "RCU-0009-2026-Registro-RAT.pdf",
    descripcion: "Registro de Actividades de Tratamiento (RAT) para bancos de datos SISUNSA y Campus Virtual",
    estado: "implementado"
  },
  {
    control: "A.1.2.6",
    archivo: "Borrador-DPIA-Comedor-2025.docx",
    descripcion: "Evaluación preliminar de impacto para validación socioeconómica y huellas dactilares",
    estado: "parcial"
  },
  {
    control: "A.1.3.7",
    archivo: "TUPA-Procedimiento-ARCO-UNSA.pdf",
    descripcion: "Procedimiento oficial de Derechos ARCO ante Secretaría General y odp@unsa.edu.pe",
    estado: "implementado"
  },
  {
    control: "A.1.3.9",
    archivo: "TUPA-Procedimiento-ARCO-UNSA.pdf",
    descripcion: "Expedición de constancias y copia íntegra de datos personales para estudiantes agustinos",
    estado: "implementado"
  },
  {
    control: "A.1.2.7",
    archivo: "Contrato-DPA-Google-Workspace.pdf",
    descripcion: "Acuerdo de Procesamiento de Datos (DPA) para cuentas institucionales @unsa.edu.pe",
    estado: "implementado"
  },
  {
    control: "A.3.12",
    archivo: "Protocolo-CSIRT-UNSA-v0.2.docx",
    descripcion: "Borrador del plan de contención ante incidentes de seguridad y notificación a la ANPD",
    estado: "parcial"
  }
];

// Riesgos mapeados en la UNSA
const riesgosUNSA = [
  {
    id: "R-UNSA-01",
    descripcion: "Riesgo de acceso no autorizado o filtración de notas y DNI en SISUNSA",
    controles: ["A.1.2.6", "A.3.12"],
    impacto: "Alto"
  },
  {
    id: "R-UNSA-02",
    descripcion: "Tratamiento de huellas dactilares en Comedor Universitario sin DPIA integral",
    controles: ["A.1.2.6"],
    impacto: "Crítico"
  },
  {
    id: "R-UNSA-03",
    descripcion: "Retrasos en la tramitación de derechos de acceso y supresión ARCO de egresados",
    controles: ["A.1.3.7", "A.1.3.9"],
    impacto: "Medio"
  }
];

// Fallback de textos normativos para búsqueda RAG offline
const KNOWLEDGE_FALLBACK = [
  {
    meta: "DIR-OTIC-004-UNSA · Art. 7 (Comedor Universitario)",
    texto: "El tratamiento de huellas dactilares y datos biométricos de los comensales del Comedor Universitario requiere una Evaluación de Impacto en la Protección de Datos Personales (DPIA). Los datos biométricos se conservan únicamente durante la condición de comensal activo.",
    keywords: ["comedor", "biometria", "huellas", "dactilares", "comensales", "dpia"]
  },
  {
    meta: "DIR-OTIC-004-UNSA · Art. 4 (Consentimiento y SISUNSA)",
    texto: "En los sistemas de matrícula académica (SISUNSA) y admisión (SISADMISION), el consentimiento debe ser libre, previo, expreso e inequívoco. La universidad publicará las cláusulas informativas de privacidad antes del envío del formulario.",
    keywords: ["consentimiento", "sisunsa", "admision", "estudiantes", "postulantes", "matricula"]
  },
  {
    meta: "DIR-OTIC-004-UNSA · Art. 12 (Derechos ARCO)",
    texto: "Los titulares de datos personales pueden ejercer sus derechos de Acceso, Rectificación, Cancelación y Oposición (ARCO) mediante solicitud formal ante Mesa de Partes (Calle San Agustín 115) o enviando un correo al Oficial de Datos: odp@unsa.edu.pe. Plazo de atención: 10 días hábiles.",
    keywords: ["arco", "derechos", "acceso", "rectificacion", "cancelacion", "oposicion", "odp@unsa.edu.pe"]
  },
  {
    meta: "DIR-OTIC-004-UNSA · Art. 15 (Gestión de Incidentes)",
    texto: "Toda brecha de seguridad que afecte la confidencialidad de datos personales debe ser reportada al CSIRT-UNSA dentro de las 24 horas y notificada a la Autoridad Nacional de Protección de Datos Personales (ANPD) conforme a ley.",
    keywords: ["incidentes", "seguridad", "brechas", "csirt", "anpd", "notificacion"]
  },
  {
    meta: "ISO/IEC 27701:2025 · Control A.1.2.7 (Encargados y Terceros)",
    texto: "La organización responsable debe suscribir acuerdos contractuales por escrito con cada encargado del tratamiento (DPA), garantizando que cumplan medidas técnicas y organizativas equivalentes a las exigidas por el marco PIMS.",
    keywords: ["contratos", "terceros", "encargados", "proveedores", "dpa", "google", "workspace"]
  }
];

let catalogoActual = CATALOGO_BASE;
let filtroTablaSoA = "todos";
let resultadoSoAUltimo = null;
let servidorOnline = false;

// Inicialización de la Aplicación
document.addEventListener("DOMContentLoaded", async () => {
  initNavegacionPestanas();
  initSelectorRoles();
  renderRiesgos();
  renderEvidencias();
  initFormularioNuevaEvidencia();
  initBuscadorRAG();
  initBotonSiguientePaso();
  poblarSelectsControles();
  await verificarConexionServidor();

  document.getElementById("btn-generar-soa").addEventListener("click", ejecutarSoA);
  document.getElementById("btn-auditar-individual").addEventListener("click", auditarControlPuntual);
  document.getElementById("btn-descargar-json").addEventListener("click", exportarJson);
  document.getElementById("btn-imprimir-reporte").addEventListener("click", () => window.print());
});

// 1. Verificación de Estado del Servidor
async function verificarConexionServidor() {
  const statusDot = document.getElementById("status-dot");
  const statusText = document.getElementById("status-text");
  const serverAlert = document.getElementById("server-alert");

  try {
    const res = await fetch(`${API_BASE}/api/controles/catalogo`, { method: "GET" });
    if (res.ok) {
      servidorOnline = true;
      catalogoActual = await res.json();
      statusDot.className = "status-dot online";
      statusText.textContent = "Agente en Línea (:5000)";
      serverAlert.style.display = "none";
      return;
    }
  } catch (err) {
    // Modo desconectado
  }

  servidorOnline = false;
  statusDot.className = "status-dot offline";
  statusText.textContent = "Modo Local Autónomo";
  serverAlert.style.display = "block";
}

// 2. Navegación de 3 Ventanas
function initNavegacionPestanas() {
  const tabs = document.querySelectorAll(".tab-trigger");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      activarPestana(tab.dataset.tab);
    });
  });
}

function activarPestana(targetId) {
  const tabs = document.querySelectorAll(".tab-trigger");
  const views = document.querySelectorAll(".tab-view");

  tabs.forEach(t => {
    t.classList.toggle("active", t.dataset.tab === targetId);
  });

  views.forEach(v => {
    v.classList.toggle("active", v.id === targetId);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function initBotonSiguientePaso() {
  const btn = document.getElementById("btn-ir-skills");
  if (!btn) return;
  btn.addEventListener("click", () => {
    activarPestana("tab-skills");
    ejecutarSoA();
  });
}

// 3. Selector de Roles
function initSelectorRoles() {
  const radios = document.querySelectorAll("input[name='rol-eval']");
  radios.forEach(r => {
    r.addEventListener("change", () => {
      document.querySelectorAll(".role-clean-option").forEach(opt => opt.classList.remove("selected"));
      const parent = r.closest(".role-clean-option");
      if (parent) parent.classList.add("selected");
    });
  });
}

function obtenerRolSeleccionado() {
  const checked = document.querySelector("input[name='rol-eval']:checked");
  return checked ? checked.value : "responsable";
}

// 4. Renderizado de Riesgos
function renderRiesgos() {
  const container = document.getElementById("contenedor-riesgos-resumen");
  if (!container) return;
  container.innerHTML = "";

  riesgosUNSA.forEach(r => {
    const item = document.createElement("div");
    item.className = "risk-item-row";
    item.innerHTML = `
      <div class="risk-item-top">
        <span class="risk-code">${r.id}</span>
        <span class="risk-impact-tag">Impacto: ${r.impacto}</span>
      </div>
      <div class="risk-item-desc">${r.descripcion}</div>
      <div class="risk-ctrls-link">Exige mitigar: <strong>${r.controles.join(", ")}</strong></div>
    `;
    container.appendChild(item);
  });
}

// 5. Renderizado de Evidencias
function renderEvidencias() {
  const container = document.getElementById("contenedor-artefactos");
  if (!container) return;
  container.innerHTML = "";

  if (evidenciasDocumentadas.length === 0) {
    container.innerHTML = `<div style="font-size: 12px; color: var(--ink-subtle); padding: 12px; text-align: center;">No hay documentos registrados.</div>`;
    return;
  }

  evidenciasDocumentadas.forEach((e, idx) => {
    const item = document.createElement("div");
    item.className = "evidence-clean-item";
    const statusText = e.estado === "implementado" ? "Oficial Vigente" : "Borrador";
    const statusClass = e.estado === "implementado" ? "imp" : "parc";

    item.innerHTML = `
      <div class="evidence-top">
        <span class="evidence-ctrl-badge">Control ${e.control}</span>
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="badge-status-clean ${statusClass}">${statusText}</span>
          <button class="btn-del-doc" data-index="${idx}" style="background:none; border:none; color:var(--ink-light); cursor:pointer; font-size:11px;" title="Eliminar documento">✕</button>
        </div>
      </div>
      <div class="evidence-file">${e.archivo}</div>
      <div class="evidence-desc">${e.descripcion}</div>
    `;

    item.querySelector(".btn-del-doc").addEventListener("click", (evt) => {
      const i = parseInt(evt.target.dataset.index, 10);
      evidenciasDocumentadas.splice(i, 1);
      renderEvidencias();
    });

    container.appendChild(item);
  });
}

// 6. Formulario de Nueva Evidencia
function initFormularioNuevaEvidencia() {
  const btnAbrir = document.getElementById("btn-abrir-modal-evidencia");
  const subform = document.getElementById("form-registro-rapido");
  const btnCancelar = document.getElementById("btn-cancelar-documento");
  const btnGuardar = document.getElementById("btn-guardar-documento");

  btnAbrir.addEventListener("click", () => {
    subform.style.display = subform.style.display === "none" ? "block" : "none";
  });

  btnCancelar.addEventListener("click", () => {
    subform.style.display = "none";
  });

  btnGuardar.addEventListener("click", () => {
    const ctrl = document.getElementById("sel-nuevo-control").value;
    const arch = document.getElementById("txt-nuevo-archivo").value.trim();
    const desc = document.getElementById("txt-nueva-desc").value.trim();
    const est = document.getElementById("sel-nuevo-estado").value;

    if (!arch || !desc) {
      alert("Por favor ingrese el nombre del archivo y una breve descripción.");
      return;
    }

    evidenciasDocumentadas.push({
      control: ctrl,
      archivo: arch,
      descripcion: desc,
      estado: est
    });

    document.getElementById("txt-nuevo-archivo").value = "";
    document.getElementById("txt-nueva-desc").value = "";
    subform.style.display = "none";
    renderEvidencias();
  });
}

function poblarSelectsControles() {
  const selNuevo = document.getElementById("sel-nuevo-control");
  const selIndiv = document.getElementById("sel-control-individual");

  if (!selNuevo || !selIndiv) return;
  selNuevo.innerHTML = "";
  selIndiv.innerHTML = "";

  catalogoActual.forEach(c => {
    const opt1 = document.createElement("option");
    opt1.value = c.id;
    opt1.textContent = `${c.id} - ${c.nombre} (${c.agente_responsable})`;
    selNuevo.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = c.id;
    opt2.textContent = `${c.id} - ${c.nombre} (${c.agente_responsable})`;
    selIndiv.appendChild(opt2);
  });
}

// 7. Skill 1: Generación de la SoA
async function ejecutarSoA() {
  const rol = obtenerRolSeleccionado();

  const payload = {
    operacion: "generar_soa",
    perfil: { organizacion: "Universidad Nacional de San Agustín de Arequipa (UNSA)", rol: rol },
    riesgos: riesgosUNSA,
    evidencias: evidenciasDocumentadas.map(e => ({
      control: e.control,
      descripcion: `[${e.archivo}] ${e.descripcion}`,
      estado: e.estado
    }))
  };

  let resultado = null;

  try {
    const resp = await fetch(`${API_BASE}/api/controles/ejecutar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (resp.ok) {
      resultado = await resp.json();
    }
  } catch (err) {
    // Fallback
  }

  if (!resultado) {
    resultado = ejecutarMotorLocal(payload);
  }

  renderizarResultadosSoA(resultado);
}

// Motor de Contingencia determinista
function ejecutarMotorLocal(entrada) {
  const operacion = entrada.operacion || "generar_soa";
  const perfil = entrada.perfil || {};
  const rol = perfil.rol || "responsable";
  const riesgos = entrada.riesgos || [];
  const evidencias = entrada.evidencias || [];

  if (operacion === "verificar_control") {
    const cid = entrada.control;
    const ctrl = catalogoActual.find(c => c.id === cid) || catalogoActual[0];
    const fila = evaluarFilaControl(ctrl, rol, riesgos, evidencias);
    fila.recomendacion = recomendarAccion(fila);
    return {
      agente: "controles",
      operacion: "verificar_control",
      estado: "ok",
      respuesta: `Control ${fila.control}: ${fila.estado}. ${fila.recomendacion}`,
      datos: fila,
      fuentes: ["catalogo_controles.json", "DIR-OTIC-004-UNSA"],
      confianza: 1.0
    };
  }

  const soa = catalogoActual.map(ctrl => evaluarFilaControl(ctrl, rol, riesgos, evidencias));
  const aplicables = soa.filter(f => f.aplica);
  const brechas = aplicables
    .filter(f => f.estado !== "implementado")
    .map(f => ({
      control: f.control,
      nombre: f.nombre,
      estado: f.estado,
      solicitar_a: f.responsable
    }));

  const resumen = {
    controles_evaluados: soa.length,
    aplican: aplicables.length,
    excluidos: soa.length - aplicables.length,
    implementados: aplicables.filter(f => f.estado === "implementado").length,
    parciales: aplicables.filter(f => f.estado === "parcial").length,
    no_implementados: aplicables.filter(f => f.estado === "no implementado").length
  };

  return {
    agente: "controles",
    operacion: "generar_soa",
    estado: "ok",
    respuesta: `SoA generada para la UNSA (rol: ${rol}). Evaluados: ${resumen.controles_evaluados}; Aplican: ${resumen.aplican}; Implementados: ${resumen.implementados}; Brechas: ${brechas.length}.`,
    datos: { soa, brechas, resumen },
    fuentes: ["catalogo_controles.json", "DIR-OTIC-004-UNSA"],
    confianza: 1.0
  };
}

function evaluarFilaControl(control, rol, riesgos, evidencias) {
  let aplica = false;
  let justificacion = "";

  const ambito = control.id.slice(0, 3);
  if (ambito === "A.3") {
    aplica = true;
    justificacion = "Control común de seguridad: aplica a cualquier rol institucional.";
  } else if (ambito === "A.1") {
    if (rol === "responsable" || rol === "ambos") {
      aplica = true;
      justificacion = "La UNSA actúa como responsable del tratamiento (PII Controller).";
    } else {
      aplica = false;
      justificacion = "Excluido: la entidad no actúa como responsable directa para este alcance.";
    }
  } else if (ambito === "A.2") {
    if (rol === "encargado" || rol === "ambos") {
      aplica = true;
      justificacion = "La entidad actúa como encargada del tratamiento por cuenta de terceros.";
    } else {
      aplica = false;
      justificacion = "Excluido: la UNSA no actúa como encargada (controles A.2).";
    }
  }

  const vinculados = riesgos.filter(r => (r.controles || []).includes(control.id)).map(r => r.id);
  if (aplica && vinculados.length > 0) {
    justificacion += ` Vinculado a: ${vinculados.join(", ")}.`;
  }

  let estado = "no aplica";
  let docs = [];
  if (aplica) {
    const propias = evidencias.filter(e => e.control === control.id);
    docs = propias.map(e => e.descripcion);
    if (propias.some(e => e.estado === "implementado")) {
      estado = "implementado";
    } else if (propias.some(e => e.estado === "parcial")) {
      estado = "parcial";
    } else {
      estado = "no implementado";
    }
  }

  const politica = POLITICAS_MAP[control.id] || null;

  return {
    control: control.id,
    nombre: control.nombre,
    aplica: aplica,
    justificacion: justificacion,
    estado: estado,
    evidencias: docs,
    politica_relacionada: politica,
    responsable: control.agente_responsable
  };
}

function recomendarAccion(fila) {
  if (!fila.aplica) return "Documentar el motivo formal de exclusión en la SoA.";
  if (fila.estado === "implementado") return "Mantener la evidencia vigente y archivarla para la auditoría interna (Cl. 9.2).";
  if (fila.estado === "parcial") return `Completar requisitos y solicitar expediente oficial al ${fila.responsable}.`;
  return `Solicitar formalmente la documentación e implementación al ${fila.responsable}.`;
}

// 8. Renderizado de la SoA
function renderizarResultadosSoA(res) {
  const panel = document.getElementById("panel-resultados-soa");
  panel.style.display = "block";
  resultadoSoAUltimo = res;

  if (res.datos && res.datos.resumen) {
    const r = res.datos.resumen;
    document.getElementById("num-evaluados").textContent = r.controles_evaluados;
    document.getElementById("num-aplican").textContent = r.aplican;
    document.getElementById("num-implementados").textContent = r.implementados;
    document.getElementById("num-parciales").textContent = r.parciales;
    document.getElementById("num-brechas").textContent = r.no_implementados;

    document.getElementById("txt-count-todos").textContent = r.controles_evaluados;
    document.getElementById("txt-count-brechas").textContent = r.no_implementados;
    document.getElementById("txt-count-imp").textContent = r.implementados;
    document.getElementById("txt-count-exc").textContent = r.excluidos;
  }

  renderFilasSoA(res.datos ? res.datos.soa : []);
  renderItemsBrechas(res.datos ? res.datos.brechas : []);
  initFiltrosSoA(res.datos ? res.datos.soa : []);
}

function renderFilasSoA(filas) {
  const tbody = document.getElementById("tbody-soa");
  tbody.innerHTML = "";

  const filtradas = filas.filter(f => {
    if (filtroTablaSoA === "todos") return true;
    if (filtroTablaSoA === "brechas") return f.aplica && f.estado === "no implementado";
    if (filtroTablaSoA === "implementados") return f.estado === "implementado";
    if (filtroTablaSoA === "excluidos") return !f.aplica;
    return true;
  });

  filtradas.forEach(f => {
    const tr = document.createElement("tr");

    let textoEstado = "No Aplica";
    let badgeClass = "exc";

    if (f.estado === "implementado") {
      textoEstado = "Implementado";
      badgeClass = "imp";
    } else if (f.estado === "parcial") {
      textoEstado = "Parcial (Borrador)";
      badgeClass = "parc";
    } else if (f.estado === "no implementado") {
      textoEstado = "Brecha (Faltante)";
      badgeClass = "gap";
    }

    let textoEvidencias = "<span style='color:var(--ink-light);'>Sin documento</span>";
    if (f.evidencias && f.evidencias.length > 0) {
      textoEvidencias = f.evidencias.map(doc => `<div style="margin-bottom:2px;">• ${doc}</div>`).join("");
    }

    let textoPolitica = "<span style='color:var(--ink-light);'>–</span>";
    if (f.politica_relacionada) {
      textoPolitica = `<div style="font-size:11.5px; color:var(--ink-muted);">${f.politica_relacionada}</div>`;
    }

    tr.innerHTML = `
      <td><span class="code-ctrl">${f.control}</span></td>
      <td><strong>${f.nombre}</strong></td>
      <td style="text-align:center;">${f.aplica ? "Sí" : "No"}</td>
      <td style="color:var(--ink-muted); font-size:12px;">${f.justificacion}</td>
      <td><span class="badge-status-clean ${badgeClass}">${textoEstado}</span></td>
      <td style="font-size:11.5px;">${textoEvidencias}</td>
      <td>${textoPolitica}</td>
      <td><span class="tag-clean" style="font-size:11px;">${f.responsable}</span></td>
    `;

    tbody.appendChild(tr);
  });
}

function renderItemsBrechas(brechas) {
  const container = document.getElementById("contenedor-items-brechas");
  const cuadro = document.getElementById("cuadro-brechas");
  container.innerHTML = "";

  if (!brechas || brechas.length === 0) {
    cuadro.style.display = "none";
    return;
  }

  cuadro.style.display = "block";
  brechas.forEach(b => {
    const card = document.createElement("div");
    card.className = "brecha-item-pill";
    card.innerHTML = `
      <div class="brecha-ctrl">${b.control} — ${b.nombre}</div>
      <div class="brecha-target">Acción: Solicitar evidencia al <strong>${b.solicitar_a}</strong></div>
    `;
    container.appendChild(card);
  });
}

function initFiltrosSoA(filas) {
  const pills = document.querySelectorAll(".filter-pill-clean");
  pills.forEach(p => {
    p.onclick = () => {
      pills.forEach(x => x.classList.remove("active"));
      p.classList.add("active");
      filtroTablaSoA = p.dataset.filter;
      renderFilasSoA(filas);
    };
  });
}

// 9. Skill 2: Auditoría Individual
async function auditarControlPuntual() {
  const ctrlId = document.getElementById("sel-control-individual").value;
  const rol = obtenerRolSeleccionado();
  const resCard = document.getElementById("resultado-control-individual");

  const payload = {
    operacion: "verificar_control",
    control: ctrlId,
    perfil: { organizacion: "UNSA", rol: rol },
    riesgos: riesgosUNSA,
    evidencias: evidenciasDocumentadas.map(e => ({
      control: e.control,
      descripcion: `[${e.archivo}] ${e.descripcion}`,
      estado: e.estado
    }))
  };

  let res = null;
  try {
    const resp = await fetch(`${API_BASE}/api/controles/ejecutar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (resp.ok) res = await resp.json();
  } catch (err) {}

  if (!res) res = ejecutarMotorLocal(payload);

  const d = res.datos || {};
  let badgeClass = d.estado === "implementado" ? "imp" : (d.estado === "parcial" ? "parc" : (d.estado === "no implementado" ? "gap" : "exc"));
  let textoEstado = d.estado === "implementado" ? "Implementado" : (d.estado === "parcial" ? "Parcial" : (d.estado === "no implementado" ? "Brecha" : "No Aplica"));

  resCard.style.display = "block";
  resCard.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
      <div>
        <span class="code-ctrl" style="font-size:14px;">${d.control}</span> — <strong style="font-size:14px;">${d.nombre}</strong>
      </div>
      <span class="badge-status-clean ${badgeClass}">${textoEstado}</span>
    </div>
    <div style="font-size:12.5px; color:var(--ink-muted); margin-bottom:8px;">
      <strong>Justificación:</strong> ${d.justificacion}
    </div>
    <div style="font-size:12.5px; color:var(--ink-muted); margin-bottom:10px;">
      <strong>Evidencias registradas:</strong> ${d.evidencias && d.evidencias.length ? d.evidencias.join(", ") : "Ninguna documental verificada"}
    </div>
    <div style="background:var(--surface-subtle); padding:10px 14px; border-radius:6px; border-left:3px solid var(--primary); font-size:12.5px;">
      <strong>Recomendación Técnica:</strong> ${d.recomendacion || res.respuesta}
      <div style="margin-top:4px; font-size:11.5px; color:var(--ink-subtle);">Remitir solicitud a: <strong>${d.responsable}</strong></div>
    </div>
  `;
}

// 10. Ventana 3: Buscador Semántico RAG & Hugging Face
function initBuscadorRAG() {
  const input = document.getElementById("txt-rag-query");
  const btn = document.getElementById("btn-rag-buscar");
  const chips = document.querySelectorAll(".rag-chip");

  if (!input || !btn) return;

  btn.addEventListener("click", () => ejecutarBusquedaRAG(input.value.trim()));
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") ejecutarBusquedaRAG(input.value.trim());
  });

  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      input.value = chip.dataset.query;
      ejecutarBusquedaRAG(chip.dataset.query);
    });
  });
}

async function ejecutarBusquedaRAG(query) {
  const container = document.getElementById("contenedor-rag-resultados");
  if (!query) {
    container.innerHTML = `<div style="text-align:center; color:var(--ink-subtle); padding:20px;">Por favor ingrese un término de búsqueda.</div>`;
    return;
  }

  container.innerHTML = `<div style="text-align:center; color:var(--ink-muted); padding:25px;">Analizando consulta semántica y recuperando directivas con Hugging Face...</div>`;

  let hits = [];
  let respuestaDirecta = "";
  let motorUtilizado = "Modelo Hugging Face + Síntesis Determinista";

  // Intento vía API Backend Flask (SentenceTransformers, FAISS y Ollama si está activo)
  try {
    const resp = await fetch(`${API_BASE}/api/controles/ejecutar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operacion: "consultar", solicitud: query })
    });
    if (resp.ok) {
      const data = await resp.json();
      if (data.datos && data.datos.respuesta_directa) {
        respuestaDirecta = data.datos.respuesta_directa;
      } else if (data.respuesta && data.estado === "ok") {
        respuestaDirecta = data.respuesta;
      }

      if (data.datos && Array.isArray(data.datos.hits) && data.datos.hits.length) {
        hits = data.datos.hits;
      } else if (data.fuentes && data.fuentes.length) {
        hits = [{ meta: data.fuentes.join(", "), score: data.confianza || 0.85, texto: data.respuesta }];
      }

      motorUtilizado = "Hugging Face (MiniLM-L12) + IA Generativa";
    }
  } catch (err) {}

  // Fallback semántico local en caso de desconexión
  if (!hits.length) {
    const qLower = query.toLowerCase();
    hits = KNOWLEDGE_FALLBACK.map(item => {
      let matchCount = item.keywords.filter(k => qLower.includes(k)).length;
      let score = matchCount > 0 ? Math.min(0.95, 0.45 + (matchCount * 0.15)) : 0.25;
      return { meta: item.meta, score: score, texto: item.texto };
    }).sort((a, b) => b.score - a.score).filter(h => h.score >= 0.35);

    if (hits.length) {
      respuestaDirecta = `De acuerdo con la directiva institucional **${hits[0].meta}**:\n\n${hits[0].texto}`;
      motorUtilizado = "Base de Conocimiento Local Institucional";
    }
  }

  if (!hits.length && !respuestaDirecta) {
    container.innerHTML = `
      <div style="background:#ffffff; border:1px solid var(--border); padding:24px; border-radius:var(--radius-md); text-align:center; color:var(--ink-subtle);">
        No se encontraron directivas o cláusulas con suficiente afinidad para la consulta ingresada.
      </div>
    `;
    return;
  }

  container.innerHTML = "";

  // 1. Tarjeta Destacada con la Respuesta Directa al Auditor
  if (respuestaDirecta) {
    const answerCard = document.createElement("div");
    answerCard.className = "rag-answer-box";
    answerCard.innerHTML = `
      <div class="rag-answer-header">
        <div class="rag-answer-title">
          <span>Respuesta Fundamentada al Auditor</span>
        </div>
        <span class="rag-answer-badge">${motorUtilizado}</span>
      </div>
      <div class="rag-answer-body">${formatearTextoMarkdown(respuestaDirecta)}</div>
    `;
    container.appendChild(answerCard);
  }

  // 2. Divisor de Fuentes y Evidencias
  if (hits.length) {
    const divider = document.createElement("div");
    divider.className = "rag-sources-divider";
    divider.innerHTML = `<span>Cláusulas y Directivas Oficiales Recuperadas (${hits.length}):</span>`;
    container.appendChild(divider);

    // 3. Tarjetas de Fragmentos Recuperados
    hits.forEach(h => {
      const card = document.createElement("div");
      card.className = "rag-hit-card";
      const scorePct = Math.round((h.score || 0.8) * 100);

      card.innerHTML = `
        <div class="rag-hit-header">
          <span class="rag-hit-source">${h.meta}</span>
          <span class="rag-hit-score-badge">Afinidad: ${scorePct}%</span>
        </div>
        <div class="rag-hit-text">${h.texto}</div>
      `;
      container.appendChild(card);
    });
  }
}

// Formateador simple de negritas y saltos de línea para el texto generado
function formatearTextoMarkdown(txt) {
  if (!txt) return "";
  return txt
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}

function exportarJson() {
  if (!resultadoSoAUltimo) return;
  const blob = new Blob([JSON.stringify(resultadoSoAUltimo, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `SoA_UNSA_ISO27701_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
}
