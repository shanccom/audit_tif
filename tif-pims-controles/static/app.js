// Sistema de Auditoría PIMS - ISO/IEC 27701:2025
// Universidad Nacional de San Agustín de Arequipa (UNSA)

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

// Mapeo semántico oficial de la Política de Privacidad de la UNSA (politica_privacidad_unsa.md)
const POLITICAS_MAP = {
  "A.1.2.2": "Política UNSA - Finalidad de Datos de Estudiantes y Comedor Universitario",
  "A.1.2.9": "Política UNSA - Bancos de Datos Personales Registrados (RAT Institucional)",
  "A.1.2.6": "Política UNSA - Evaluación de Impacto (DPIA) y Acceso a Comedor Universitario",
  "A.1.2.7": "Política UNSA - Gestión de Terceros, Proveedores y Transferencias",
  "A.1.3.7": "Política UNSA - Ejercicio de Derechos ARCO (Mesa de Partes y odp@unsa.edu.pe)",
  "A.1.3.9": "Política UNSA - Ejercicio de Derechos ARCO (Mesa de Partes y odp@unsa.edu.pe)",
  "A.2.5.7": "Política UNSA - Gestión de Terceros, Proveedores y Transferencias",
  "A.3.11": "Política UNSA - Seguridad de la Información, Vigilancia y Control de Incidentes",
  "A.3.12": "Política UNSA - Seguridad de la Información, Vigilancia y Control de Incidentes",
  "A.3.17": "Política UNSA - Datos de Docentes, Personal y Aula Virtual"
};

// Evidencias Documentales Oficiales de la UNSA (Archivos Reales en knowledge/evidencias/)
let evidenciasDocumentadas = [
  {
    control: "A.1.2.2",
    archivo: "reglamento_matricula_2020_modi.pdf",
    descripcion: "Reglamento General de Matrícula (RCU N° 0127-2020): Fines académicos legítimos, deberes de estudiantes y registro en SISUNSA",
    estado: "implementado"
  },
  {
    control: "A.1.2.2",
    archivo: "Declaracion-Jurada-Admision-Mayor-Edad.pdf",
    descripcion: "SISADMISION: Cláusula de consentimiento informado previo y tratamiento biométrico de postulantes (DUA-UNSA)",
    estado: "implementado"
  },
  {
    control: "A.1.2.9",
    archivo: "Compilacion-Resoluciones-Sistemas-Oficiales-UNSA.pdf",
    descripcion: "Resoluciones de Consejo Universitario (RCU 0127-2020, RCU 0009-2026): Registro oficial RAT de bancos de datos SISUNSA y Campus Virtual",
    estado: "implementado"
  },
  {
    control: "A.1.2.6",
    archivo: "RCU-0127-2025-Reglamento-Comedor-Universitario.pdf",
    descripcion: "Reglamento de Comedor Universitario (RCU N° 0127-2025 - DUDE): DPIA para validación socioeconómica y huellas dactilares de comensales",
    estado: "parcial"
  },
  {
    control: "A.1.3.7",
    archivo: "TUPA-Procedimiento-Derechos-ARCO-UNSA.pdf",
    descripcion: "TUPA Institucional: Procedimiento oficial de Derechos ARCO ante Secretaría General (San Agustín 115) y odp@unsa.edu.pe",
    estado: "implementado"
  },
  {
    control: "A.1.3.9",
    archivo: "TUPA-Procedimiento-Derechos-ARCO-UNSA.pdf",
    descripcion: "TUPA Institucional: Expedición de constancias y copia legible de PII para estudiantes y egresados agustinos",
    estado: "implementado"
  },
  {
    control: "A.1.2.7",
    archivo: "Contrato-DPA-Google-Workspace-UNSA.pdf",
    descripcion: "Acuerdo de Protección de Datos (DPA) para servicio de correo @unsa.edu.pe y almacenamiento educativo",
    estado: "implementado"
  },
  {
    control: "A.3.12",
    archivo: "Protocolo-Seguridad-CSIRT-UNSA-v0.2.docx",
    descripcion: "Borrador de protocolo de contención y contingencia ante brechas en banco de datos Seguridad y Vigilancia (OTI-UNSA)",
    estado: "parcial"
  }
];

