// Sistema de Auditoría PIMS - ISO/IEC 27701:2025
// Universidad Nacional de San Agustín de Arequipa (UNSA)
// Motor de Frontend y Gestión de Usabilidad

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
let busquedaFiltroSoA = "";
let resultadoSoAUltimo = null;
let servidorOnline = false;

// Inicialización de la aplicación
document.addEventListener("DOMContentLoaded", async () => {
  initNavegacionPestanas();
  initSelectorRoles();
  initModalGuia();
  renderRiesgosResumen();
  renderTablaEvidencias();
  initFormularioNuevaEvidencia();
  initPresetsJSON();
  initBuscadorSoA();
  await verificarConexionServidor();
  poblarSelectsControles();

  document.getElementById("btn-generar-soa").addEventListener("click", ejecutarSoA);
  document.getElementById("btn-auditar-individual").addEventListener("click", auditarControlPuntual);
  document.getElementById("btn-enviar-json").addEventListener("click", procesarJsonDirecto);
  document.getElementById("btn-descargar-json").addEventListener("click", exportarJson);
  document.getElementById("btn-imprimir-reporte").addEventListener("click", () => window.print());
});

// 1. Verificación de Conectividad con el Backend Flask
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
      statusText.textContent = "Agente Conectado (:5000)";
      serverAlert.style.display = "none";
      return;
    }
  } catch (err) {
    // Backend no disponible
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

// 3. Selector de Roles (Tarjetas Interactivas)
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

// 4. Modal de Guía Rápida de Usabilidad
function initModalGuia() {
  const btnAbrir = document.getElementById("btn-abrir-guia");
  const btnCerrar = document.getElementById("btn-cerrar-guia");
  const modal = document.getElementById("modal-guia");

  if (btnAbrir && modal) {
    btnAbrir.addEventListener("click", () => {
      modal.style.display = "flex";
    });
  }

  if (btnCerrar && modal) {
    btnCerrar.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.style.display = "none";
    });
  }
}

// 5. Renderizado de Riesgos
function renderRiesgosResumen() {
  const box = document.getElementById("contenedor-riesgos-resumen");
  if (!box) return;
  box.innerHTML = "";
  riesgosUNSA.forEach(r => {
    const item = document.createElement("div");
    item.className = "risk-summary-item";
    item.innerHTML = `
      <div><span class="risk-id-tag">${r.id}</span> <strong>${r.descripcion}</strong></div>
      <div><span class="agent-tag">Controles requeridos: ${r.controles.join(", ")}</span></div>
    `;
    box.appendChild(item);
  });
}

