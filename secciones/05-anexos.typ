= Anexos

== Anexo A: Catálogo de Controles de Privacidad (`catalogo_controles.json`)

El catálogo normativo base mapea cada control del Anexo A con el agente especializado encargado de su gestión:

```json
[
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
]
```

== Anexo B: Especificación de Archivos `SKILL.md`

=== Skill `generar-soa` (`skills/generar-soa/SKILL.md`)

```markdown
---
name: generar-soa
description: Genera la Declaración de Aplicabilidad (SoA) del PIMS según ISO/IEC
  27701:2025. Para cada control indica si aplica, la justificación, el estado de
  implementación y las brechas. Usar cuando se pida elaborar, actualizar o revisar
  la SoA.
---

# Generar la Declaración de Aplicabilidad (SoA)

## Activación
Se ejecuta cuando:
- Se solicita elaborar o actualizar la SoA de la organización.
- Otro agente (Riesgos, Evidencia) entrega información nueva que puede cambiar
  la aplicabilidad o el estado de los controles.

No se ejecuta para: consultas sobre un solo control (usar `verificar-controles`).

## Entrada
- perfil: { organizacion, rol } con rol = responsable | encargado | ambos
- riesgos: lista de { id, descripcion, controles[] }        (de Agente de Riesgos)
- evidencias: lista de { control, descripcion, estado }      (de Agente de Evidencia)
  con estado = implementado | parcial

## Pasos
1. Validar la entrada. Si falta perfil.rol o no es válido, rechazar con estado "rechazada".
2. Cargar el catálogo de controles (control, nombre, agente responsable).
3. Determinar la aplicabilidad de cada control según el rol:
   - A.1 (responsable): aplica si rol = responsable o ambos.
   - A.2 (encargado): aplica si rol = encargado o ambos.
   - A.3 (común): aplica siempre.
4. Redactar la justificación:
   - Si aplica: motivo + riesgos vinculados (si los hay).
   - Si no aplica: motivo de la exclusión (obligatorio).
5. Determinar el estado de implementación SOLO con evidencias:
   - implementado: existe al menos una evidencia "implementado".
   - parcial: solo hay evidencias "parcial".
   - no implementado: no hay evidencias.
   - no aplica: control excluido.
6. Buscar en el repositorio de políticas (búsqueda semántica) una política relacionada.
7. Identificar brechas: controles aplicables no implementados, indicando a qué agente pedir evidencia.
8. Armar la SoA y el resumen con totales estadísticos.
9. Marcar requiere_revision_humana = true.

## Salida
{
  "agente": "controles",
  "operacion": "generar_soa",
  "estado": "ok | rechazada",
  "respuesta": "resumen en texto",
  "datos": { "soa": [ ... ], "brechas": [ ... ], "resumen": { ... } },
  "fuentes": ["catalogo_controles.json"],
  "confianza": 1.0,
  "requiere_revision_humana": true
}
```

=== Skill `verificar-controles` (`skills/verificar-controles/SKILL.md`)

```markdown
---
name: verificar-controles
description: Verifica el estado de implementación de un control concreto del PIMS
  (ISO/IEC 27701:2025), identifica la brecha y recomienda la siguiente acción.
---

# Verificar un control

## Activación
Se ejecuta cuando se pide revisar un control específico o saber qué falta para cumplirlo.

## Entrada
- control: identificador (por ejemplo "A.1.2.6")
- perfil: { rol }
- riesgos y evidencias (mismo formato que en generar-soa)

## Pasos
1. Validar existencia del control y rol válido.
2. Determinar si el control aplica al rol.
3. Reunir las evidencias del control.
4. Buscar una política relacionada en el repositorio FAISS.
5. Determinar estado (implementado / parcial / no implementado / no aplica).
6. Recomendar la siguiente acción indicando el agente responsable.
7. Devolver el resultado en el contrato estándar.
```

== Anexo C: Código Fuente Base

=== Módulo RAG Local (`rag.py`)