// Riesgos registrados de la UNSA
const riesgosUNSA = [
  {
    id: "R-UNSA-01",
    descripcion: "Riesgo de acceso no autorizado o filtración de notas y DNI en SISUNSA",
    controles: ["A.1.2.6", "A.3.12"]
  },
  {
    id: "R-UNSA-02",
    descripcion: "Tratamiento de huellas dactilares en Comedor Universitario sin DPIA completo",
    controles: ["A.1.2.6"]
  },
  {
    id: "R-UNSA-03",
    descripcion: "Demora en tramitación de solicitudes de acceso y rectificación de datos (ARCO)",
    controles: ["A.1.3.7", "A.1.3.9"]
  }
];

let catalogoActual = CATALOGO_BASE;
let filtroTablaSoA = "todos";
let resultadoSoAUltimo = null;
let servidorOnline = false;

// Inicialización
document.addEventListener("DOMContentLoaded", async () => {
  initNavegacionPestanas();
  initSelectorRoles();
  renderRiesgosResumen();
  renderTablaEvidencias();
  initFormularioNuevaEvidencia();
  initPresetsJSON();
  initSimuladorMAS();
  initChatAsistente();
  await verificarConexionServidor();
  poblarSelectsControles();

  document.getElementById("btn-generar-soa").addEventListener("click", ejecutarSoA);
  document.getElementById("btn-auditar-individual").addEventListener("click", auditarControlPuntual);
  document.getElementById("btn-enviar-json").addEventListener("click", procesarJsonDirecto);
  document.getElementById("btn-descargar-json").addEventListener("click", exportarJson);
  document.getElementById("btn-imprimir-reporte").addEventListener("click", () => window.print());
});

// 1. Verificación de Conectividad con Flask
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
      statusText.textContent = "Agente en Línea (API :5000)";
      serverAlert.style.display = "none";
      return;
    }
  } catch (err) {
    // Servidor no disponible
  }

  servidorOnline = false;
  statusDot.className = "status-dot offline";
  statusText.textContent = "Modo Local Autónomo";
  serverAlert.style.display = "block";
}

// 2. Navegación entre Pestañas
function initNavegacionPestanas() {
  const tabs = document.querySelectorAll(".nav-tab-item");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      const target = document.getElementById(tab.dataset.tab);
      if (target) target.classList.add("active");
    });
  });
}

// 3. Selector de Roles
function initSelectorRoles() {
  const radios = document.querySelectorAll("input[name='rol-eval']");
  radios.forEach(r => {
    r.addEventListener("change", () => {
      document.querySelectorAll(".role-opt").forEach(opt => opt.classList.remove("selected"));
      const parent = r.closest(".role-opt");
      if (parent) parent.classList.add("selected");
    });
  });
}

function obtenerRolSeleccionado() {
  const checked = document.querySelector("input[name='rol-eval']:checked");
  return checked ? checked.value : "responsable";
}

// 4. Renderizado de Riesgos
function renderRiesgosResumen() {
  const box = document.getElementById("contenedor-riesgos-resumen");
  if (!box) return;
  box.innerHTML = "";
  riesgosUNSA.forEach(r => {
    const item = document.createElement("div");
    item.className = "risk-summary-item";
    item.innerHTML = `<strong>${r.id}:</strong> ${r.descripcion} <br/><span class="agent-tag">Controles requeridos: ${r.controles.join(", ")}</span>`;
    box.appendChild(item);
  });
}

// 5. Lista Espaciosa de Artefactos Probatorios
function renderTablaEvidencias() {
  const container = document.getElementById("contenedor-artefactos");
  if (!container) return;
  container.innerHTML = "";

  if (evidenciasDocumentadas.length === 0) {
    container.innerHTML = `<div class="empty-artifacts">No hay artefactos documentados registrados para este ciclo de auditoría.</div>`;
    return;
  }

  evidenciasDocumentadas.forEach((e, idx) => {
    const card = document.createElement("div");
    card.className = "artifact-card";
    
    // Extensión del archivo para la etiqueta de formato
    const extension = e.archivo.split(".").pop().toUpperCase();
    const textoEstado = e.estado === "implementado" ? "Documento Oficial Vigente" : "Borrador en Revisión";

    card.innerHTML = `
      <div class="artifact-header-row">
        <div class="artifact-title-group">
          <span class="file-ext-tag">${extension}</span>
          <span class="artifact-filename">${e.archivo}</span>
          <span class="artifact-control-badge">Control ${e.control}</span>
        </div>
        <div class="artifact-actions-group">
          <span class="artifact-status-pill">${textoEstado}</span>
          <button class="btn-del-artifact" data-index="${idx}" title="Eliminar este documento de la auditoría">Eliminar</button>
        </div>
      </div>
      <div class="artifact-description-text">${e.descripcion}</div>
    `;

    card.querySelector(".btn-del-artifact").addEventListener("click", (evt) => {
      const i = parseInt(evt.target.dataset.index, 10);
      evidenciasDocumentadas.splice(i, 1);
      renderTablaEvidencias();
    });

    container.appendChild(card);
  });
}