// 6. Lista de Artefactos Probatorios
function renderTablaEvidencias() {
  const container = document.getElementById("contenedor-artefactos");
  const totalLbl = document.getElementById("lbl-total-evidencias");
  if (!container) return;

  if (totalLbl) {
    totalLbl.textContent = `${evidenciasDocumentadas.length} documentos registrados`;
  }

  container.innerHTML = "";

  if (evidenciasDocumentadas.length === 0) {
    container.innerHTML = `<div class="empty-artifacts">No hay artefactos probatorios registrados para este ciclo de auditoría.</div>`;
    return;
  }

  evidenciasDocumentadas.forEach((e, idx) => {
    const card = document.createElement("div");
    card.className = "artifact-card";
    
    const extension = e.archivo.split(".").pop().toUpperCase();
    const textoEstado = e.estado === "implementado" ? "Oficial Vigente" : "Borrador";

    card.innerHTML = `
      <div class="artifact-header-row">
        <div class="artifact-title-group">
          <span class="file-ext-tag">${extension}</span>
          <span class="artifact-filename" title="${e.archivo}">${e.archivo}</span>
          <span class="artifact-control-badge">Control ${e.control}</span>
        </div>
        <div class="artifact-actions-group">
          <span class="artifact-status-pill">${textoEstado}</span>
          <button class="btn-del-artifact" data-index="${idx}" title="Eliminar este documento">Eliminar</button>
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

// 7. Formulario para Agregar Evidencias
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

// 8. Ejecutar Evaluación de la SoA
async function ejecutarSoA() {
  const btn = document.getElementById("btn-generar-soa");
  const originalText = btn.innerHTML;
  btn.innerHTML = "<span>⏳ Procesando Evaluación...</span>";
  btn.disabled = true;

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

  try {
    await procesarPayload(payload);
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// 9. Procesamiento con Fallback Determinista Inteligente
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

// Motor Determinista Local de Contingencia
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

  const vinculados = riesgos.filter(r => (r.controles || []).includes(control.id)).map(r => r.id);
  if (aplica && vinculados.length > 0) {
    justificacion += ` Vinculado a los riesgos: ${vinculados.join(", ")}.`;
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
  if (fila.estado === "implementado") return "Mantener la evidencia vigente y archivarla para la auditoría interna (Cláusula 9.2).";
  if (fila.estado === "parcial") return `Completar los requisitos pendientes y coordinar con el ${fila.responsable}.`;
  return `Solicitar formalmente la evidencia documental al ${fila.responsable}.`;
}

// 10. Renderizar Resultados en Pantalla
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

    // Actualización de la Barra de Cumplimiento
    const aplicables = r.aplican || 1;
    const pctImp = Math.round((r.implementados / aplicables) * 100);
    const pctPar = Math.round((r.parciales / aplicables) * 100);
    const pctBre = Math.round((r.no_implementados / aplicables) * 100);

    const lblPct = document.getElementById("lbl-compliance-pct");
    if (lblPct) {
      lblPct.textContent = `${pctImp}% Conforme (${r.implementados}/${r.aplican} aplicables)`;
    }

    const barImp = document.getElementById("bar-imp");
    const barPar = document.getElementById("bar-par");
    const barBre = document.getElementById("bar-bre");
    if (barImp) barImp.style.width = `${pctImp}%`;
    if (barPar) barPar.style.width = `${pctPar}%`;
    if (barBre) barBre.style.width = `${pctBre}%`;
  }

  const filas = res.datos ? res.datos.soa : [];
  renderFilasSoA(filas);
  renderItemsBrechas(res.datos ? res.datos.brechas : []);
  initFiltrosSoA(filas);
}

// 11. Buscador en Vivo de la SoA
function initBuscadorSoA() {
  const searchInput = document.getElementById("input-buscar-soa");
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    busquedaFiltroSoA = e.target.value.trim().toLowerCase();
    if (resultadoSoAUltimo && resultadoSoAUltimo.datos && resultadoSoAUltimo.datos.soa) {
      renderFilasSoA(resultadoSoAUltimo.datos.soa);
    }
  });
}

function renderFilasSoA(filas) {
  const tbody = document.getElementById("tbody-soa");
  tbody.innerHTML = "";

  const filtradas = filas.filter(f => {
    // 1. Filtro por píldoras
    let pasaPildora = true;
    if (filtroTablaSoA === "brechas") pasaPildora = (f.aplica && f.estado === "no implementado");
    else if (filtroTablaSoA === "implementados") pasaPildora = (f.estado === "implementado");
    else if (filtroTablaSoA === "excluidos") pasaPildora = (!f.aplica);

    if (!pasaPildora) return false;

    // 2. Filtro por buscador en vivo
    if (busquedaFiltroSoA) {
      const textoCompleto = `${f.control} ${f.nombre} ${f.justificacion} ${f.responsable} ${f.estado}`.toLowerCase();
      if (!textoCompleto.includes(busquedaFiltroSoA)) return false;
    }

    return true;
  });

  if (filtradas.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="8" style="text-align:center; padding:24px; color:var(--slate-400);">No se encontraron controles que coincidan con el filtro actual.</td>`;
    tbody.appendChild(tr);
    return;
  }

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
      textoEstadoFormal = "Pendiente (Brecha)";
      statusClass = "audit-tag-pendiente";
    }

    let textoEvidencias = "<span class='text-muted-subtle'>Sin documento</span>";
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
      <td style="text-align:center;">${f.aplica ? '<span style="color:var(--emerald-600); font-weight:700;">Sí</span>' : '<span style="color:var(--slate-400);">No</span>'}</td>
      <td style="color:var(--slate-700); line-height:1.4;">${f.justificacion}</td>
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
    container.innerHTML = "<p style='color:var(--emerald-600); font-weight:600;'>No se detectaron brechas de cumplimiento para el alcance actual.</p>";
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

// 12. Presets JSON y Copiado al Portapapeles
function initPresetsJSON() {
  const select = document.getElementById("sel-preset-json");
  const txt = document.getElementById("txt-json-payload");
  const btnCopiar = document.getElementById("btn-copiar-json-input");

  const presets = {
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

  function cargar() {
    txt.value = JSON.stringify(presets[select.value], null, 2);
  }

  select.addEventListener("change", cargar);
  cargar();

  if (btnCopiar) {
    btnCopiar.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(txt.value);
        const originalText = btnCopiar.innerHTML;
        btnCopiar.innerHTML = `<span>✓ ¡Copiado al portapapeles!</span>`;
        setTimeout(() => {
          btnCopiar.innerHTML = originalText;
        }, 2000);
      } catch (err) {
        alert("No se pudo copiar automáticamente. Por favor seleccione el texto manualmente.");
      }
    });
  }
}

async function procesarJsonDirecto() {
  const txt = document.getElementById("txt-json-payload");
  try {
    const payload = JSON.parse(txt.value);
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