```python
import glob
import os
from functools import lru_cache
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

@lru_cache(maxsize=1)
def get_model():
    return SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

class Indice:
    def __init__(self, textos, metas):
        self.textos, self.metas = textos, metas
        self.index = None
        if not textos:
            return
        vecs = get_model().encode(textos, normalize_embeddings=True)
        self.index = faiss.IndexFlatIP(vecs.shape[1])
        self.index.add(np.asarray(vecs, dtype="float32"))

    def buscar(self, consulta, k=3):
        if self.index is None:
            return []
        q = np.asarray(get_model().encode([consulta], normalize_embeddings=True), dtype="float32")
        scores, ids = self.index.search(q, min(k, len(self.textos)))
        return [
            {"texto": self.textos[i], "meta": self.metas[i], "score": float(s)}
            for s, i in zip(scores[0], ids[0]) if i != -1
        ]

def desde_carpeta(carpeta):
    textos, metas = [], []
    for ruta in sorted(glob.glob(os.path.join(carpeta, "*.md"))):
        with open(ruta, encoding="utf-8") as f:
            for parte in f.read().split("\n\n"):
                if parte.strip():
                    textos.append(parte.strip())
                    metas.append(os.path.basename(ruta))
    return Indice(textos, metas)
```

=== Agente de Controles (`agents/controles.py`)