// 6. Formulario para Agregar Evidencias
function initFormularioNuevaEvidencia() {
  const btnAbrir = document.getElementById("btn-abrir-modal-evidencia");
  const subform = document.getElementById("form-registro-rapido");
  const btnCancelar = document.getElementById("btn-cancelar-documento");
  const btnGuardar = document.getElementById("btn-guardar-documento");

  btnAbrir.addEventListener("click", () => {
    subform.style.display = "block";
    subform.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
      alert("Por favor ingrese el nombre del archivo y una breve descripción del documento probatorio.");
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
    renderTablaEvidencias();
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

// 7. Ejecutar Evaluación de la SoA
async function ejecutarSoA() {
  const org = document.getElementById("input-org").value.trim() || "Universidad Nacional de San Agustín (UNSA)";
  const rol = obtenerRolSeleccionado();

  const payload = {
    operacion: "generar_soa",
    perfil: { organizacion: org, rol: rol },
    riesgos: riesgosUNSA,
    evidencias: evidenciasDocumentadas.map(e => ({
      control: e.control,
      descripcion: `[Archivo: ${e.archivo}] ${e.descripcion}`,
      estado: e.estado
    }))
  };

  await procesarPayload(payload);
}

// 8. Procesamiento con Fallback Determinista Inteligente
async function procesarPayload(payload) {
  let resultado = null;

  // Intento 1: Llamada al backend Flask
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
    // Si falla la red, usamos el motor determinista local
  }

  // Intento 2 (Fallback): Motor determinista local equivalente
  if (!resultado) {
    resultado = ejecutarMotorLocal(payload);
  }

  renderizarResultadosSoA(resultado);
}

// Motor Determinista de Contingencia en JavaScript (Misma lógica matemática que agentes/controles.py)
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
      respuesta: `Control ${fila.control}: ${fila.estado}. Recomendación: ${fila.recomendacion}`,
      datos: fila,
      fuentes: ["catalogo_controles.json", "DIR-OTIC-004-UNSA.md"],
      confianza: 1.0,
      requiere_revision_humana: true
    };
  }

  // Generar SoA Completa
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

  const org = perfil.organizacion || "Universidad Nacional de San Agustín (UNSA)";
  const texto = `SoA generada para ${org} (rol: ${rol}). Controles evaluados: ${resumen.controles_evaluados}; aplican: ${resumen.aplican}; implementados: ${resumen.implementados}; brechas: ${brechas.length}. Requiere revisión formal.`;

  return {
    agente: "controles",
    operacion: "generar_soa",
    estado: "ok",
    respuesta: texto,
    datos: { soa, brechas, resumen },
    fuentes: ["catalogo_controles.json", "DIR-OTIC-004-UNSA.md"],
    confianza: 1.0,
    requiere_revision_humana: true
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
      justificacion = "Excluido: la UNSA no actúa como encargada (controles del grupo A.2).";
    }
  }

  // Vincular Riesgos
  const vinculados = riesgos.filter(r => (r.controles || []).includes(control.id)).map(r => r.id);
  if (aplica && vinculados.length > 0) {
    justificacion += ` Vinculado a los riesgos: ${vinculados.join(", ")}.`;
  }

  // Evaluar Evidencias
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
  if (fila.estado === "implementado") return "Mantener la evidencia vigente y archivarla para la auditoría interna (Cláusula 9.2).";
  if (fila.estado === "parcial") return `Completar los requisitos pendientes y solicitar actualización al ${fila.responsable}.`;
  return `Solicitar formalmente la evidencia documental al ${fila.responsable}.`;
}

