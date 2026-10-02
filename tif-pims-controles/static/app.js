const EJEMPLOS = {
  generar_soa: {
    operacion: "generar_soa",
    perfil: { organizacion: "Empresa Demo SAC", rol: "responsable" },
    riesgos: [
      { id: "R1", descripcion: "Tratamiento de datos de clientes sin DPIA", controles: ["A.1.2.6"] }
    ],
    evidencias: [
      { control: "A.1.2.2", descripcion: "Registro de propósitos v1", estado: "implementado" },
      { control: "A.3.12", descripcion: "Procedimiento de respuesta en borrador", estado: "parcial" }
    ]
  },
  verificar_control: {
    operacion: "verificar_control",
    control: "A.1.2.6",
    perfil: { rol: "responsable" },
    riesgos: [{ id: "R1", descripcion: "Sin DPIA", controles: ["A.1.2.6"] }],
    evidencias: []
  },
  consultar: {
    operacion: "consultar",
    solicitud: "¿Qué debe incluir la Declaración de Aplicabilidad?"
  }
};

const selector = document.getElementById("operacion");
const entrada = document.getElementById("entrada");
const resultado = document.getElementById("resultado");

function cargarEjemplo() {
  entrada.value = JSON.stringify(EJEMPLOS[selector.value], null, 2);
}

function celda(fila, texto, clase) {
  const td = document.createElement("td");
  td.textContent = texto;
  if (clase) td.className = clase;
  fila.appendChild(td);
}

function tablaSoa(soa) {
  const tabla = document.createElement("table");
  const cab = document.createElement("tr");
  ["Control", "Nombre", "¿Aplica?", "Justificación", "Estado", "Responsable"].forEach((t) => {
    const th = document.createElement("th");
    th.textContent = t;
    cab.appendChild(th);
  });
  tabla.appendChild(cab);
  soa.forEach((f) => {
    const tr = document.createElement("tr");
    celda(tr, f.control);
    celda(tr, f.nombre);
    celda(tr, f.aplica ? "Sí" : "No");
    celda(tr, f.justificacion);
    celda(tr, f.estado, f.estado.replace(/\s+/g, "-"));
    celda(tr, f.responsable);
    tabla.appendChild(tr);
  });
  return tabla;
}

function mostrar(d) {
  resultado.style.display = "block";
  resultado.replaceChildren();

  const header = document.createElement("div");
  header.className = "res-header";
  const badge = document.createElement("span");
  badge.className = d.estado === "ok" ? "badge-ok" : "badge-error";
  badge.textContent = d.estado.toUpperCase();
  header.appendChild(badge);
  header.appendChild(document.createTextNode(" " + d.respuesta));
  resultado.appendChild(header);

  if (d.datos && d.datos.soa) {
    resultado.appendChild(tablaSoa(d.datos.soa));
  }

  if (d.datos && d.datos.control) {
    const tabla = document.createElement("table");
    const cab = document.createElement("tr");
    ["Campo", "Detalle"].forEach(t => {
      const th = document.createElement("th");
      th.textContent = t;
      cab.appendChild(th);
    });
    tabla.appendChild(cab);
    for (const [k, v] of Object.entries(d.datos)) {
      const tr = document.createElement("tr");
      celda(tr, k);
      celda(tr, Array.isArray(v) ? v.join(", ") : String(v || "–"));
      tabla.appendChild(tr);
    }
    resultado.appendChild(tabla);
  }

  if (d.datos && d.datos.brechas && d.datos.brechas.length) {
    const b = document.createElement("div");
    b.className = "brechas-box";
    b.innerHTML = "<strong>Brechas detectadas (" + d.datos.brechas.length + "):</strong><br/>" +
      d.datos.brechas.map((x) => `• <strong>${x.control}</strong> (${x.nombre}): ${x.estado} → <em>Solicitar a: ${x.solicitar_a}</em>`).join("<br/>");
    resultado.appendChild(b);
  }

  if (d.fuentes && d.fuentes.length) {
    const f = document.createElement("p");
    f.style.fontSize = "12px";
    f.style.color = "#64748b";
    f.textContent = "Fuentes consultadas: " + d.fuentes.join(", ");
    resultado.appendChild(f);
  }

  if (d.requiere_revision_humana) {
    const a = document.createElement("div");
    a.className = "aviso";
    a.textContent = "⚠️ Esta SoA es una propuesta generada por el agente: requiere revisión formal y aprobación de la dirección o responsable del PIMS.";
    resultado.appendChild(a);
  }
}

async function ejecutar() {
  let cuerpo;
  try {
    cuerpo = JSON.parse(entrada.value);
  } catch (e) {
    resultado.style.display = "block";
    resultado.textContent = "El JSON de entrada no es válido.";
    return;
  }
  try {
    const r = await fetch("/api/controles/ejecutar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo)
    });
    mostrar(await r.json());
  } catch (e) {
    resultado.style.display = "block";
    resultado.textContent = "Error de conexión con el servidor.";
  }
}

selector.addEventListener("change", cargarEjemplo);
document.getElementById("ejecutar").addEventListener("click", ejecutar);
cargarEjemplo();
