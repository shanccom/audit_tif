# Referencia Técnica: Contratos JSON de la Skill `generar-soa`

Este archivo contiene la especificación formal de los contratos de entrada y salida
de la skill `generar-soa`, así como el algoritmo determinista completo y la
matriz de errores. El agente consulta este archivo cuando necesita validar
estructuras de datos o manejar casos de error específicos.

---

## Input Schema (JSON Schema Draft 2020-12)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "GenerarSoAInput",
  "type": "object",
  "required": ["operacion", "perfil"],
  "properties": {
    "operacion": {
      "type": "string",
      "enum": ["generar_soa"]
    },
    "perfil": {
      "type": "object",
      "required": ["rol"],
      "properties": {
        "organizacion": {
          "type": "string",
          "default": "Universidad Nacional de San Agustín (UNSA)"
        },
        "rol": {
          "type": "string",
          "enum": ["responsable", "encargado", "ambos"]
        }
      }
    },
    "riesgos": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "controles"],
        "properties": {
          "id": { "type": "string", "example": "R-UNSA-01" },
          "descripcion": { "type": "string" },
          "controles": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    "evidencias": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["control", "descripcion", "estado"],
        "properties": {
          "control": { "type": "string", "example": "A.1.2.2" },
          "descripcion": { "type": "string", "example": "[Archivo: Res-CU-045-2026.pdf]" },
          "estado": { "type": "string", "enum": ["implementado", "parcial"] }
        }
      }
    }
  }
}
```

---

## Output Schema (JSON Schema Draft 2020-12)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "GenerarSoAOutput",
  "type": "object",
  "required": ["agente", "operacion", "estado", "respuesta", "datos", "requiere_revision_humana"],
  "properties": {
    "agente": { "type": "string", "const": "controles" },
    "operacion": { "type": "string", "const": "generar_soa" },
    "estado": { "type": "string", "enum": ["ok", "rechazada"] },
    "respuesta": { "type": "string" },
    "datos": {
      "type": "object",
      "required": ["soa", "brechas", "resumen"],
      "properties": {
        "soa": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "control": { "type": "string" },
              "nombre": { "type": "string" },
              "aplica": { "type": "boolean" },
              "justificacion": { "type": "string" },
              "estado": { "type": "string", "enum": ["implementado", "parcial", "no implementado", "no aplica"] },
              "evidencias": { "type": "array", "items": { "type": "string" } },
              "politica_relacionada": { "type": ["string", "null"] },
              "responsable": { "type": "string" }
            }
          }
        },
        "brechas": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "control": { "type": "string" },
              "nombre": { "type": "string" },
              "estado": { "type": "string" },
              "solicitar_a": { "type": "string" }
            }
          }
        },
        "resumen": {
          "type": "object",
          "properties": {
            "controles_evaluados": { "type": "integer" },
            "aplican": { "type": "integer" },
            "excluidos": { "type": "integer" },
            "implementados": { "type": "integer" },
            "parciales": { "type": "integer" },
            "no_implementados": { "type": "integer" }
          }
        }
      }
    },
    "fuentes": { "type": "array", "items": { "type": "string" } },
    "confianza": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
    "requiere_revision_humana": { "type": "boolean", "const": true }
  }
}
```

---

## Algoritmo Determinista (Pseudocódigo Formal)

```
[Paso 1: Validación Estricta]
  │── Validar perfil.rol ∈ {"responsable", "encargado", "ambos"}.
  └── Si falla: Abortar con estado="rechazada" (ERR_ROL_INVALIDO).

[Paso 2: Carga de Catálogo]
  └── Cargar totalidad de controles C_i ∈ catalogo_controles.json.
      Si falla: Abortar con estado="rechazada" (ERR_CATALOGO_NO_DISPONIBLE).

[Paso 3: Evaluación de Aplicabilidad por Rol]
  ├── Si Prefijo(C_i) == "A.1" ➔ Aplica si rol ∈ {"responsable", "ambos"}.
  ├── Si Prefijo(C_i) == "A.2" ➔ Aplica si rol ∈ {"encargado", "ambos"}.
  └── Si Prefijo(C_i) == "A.3" ➔ Aplica SIEMPRE.

[Paso 4: Redacción de Justificación Normativa]
  ├── Si Aplica: motivo por rol + IDs de riesgos vinculados.
  └── Si No Aplica: Justificación formal obligatoria de exclusión.

[Paso 5: Cálculo Determinista del Estado Probatorio]
  ├── Si Aplica == False ➔ estado = "no aplica".
  ├── Si ∃ e ∈ Evidencias(C_i) con e.estado == "implementado" ➔ estado = "implementado".
  ├── Si ∃ e ∈ Evidencias(C_i) con e.estado == "parcial" ➔ estado = "parcial".
  └── Si Evidencias(C_i) == ∅ ➔ estado = "no implementado".

[Paso 6: Asociación Semántica de Directivas (RAG)]
  └── Consulta FAISS(C_i.nombre, k=1, umbral=0.30) sobre knowledge/politicas/.

[Paso 7: Detección y Asignación de Brechas]
  └── ∀ C_i donde Aplica == True ∧ estado ≠ "implementado":
        Registrar en brechas con solicitar_a = C_i.agente_responsable.

[Paso 8: Agregación de Métricas]
  └── Computar totales: evaluados, aplican, excluidos, implementados, parciales, no_implementados.

[Paso 9: Marcado de Gobernanza]
  └── Asignar requiere_revision_humana = True y confianza = 1.0.
```

---

## Matriz de Errores

| Código | Causa | Acción | Estado emitido |
|---|---|---|---|
| `ERR_ROL_INVALIDO` | `perfil.rol` ausente o fuera de enum | Abortar; solicitar definición de rol | `"rechazada"` |
| `ERR_CATALOGO_NO_DISPONIBLE` | Fallo de lectura en `catalogo_controles.json` | Notificar error crítico de configuración | `"rechazada"` |
| `WARN_SIN_EVIDENCIAS` | Array `evidencias` vacío | Procesar normalmente; todo aplicable = `"no implementado"` | `"ok"` |
| `WARN_POLITICA_BAJA_SIMILITUD` | Score FAISS < 0.30 | Asignar `politica_relacionada: null`; no detener flujo | `"ok"` |

---

## Invariantes de Seguridad

1. **Verificación Probatoria:** Un control no puede ser `"implementado"` sin artefacto documental registrado.
2. **No Exclusión Silenciosa:** Todo control excluido debe tener justificación documentada.
3. **Supervisión Humana:** La SoA es siempre una propuesta técnica; nunca auto-aprobatoria.
4. **Determinismo:** El mismo input siempre produce el mismo output.