// 9. Renderizar Resultados en Pantalla
function renderizarResultadosSoA(res) {
  const panel = document.getElementById("panel-resultados-soa");
  panel.style.display = "block";
  panel.scrollIntoView({ behavior: "smooth", block: "start" });

  resultadoSoAUltimo = res;

  document.getElementById("lbl-subtitulo-soa").textContent = res.respuesta || "";

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

  // Render Tabla y Brechas
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

    let textoEstadoFormal = "Excluido (No Aplica)";
    let statusClass = "audit-tag-excluido";

    if (f.estado === "implementado") {
      textoEstadoFormal = "Conforme (Implementado)";
      statusClass = "audit-tag-conforme";
    } else if (f.estado === "parcial") {
      textoEstadoFormal = "En Proceso (Parcial)";
      statusClass = "audit-tag-proceso";
    } else if (f.estado === "no implementado") {
      textoEstadoFormal = "Pendiente de Subsanación";
      statusClass = "audit-tag-pendiente";
    }

    let textoEvidencias = "<span class='text-muted-subtle'>Sin documento registrado</span>";
    if (f.evidencias && f.evidencias.length > 0) {
      textoEvidencias = f.evidencias.map(doc => `<div class="doc-line-item">• ${doc}</div>`).join("");
    }

    let textoPolitica = "<span class='text-muted-subtle'>–</span>";
    if (f.politica_relacionada) {
      textoPolitica = `<div class="directiva-box">${f.politica_relacionada}</div>`;
    }

    tr.innerHTML = `
      <td><span class="control-code">${f.control}</span></td>
      <td><strong>${f.nombre}</strong></td>
      <td style="text-align:center;">${f.aplica ? "Sí" : "No"}</td>
      <td style="color:#334155;">${f.justificacion}</td>
      <td><span class="audit-status-label ${statusClass}">${textoEstadoFormal}</span></td>
      <td>${textoEvidencias}</td>
      <td>${textoPolitica}</td>
      <td><span class="agent-tag">${f.responsable}</span></td>
    `;

    tbody.appendChild(tr);
  });
}

function renderItemsBrechas(brechas) {
  const container = document.getElementById("contenedor-items-brechas");
  container.innerHTML = "";

  if (!brechas || brechas.length === 0) {
    container.innerHTML = "<p style='color:#065f46; font-weight:600;'>No se detectaron brechas de cumplimiento para el alcance actual.</p>";
    return;
  }

  brechas.forEach(b => {
    const card = document.createElement("div");
    card.className = "gap-card";
    card.innerHTML = `
      <strong>${b.control}: ${b.nombre}</strong>
      <div>Estado actual: <em>${b.estado}</em></div>
      <div class="assigned">Solicitar subsanación a: <span>${b.solicitar_a}</span></div>
    `;
    container.appendChild(card);
  });
}

function initFiltrosSoA(filas) {
  const pills = document.querySelectorAll(".filter-pill");
  pills.forEach(p => {
    p.onclick = () => {
      pills.forEach(x => x.classList.remove("active"));
      p.classList.add("active");
      filtroTablaSoA = p.dataset.filter;
      renderFilasSoA(filas);
    };
  });
}

// 10. Presets JSON y Simulador Multi-Agente (MAS)
const METADATA_AGENTES_MAS = {
  agente_inventario_output: {
    nombre: "📋 Agente de Inventario y Activos (UNSA)",
    tag: "RAT & Activos",
    desc: "Salida del Agente de Inventario: Mapeo de sistemas institucionales (SISUNSA, Comedor, Admisión) y Banco de Datos RAT. Alimenta A.1.2.2 y A.1.2.9.",
    archivo: "agente_inventario_output.json"
  },
  agente_riesgos_output: {
    nombre: "⚠️ Agente de Gestión de Riesgos de Privacidad",
    tag: "ISO 27005",
    desc: "Salida del Agente de Riesgos: Matriz de riesgos de privacidad (R-UNSA-01 a R-UNSA-03) evaluada bajo ISO/IEC 27005. Alimenta A.1.2.6 y A.3.12.",
    archivo: "agente_riesgos_output.json"
  },
  agente_terceros_output: {
    nombre: "🤝 Agente de Terceros y Transferencias",
    tag: "DPA & Proveedores",
    desc: "Salida del Agente de Terceros: Auditoría de contratos con encargados y Data Processing Addendum (DPA Google Workspace). Alimenta A.1.2.7 y A.2.5.7.",
    archivo: "agente_terceros_output.json"
  },
  agente_derechos_output: {
    nombre: "⚖️ Agente de Derechos ARCO",
    tag: "ARCO Ley 29733",
    desc: "Salida del Agente de Derechos: Procedimientos y canales formales de atención ARCO (Mesa de Partes San Agustín 115 y odp@unsa.edu.pe). Alimenta A.1.3.7 y A.1.3.9.",
    archivo: "agente_derechos_output.json"
  },
  agente_evidencia_output: {
    nombre: "📂 Agente de Repositorio Probatorio",
    tag: "8 PDFs / SHA-256",
    desc: "Salida del Agente de Evidencia: 8 artefactos probatorios oficiales con verificación criptográfica SHA-256 e indexación FAISS.",
    archivo: "agente_evidencia_output.json"
  },
  payload_consolidado_n8n: {
    nombre: "🔄 Orquestador n8n (Payload Consolidado)",
    tag: "Orquestador MAS",
    desc: "Contrato consolidado por el bus n8n listo para enviar al Agente de Controles y generar la SoA bajo ISO/IEC 27701:2025.",
    archivo: "payload_consolidado_n8n.json"
  }
};

