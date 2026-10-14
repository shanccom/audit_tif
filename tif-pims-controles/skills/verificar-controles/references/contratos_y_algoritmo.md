# Referencia Técnica: Contratos JSON de la Skill `verificar-controles`

Este archivo contiene la especificación formal de los contratos de entrada y salida
de la skill `verificar-controles`, así como el algoritmo de diagnóstico completo.
El agente consulta este archivo cuando necesita validar estructuras de datos o
manejar casos de error específicos durante una auditoría puntual de control.

---

## Input Schema (JSON Schema Draft 2020-12)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "VerificarControlInput",
  "type": "object",
  "required": ["operacion", "control", "perfil"],
  "properties": {
    "operacion": {
      "type": "string",
      "enum": ["verificar_control"]
    },
    "control": {
      "type": "string",
      "description": "Identificador normativo exacto del control del Anexo A.",
      "example": "A.1.2.6"
    },
    "perfil": {
      "type": "object",
      "required": ["rol"],
      "properties": {
        "organizacion": { "type": "string", "default": "Universidad Nacional de San Agustín (UNSA)" },
        "rol": { "type": "string", "enum": ["responsable", "encargado", "ambos"] }
      }
    },
    "riesgos": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "controles"],
        "properties": {
          "id": { "type": "string" },
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
          "control": { "type": "string" },
          "descripcion": { "type": "string" },
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
  "title": "VerificarControlOutput",
  "type": "object",
  "required": ["agente", "operacion", "estado", "respuesta", "datos", "requiere_revision_humana"],
  "properties": {
    "agente": { "type": "string", "const": "controles" },
    "operacion": { "type": "string", "const": "verificar_control" },
    "estado": { "type": "string", "enum": ["ok", "rechazada"] },
    "respuesta": { "type": "string" },
    "datos": {
      "type": "object",
      "required": ["control", "nombre", "aplica", "justificacion", "estado", "responsable", "recomendacion"],
      "properties": {
        "control": { "type": "string", "example": "A.1.2.6" },
        "nombre": { "type": "string", "example": "Evaluación de impacto de privacidad (DPIA)" },
        "aplica": { "type": "boolean" },
        "justificacion": { "type": "string" },
        "estado": { "type": "string", "enum": ["implementado", "parcial", "no implementado", "no aplica"] },
        "evidencias": { "type": "array", "items": { "type": "string" } },
        "politica_relacionada": { "type": ["string", "null"] },
        "responsable": { "type": "string", "example": "Agente de Riesgos" },
        "recomendacion": { "type": "string" }
      }
    },
    "fuentes": { "type": "array", "items": { "type": "string" } },
    "confianza": { "type": "number", "const": 1.0 },
    "requiere_revision_humana": { "type": "boolean", "const": true }
  }
}
```

---

## Algoritmo de Diagnóstico (Pseudocódigo Formal)

```
[Paso 1: Validación de Integridad]
  ├── Buscar control_id en catalogo_controles.json.
  │     └── Si no existe: Abortar con estado="rechazada" ("Control no reconocido").
  └── Validar perfil.rol ∈ {"responsable", "encargado", "ambos"}.

[Paso 2: Evaluación de Aplicabilidad]
  └── Aplicar regla de prefijo: A.1 (Responsable), A.2 (Encargado), A.3 (Universal).

[Paso 3: Búsqueda y Filtrado de Evidencias]
  └── propias = [e ∈ evidencias | e.control == control_id]

[Paso 4: Determinación de Estado Probatorio]
  ├── Si Aplica == False ➔ estado = "no aplica".
  ├── Si ∃ e ∈ propias con e.estado == "implementado" ➔ estado = "implementado".
  ├── Si ∃ e ∈ propias con e.estado == "parcial" ➔ estado = "parcial".
  └── Si propias == ∅ ➔ estado = "no implementado".

[Paso 5: Vinculación Semántica (RAG)]
  └── FAISS(control.nombre, k=1, umbral=0.30) sobre knowledge/politicas/.

[Paso 6: Generación de Prescripción]
  ├── "no aplica"       ➔ "Documentar exclusión en la SoA."
  ├── "implementado"    ➔ "Mantener evidencia vigente (Cláusula 9.2)."
  ├── "parcial"         ➔ "Completar con " + control.agente_responsable + "."
  └── "no implementado" ➔ "Solicitar implementación al " + control.agente_responsable + "."

[Paso 7: Empaquetado]
  └── Emitir respuesta con requiere_revision_humana = True, confianza = 1.0.
```

---

## Caso de Uso Canónico: DPIA en Comedor Universitario UNSA

### Entrada
```json
{
  "operacion": "verificar_control",
  "control": "A.1.2.6",
  "perfil": { "organizacion": "UNSA", "rol": "responsable" },
  "riesgos": [
    { "id": "R-UNSA-02", "descripcion": "Biometría en Comedor Universitario", "controles": ["A.1.2.6"] }
  ],
  "evidencias": [
    { "control": "A.1.2.6", "descripcion": "[Doc: DPIA-Biometria-Borrador.docx]", "estado": "parcial" }
  ]
}
```

### Salida esperada
```json
{
  "agente": "controles",
  "operacion": "verificar_control",
  "estado": "ok",
  "respuesta": "Control A.1.2.6 (Evaluación de impacto de privacidad (DPIA)): parcial. Recomendación: Completar la implementación con el Agente de Riesgos.",
  "datos": {
    "control": "A.1.2.6",
    "nombre": "Evaluación de impacto de privacidad (DPIA)",
    "aplica": true,
    "justificacion": "La organización actúa como responsable del tratamiento. Vinculado a los riesgos: R-UNSA-02.",
    "estado": "parcial",
    "evidencias": ["[Doc: DPIA-Biometria-Borrador.docx]"],
    "politica_relacionada": "POL-UNSA-03. Evaluación de Impacto en la Privacidad (DPIA) para Sistemas Críticos y Biometría",
    "responsable": "Agente de Riesgos",
    "recomendacion": "Completar la implementación con el Agente de Riesgos."
  },
  "fuentes": ["catalogo_controles.json"],
  "confianza": 1.0,
  "requiere_revision_humana": true
}
```