```python
import json
import os
from rag import desde_carpeta

ROLES = ("responsable", "encargado", "ambos")
UMBRAL_POLITICA = 0.45
UMBRAL_CONSULTA = 0.30

class AgenteControles:
    nombre = "controles"
    descripcion = "Genera la SoA y verifica la implementación de controles de ISO/IEC 27701:2025."

    def __init__(self, carpeta="knowledge"):
        with open(os.path.join(carpeta, "catalogo_controles.json"), encoding="utf-8") as f:
            self.catalogo = json.load(f)
        self.normativa = desde_carpeta(os.path.join(carpeta, "normativa"))
        self.politicas = desde_carpeta(os.path.join(carpeta, "politicas"))

    def ejecutar(self, entrada):
        operacion = entrada.get("operacion", "consultar")
        try:
            if operacion == "generar_soa":
                return self._generar_soa(entrada)
            if operacion == "verificar_control":
                return self._verificar_control(entrada)
            return self._consultar(entrada.get("solicitud", ""))
        except ValueError as e:
            return self._resp(operacion, "rechazada", f"Entrada inválida: {e}")

    @staticmethod
    def _aplica(control, rol):
        ambito = control["id"][:3]
        if ambito == "A.3":
            return True, "Control común de seguridad: aplica a cualquier rol."
        if ambito == "A.1":
            if rol in ("responsable", "ambos"):
                return True, "La organización actúa como responsable del tratamiento."
            return False, "Excluido: la organización no actúa como responsable (controles A.1)."
        if ambito == "A.2":
            if rol in ("encargado", "ambos"):
                return True, "La organización actúa como encargada del tratamiento."
            return False, "Excluido: la organización no actúa como encargada (controles A.2)."
        raise ValueError(f"ámbito desconocido en el control {control['id']}")

    @staticmethod
    def _estado(control_id, evidencias):
        propias = [e for e in evidencias if e.get("control") == control_id]
        if any(e.get("estado") == "implementado" for e in propias):
            return "implementado", propias
        if any(e.get("estado") == "parcial" for e in propias):
            return "parcial", propias
        return "no implementado", propias

    def _fila(self, control, rol, riesgos, evidencias):
        aplica, justificacion = self._aplica(control, rol)
        vinculados = [r["id"] for r in riesgos if control["id"] in r.get("controles", [])]
        if aplica and vinculados:
            justificacion += f" Vinculado a los riesgos: {', '.join(vinculados)}."

        if aplica:
            estado, propias = self._estado(control["id"], evidencias)
        else:
            estado, propias = "no aplica", []

        hits = self.politicas.buscar(control["nombre"], k=1)
        politica = hits[0]["meta"] if hits and hits[0]["score"] >= UMBRAL_POLITICA else None

        return {
            "control": control["id"],
            "nombre": control["nombre"],
            "aplica": aplica,
            "justificacion": justificacion,
            "estado": estado,
            "evidencias": [e.get("descripcion", "") for e in propias],
            "politica_relacionada": politica,
            "responsable": control["agente_responsable"],
        }

    def _generar_soa(self, entrada):
        perfil = entrada.get("perfil") or {}
        rol = perfil.get("rol")
        if rol not in ROLES:
            raise ValueError("perfil.rol debe ser 'responsable', 'encargado' o 'ambos'")
        riesgos = entrada.get("riesgos", [])
        evidencias = entrada.get("evidencias", [])

        soa = [self._fila(c, rol, riesgos, evidencias) for c in self.catalogo]
        aplicables = [f for f in soa if f["aplica"]]
        brechas = [
            {"control": f["control"], "nombre": f["nombre"], "estado": f["estado"],
             "solicitar_a": f["responsable"]}
            for f in aplicables if f["estado"] != "implementado"
        ]
        resumen = {
            "controles_evaluados": len(soa),
            "aplican": len(aplicables),
            "excluidos": len(soa) - len(aplicables),
            "implementados": sum(f["estado"] == "implementado" for f in aplicables),
            "parciales": sum(f["estado"] == "parcial" for f in aplicables),
            "no_implementados": sum(f["estado"] == "no implementado" for f in aplicables),
        }
        org = perfil.get("organizacion", "la organización")
        texto = (
            f"SoA generada para {org} (rol: {rol}). Controles evaluados: "
            f"{resumen['controles_evaluados']}; aplican: {resumen['aplican']}; "
            f"implementados: {resumen['implementados']}; brechas: {len(brechas)}. "
            "Requiere revisión y aprobación humana."
        )
        return self._resp(
            "generar_soa", "ok", texto,
            datos={"soa": soa, "brechas": brechas, "resumen": resumen},
            fuentes=["catalogo_controles.json"], confianza=1.0, revision=True,
        )

    def _verificar_control(self, entrada):
        cid = entrada.get("control")
        control = next((c for c in self.catalogo if c["id"] == cid), None)
        if control is None:
            raise ValueError(f"el control '{cid}' no está en el catálogo")
        rol = (entrada.get("perfil") or {}).get("rol")
        if rol not in ROLES:
            raise ValueError("perfil.rol debe ser 'responsable', 'encargado' o 'ambos'")

        fila = self._fila(control, rol, entrada.get("riesgos", []), entrada.get("evidencias", []))
        fila["recomendacion"] = self._recomendar(fila)
        texto = f"Control {fila['control']} ({fila['nombre']}): {fila['estado']}. {fila['recomendacion']}"
        return self._resp(
            "verificar_control", "ok", texto, datos=fila,
            fuentes=["catalogo_controles.json"], confianza=1.0,
        )

    @staticmethod
    def _recomendar(fila):
        if not fila["aplica"]:
            return "Documentar la exclusión y su justificación en la SoA."
        if fila["estado"] == "implementado":
            return "Mantener la evidencia vigente para la auditoría interna (cláusula 9.2)."
        if fila["estado"] == "parcial":
            return f"Completar la implementación; coordinar con el {fila['responsable']}."
        return f"Solicitar evidencia o implementación al {fila['responsable']}."

    def _consultar(self, solicitud):
        if not solicitud.strip():
            return self._resp("consultar", "rechazada", "La consulta está vacía.")
        hits = self.normativa.buscar(solicitud, k=3)
        if not hits or hits[0]["score"] < UMBRAL_CONSULTA:
            return self._resp(
                "consultar", "sin_respuesta",
                "No tengo información suficiente en mi base de conocimiento para responder.",
                confianza=hits[0]["score"] if hits else 0.0,
            )
        return self._resp(
            "consultar", "ok", "\n\n".join(h["texto"] for h in hits),
            fuentes=sorted({h["meta"] for h in hits}),
            confianza=round(hits[0]["score"], 3),
        )

    @staticmethod
    def _resp(operacion, estado, respuesta, datos=None, fuentes=None,
              confianza=0.0, revision=False):
        return {
            "agente": "controles",
            "operacion": operacion,
            "estado": estado,
            "respuesta": respuesta,
            "datos": datos or {},
            "fuentes": fuentes or [],
            "confianza": confianza,
            "requiere_revision_humana": revision,
        }
```