const PAYLOAD_CONSOLIDADO_FALLBACK = {
  "orquestador": "n8n_pims_workflow",
  "version_pipeline": "2.4.0",
  "timestamp": "2026-10-14T08:45:00Z",
  "operacion": "generar_soa",
  "perfil": {
    "organizacion": "Universidad Nacional de San Agustín de Arequipa (UNSA)",
    "rol": "responsable",
    "ruc": "20144908078",
    "domicilio": "Calle Santa Catalina N° 117, Cercado de Arequipa",
    "alcance": "Procesos Misionales de Formación Académica, Admisión e Investigación, y Procesos de Apoyo de OTI, DUDE y Secretaría General"
  },
  "riesgos": [
    {
      "id": "R-UNSA-01",
      "descripcion": "Riesgo de acceso no autorizado o filtración de notas y DNI en SISUNSA",
      "controles": ["A.1.2.6", "A.3.12"]
    },
    {
      "id": "R-UNSA-02",
      "descripcion": "Tratamiento de huellas dactilares en Comedor Universitario sin DPIA completo",
      "controles": ["A.1.2.6"]
    },
    {
      "id": "R-UNSA-03",
      "descripcion": "Demora en tramitación de solicitudes de acceso y rectificación de datos (ARCO)",
      "controles": ["A.1.3.7", "A.1.3.9"]
    }
  ],
  "evidencias": [
    {
      "control": "A.1.2.2",
      "archivo": "reglamento_matricula_2020_modi.pdf",
      "descripcion": "[Archivo: reglamento_matricula_2020_modi.pdf] Reglamento General de Matrícula (RCU N° 0127-2020): Fines académicos legítimos, deberes de estudiantes y registro en SISUNSA",
      "estado": "implementado"
    },
    {
      "control": "A.1.2.2",
      "archivo": "Declaracion-Jurada-Admision-Mayor-Edad.pdf",
      "descripcion": "[Archivo: Declaracion-Jurada-Admision-Mayor-Edad.pdf] SISADMISION: Cláusula de consentimiento informado previo y tratamiento biométrico de postulantes (DUA-UNSA)",
      "estado": "implementado"
    },
    {
      "control": "A.1.2.9",
      "archivo": "Compilacion-Resoluciones-Sistemas-Oficiales-UNSA.pdf",
      "descripcion": "[Archivo: Compilacion-Resoluciones-Sistemas-Oficiales-UNSA.pdf] Resoluciones de Consejo Universitario (RCU 0127-2020, RCU 0009-2026): Registro oficial RAT de bancos de datos SISUNSA y Campus Virtual",
      "estado": "implementado"
    },
    {
      "control": "A.1.2.6",
      "archivo": "RCU-0127-2025-Reglamento-Comedor-Universitario.pdf",
      "descripcion": "[Archivo: RCU-0127-2025-Reglamento-Comedor-Universitario.pdf] Reglamento de Comedor Universitario (RCU N° 0127-2025 - DUDE): DPIA para validación socioeconómica y huellas dactilares de comensales",
      "estado": "parcial"
    },
    {
      "control": "A.1.3.7",
      "archivo": "TUPA-Procedimiento-Derechos-ARCO-UNSA.pdf",
      "descripcion": "[Archivo: TUPA-Procedimiento-Derechos-ARCO-UNSA.pdf] TUPA Institucional: Procedimiento oficial de Derechos ARCO ante Secretaría General (San Agustín 115) y odp@unsa.edu.pe",
      "estado": "implementado"
    },
    {
      "control": "A.1.3.9",
      "archivo": "TUPA-Procedimiento-Derechos-ARCO-UNSA.pdf",
      "descripcion": "[Archivo: TUPA-Procedimiento-Derechos-ARCO-UNSA.pdf] TUPA Institucional: Expedición de constancias y copia legible de PII para estudiantes y egresados agustinos",
      "estado": "implementado"
    },
    {
      "control": "A.1.2.7",
      "archivo": "Contrato-DPA-Google-Workspace-UNSA.pdf",
      "descripcion": "[Archivo: Contrato-DPA-Google-Workspace-UNSA.pdf] Acuerdo de Protección de Datos (DPA) para servicio de correo @unsa.edu.pe y almacenamiento educativo",
      "estado": "implementado"
    },
    {
      "control": "A.3.12",
      "archivo": "Protocolo-Seguridad-CSIRT-UNSA-v0.2.docx",
      "descripcion": "[Archivo: Protocolo-Seguridad-CSIRT-UNSA-v0.2.docx] Borrador de protocolo de contención y contingencia ante brechas en banco de datos Seguridad y Vigilancia (OTI-UNSA)",
      "estado": "parcial"
    }
  ]
};

function initPresetsJSON() {
  const select = document.getElementById("sel-preset-json");
  const txt = document.getElementById("txt-json-payload");
  if (!select || !txt) return;

  const presets = {
    pipeline_consolidado: PAYLOAD_CONSOLIDADO_FALLBACK,
    unsa_responsable: {
      operacion: "generar_soa",
      perfil: { organizacion: "Universidad Nacional de San Agustín (UNSA)", rol: "responsable" },
      riesgos: riesgosUNSA,
      evidencias: evidenciasDocumentadas.map(e => ({
        control: e.control,
        descripcion: `[Archivo: ${e.archivo}] ${e.descripcion}`,
        estado: e.estado
      }))
    },
    unsa_encargado: {
      operacion: "generar_soa",
      perfil: { organizacion: "UNSA - Centro de Cómputo", rol: "encargado" },
      riesgos: [],
      evidencias: [
        { control: "A.2.5.7", descripcion: "[Archivo: Clausula-Subprocesadores.pdf] Notificación formal", estado: "implementado" }
      ]
    },
    unsa_ambos: {
      operacion: "generar_soa",
      perfil: { organizacion: "Universidad Nacional de San Agustín (UNSA)", rol: "ambos" },
      riesgos: riesgosUNSA,
      evidencias: evidenciasDocumentadas.map(e => ({
        control: e.control,
        descripcion: `[Archivo: ${e.archivo}] ${e.descripcion}`,
        estado: e.estado
      }))
    },
    unsa_sin_evidencias: {
      operacion: "generar_soa",
      perfil: { organizacion: "Universidad Nacional de San Agustín (UNSA)", rol: "responsable" },
      riesgos: riesgosUNSA,
      evidencias: []
    }
  };

  select.addEventListener("change", () => {
    const val = select.value;
    if (val === "pipeline_consolidado") {
      activarTarjetaAgente("payload_consolidado_n8n");
      cargarJsonAgente("payload_consolidado_n8n");
    } else {
      desactivarTodasTarjetas();
      txt.value = JSON.stringify(presets[val], null, 2);
      const lblAgente = document.getElementById("lbl-inspector-agente");
      const lblDesc = document.getElementById("lbl-inspector-desc");
      if (lblAgente) lblAgente.textContent = `Escenario: ${select.options[select.selectedIndex].text}`;
      if (lblDesc) lblDesc.textContent = "Contrato preparado manualmente según escenario preconfigurado.";
    }
  });

  // Carga inicial
  cargarJsonAgente("payload_consolidado_n8n");
}

function initSimuladorMAS() {
  const cards = document.querySelectorAll(".mas-agent-card");
  cards.forEach(card => {
    card.addEventListener("click", () => {
      const agentKey = card.dataset.agent;
      activarTarjetaAgente(agentKey);
      cargarJsonAgente(agentKey);
    });
  });

  const btnOrquestar = document.getElementById("btn-orquestar-mas-n8n");
  if (btnOrquestar) {
    btnOrquestar.addEventListener("click", ejecutarPipelineMASCompleto);
  }

  const btnSimularSoa = document.getElementById("btn-ejecutar-simulacion-soa");
  if (btnSimularSoa) {
    btnSimularSoa.addEventListener("click", ejecutarPipelineMASCompleto);
  }

  const btnCopiar = document.getElementById("btn-copiar-json");
  if (btnCopiar) {
    btnCopiar.addEventListener("click", () => {
      const txt = document.getElementById("txt-json-payload");
      if (txt) {
        navigator.clipboard.writeText(txt.value).then(() => {
          const original = btnCopiar.textContent;
          btnCopiar.textContent = "✅ ¡Copiado!";
          setTimeout(() => { btnCopiar.textContent = original; }, 2000);
        }).catch(() => {
          alert("No se pudo copiar automáticamente. Por favor use Ctrl+C.");
        });
      }
    });
  }

  const btnRestaurar = document.getElementById("btn-restaurar-consolidado");
  if (btnRestaurar) {
    btnRestaurar.addEventListener("click", () => {
      activarTarjetaAgente("payload_consolidado_n8n");
      cargarJsonAgente("payload_consolidado_n8n");
    });
  }
}

function activarTarjetaAgente(agentKey) {
  const cards = document.querySelectorAll(".mas-agent-card");
  cards.forEach(c => {
    if (c.dataset.agent === agentKey) {
      c.classList.add("active");
    } else {
      c.classList.remove("active");
    }
  });
}

function desactivarTodasTarjetas() {
  document.querySelectorAll(".mas-agent-card").forEach(c => c.classList.remove("active"));
}

async function cargarJsonAgente(agenteKey) {
  const meta = METADATA_AGENTES_MAS[agenteKey];
  if (!meta) return;

  const lblAgente = document.getElementById("lbl-inspector-agente");
  const lblDesc = document.getElementById("lbl-inspector-desc");
  const txtArea = document.getElementById("txt-json-payload");

  if (lblAgente) lblAgente.textContent = meta.nombre;
  if (lblDesc) lblDesc.textContent = meta.desc;

  try {
    const res = await fetch(`${API_BASE}/api/simulacion/agente/${meta.archivo}`);
    if (res.ok) {
      const data = await res.json();
      if (txtArea) txtArea.value = JSON.stringify(data, null, 2);
      return;
    }
  } catch (err) {
    // Si falla fetch, usamos fallback
  }

  if (txtArea) {
    if (agenteKey === "payload_consolidado_n8n") {
      txtArea.value = JSON.stringify(PAYLOAD_CONSOLIDADO_FALLBACK, null, 2);
    } else {
      txtArea.value = JSON.stringify({
        simulacion_local: true,
        agente: meta.nombre,
        archivo: `knowledge/simulacion_agentes/${meta.archivo}`,
        nota: "Inicie el servidor Flask (python app.py) para cargar el JSON dinámico completo desde disco."
      }, null, 2);
    }
  }
}

async function ejecutarPipelineMASCompleto() {
  activarTarjetaAgente("payload_consolidado_n8n");

  let payload = null;
  try {
    const res = await fetch(`${API_BASE}/api/simulacion/agente/payload_consolidado_n8n.json`);
    if (res.ok) {
      payload = await res.json();
    }
  } catch (e) {}

  if (!payload) {
    payload = PAYLOAD_CONSOLIDADO_FALLBACK;
  }

  const txtArea = document.getElementById("txt-json-payload");
  if (txtArea) {
    txtArea.value = JSON.stringify(payload, null, 2);
  }

  const lblAgente = document.getElementById("lbl-inspector-agente");
  const lblDesc = document.getElementById("lbl-inspector-desc");
  if (lblAgente) lblAgente.textContent = "🔄 Pipeline n8n Consolidado -> Agente de Controles";
  if (lblDesc) lblDesc.textContent = "Ejecutando síntesis determinista de SoA con las 5 entradas de agentes.";

  await procesarPayload(payload);
}

async function procesarJsonDirecto() {
  const txt = document.getElementById("txt-json-payload");
  try {
    const payload = JSON.parse(txt.value);
    if (!payload.operacion) {
      alert(`⚠️ El JSON visualizado corresponde a la salida de un agente individual (${payload.agente || payload.agente_emisor || 'Agente upstream'}).\n\nPara ejecutar la evaluación de controles de la UNSA y generar la Declaración de Aplicabilidad (SoA), presione "🔄 Cargar Consolidado n8n" o "🚀 Ejecutar Pipeline MAS Completo".`);
      return;
    }
    await procesarPayload(payload);
  } catch (e) {
    alert("El formato JSON ingresado no es válido: " + e.message);
  }
}

async function auditarControlPuntual() {
  const ctrl = document.getElementById("sel-control-individual").value;
  const rol = obtenerRolSeleccionado();

  const payload = {
    operacion: "verificar_control",
    control: ctrl,
    perfil: { organizacion: "UNSA", rol: rol },
    riesgos: riesgosUNSA,
    evidencias: evidenciasDocumentadas.map(e => ({
      control: e.control,
      descripcion: `[Archivo: ${e.archivo}] ${e.descripcion}`,
      estado: e.estado
    }))
  };

  await procesarPayload(payload);
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

// 11. Asistente Virtual de Privacidad (Chat IA Local / RAG)
function initChatAsistente() {
  const btnEnviar = document.getElementById("btn-enviar-chat");
  const txtInput = document.getElementById("txt-chat-pregunta");
  const viewport = document.getElementById("chat-viewport");
  const chips = document.querySelectorAll(".chip-btn");

  if (!btnEnviar || !txtInput || !viewport) return;

  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      const q = chip.dataset.query;
      txtInput.value = q;
      enviarMensajeChat(q);
    });
  });

  btnEnviar.addEventListener("click", () => {
    const q = txtInput.value.trim();
    if (q) enviarMensajeChat(q);
  });

  txtInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const q = txtInput.value.trim();
      if (q) enviarMensajeChat(q);
    }
  });

  async function enviarMensajeChat(pregunta) {
    txtInput.value = "";
    txtInput.disabled = true;
    btnEnviar.disabled = true;

    // 1. Burbuja de usuario
    const userRow = document.createElement("div");
    userRow.className = "chat-bubble-row user";
    const hora = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    userRow.innerHTML = `
      <div class="chat-avatar user-avatar">👤</div>
      <div class="chat-bubble user-bubble">
        <div class="bubble-header">
          <strong>Auditor / Usuario</strong>
          <span class="bubble-time">${hora}</span>
        </div>
        <div class="bubble-content">
          <p>${escaparHTML(pregunta)}</p>
        </div>
      </div>
    `;
    viewport.appendChild(userRow);
    viewport.scrollTop = viewport.scrollHeight;

    // 2. Indicador de análisis con modelo local
    const typingRow = document.createElement("div");
    typingRow.className = "chat-bubble-row bot typing-indicator-row";
    typingRow.id = "chat-typing-row";
    typingRow.innerHTML = `
      <div class="chat-avatar bot-avatar">🤖</div>
      <div class="chat-bubble bot-bubble">
        <span class="typing-indicator">⚙️ Analizando consulta con modelo local MiniLM-L12 y base vectorial FAISS...</span>
      </div>
    `;
    viewport.appendChild(typingRow);
    viewport.scrollTop = viewport.scrollHeight;

    // 3. Consultar backend Flask
    let respuesta = null;
    try {
      const res = await fetch(`${API_BASE}/api/controles/ejecutar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operacion: "consultar", solicitud: pregunta })
      });
      if (res.ok) {
        respuesta = await res.json();
      }
    } catch (e) {}

    // Fallback local en caso de desconexión
    if (!respuesta) {
      respuesta = {
        estado: "ok",
        respuesta: "El motor de inferencia semántica opera mediante el servidor local Python con SentenceTransformer y FAISS. Para activar el modelo en memoria ejecute 'python app.py' en su terminal.",
        fuentes: ["catalogo_controles.json", "DIR-OTIC-004-UNSA.md"],
        confianza: 0.90
      };
    }

    // Remover indicador de escritura
    const typingEl = document.getElementById("chat-typing-row");
    if (typingEl) typingEl.remove();

    // 4. Burbuja del Asistente
    const botRow = document.createElement("div");
    botRow.className = "chat-bubble-row bot";
    const horaBot = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const parrafos = (respuesta.respuesta || "Sin respuesta disponible.")
      .split("\n\n")
      .filter(p => p.trim())
      .map(p => `<p>${escaparHTML(p)}</p>`)
      .join("");

    const fuentesHTML = (respuesta.fuentes || [])
      .map(f => `<span class="bubble-source-pill">📄 ${escaparHTML(f)}</span>`)
      .join(" ");

    const confPct = respuesta.confianza ? (respuesta.confianza * 100).toFixed(1) : "N/A";

    botRow.innerHTML = `
      <div class="chat-avatar bot-avatar">🤖</div>
      <div class="chat-bubble bot-bubble">
        <div class="bubble-header">
          <strong>Asistente PIMS (RAG Local)</strong>
          <span class="bubble-time">${horaBot}</span>
        </div>
        <div class="bubble-content">
          ${parrafos}
          <div class="bubble-meta-row">
            <span class="bubble-conf-pill">Precisión Semántica: ${confPct}%</span>
            ${fuentesHTML}
            <span class="bubble-hitl-tag">Supervisión DPO (Cl. 5.1)</span>
          </div>
        </div>
      </div>
    `;

    viewport.appendChild(botRow);
    viewport.scrollTop = viewport.scrollHeight;

    txtInput.disabled = false;
    btnEnviar.disabled = false;
    txtInput.focus();
  }
}

function escaparHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
