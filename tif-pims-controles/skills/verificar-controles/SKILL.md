---
name: verificar-controles
description: >
  Audita el estado de cumplimiento de un control individual del PIMS bajo ISO/IEC 27701:2025
  para la UNSA. Evalúa su aplicabilidad por rol, verifica sus evidencias documentales,
  asocia la política institucional y emite una prescripción técnica accionable.
  Úsalo cuando el usuario pida: "verifica el control A.X.X.X", "¿está implementado el control de DPIA?",
  "audita el control de respuesta a incidentes", "¿qué falta para cumplir con A.3.11?",
  "revisa si tenemos evidencia para el control de registros de tratamiento".
metadata:
  author: Escuela Profesional de Ingeniería de Sistemas - UNSA
  version: 2.1.0
  standard: ISO/IEC 27701:2025 - Cláusulas 6.1.3, 9.1, 9.2 y Anexo A
  scope: Auditoría granular de controles PIMS - UNSA
---

# Verificar y Auditar Controles PIMS

## Instructions

### Step 1: Identificar el control a auditar

Extrae el identificador del control del mensaje del usuario (formato `A.X.X.X`, ej. `A.1.2.6`).

- Busca el control en `knowledge/catalogo_controles.json`
- Si el control **no existe** en el catálogo → responde con error:
  *"El control '[ID]' no está registrado en el catálogo de controles PIMS de la UNSA."*
  No continúes.
- Si el control **existe** → obtén su `nombre` y `agente_responsable` para usarlos en los pasos siguientes.

### Step 2: Confirmar el rol organizacional

Determina el rol PIMS de la organización (igual que en la skill `generar-soa`):

- `responsable` → controles A.1 y A.3 aplican
- `encargado` → controles A.2 y A.3 aplican
- `ambos` → todos los controles aplican

Si el rol no está claro en el mensaje, pregunta: *"¿La UNSA actúa como responsable, encargada o en ambos roles para este sistema?"*

### Step 3: Evaluar la aplicabilidad del control

Aplica la regla de prefijo:

| Prefijo del control | Aplica si rol es... |
|---|---|
| `A.1` | `responsable` o `ambos` |
| `A.2` | `encargado` o `ambos` |
| `A.3` | Siempre (universal) |

- Si **no aplica**: ve directamente al Step 6 con estado `"no aplica"`.
- Si **aplica**: continúa al Step 4.

### Step 4: Verificar evidencias disponibles

Filtra del array `evidencias` del input solo las que corresponden al control auditado (campo `control == ID`).

Determina el estado probatorio:

| Evidencias encontradas | Estado |
|---|---|
| Al menos una con `estado: "implementado"` | `implementado` |
| Al menos una con `estado: "parcial"` | `parcial` |
| Sin evidencias para este control | `no implementado` |

> **Regla de oro:** La ausencia de evidencia implica `no implementado`. No inferir cumplimiento por conocimiento previo ni razonamiento generativo.

### Step 5: Asociar política institucional (RAG)

Realiza una búsqueda semántica FAISS sobre `knowledge/politicas/` usando el **nombre del control** como query.

- Score `>= 0.30` → registrar como `politica_relacionada: "[nombre de la política]"`
- Score `< 0.30` → `politica_relacionada: null` (registrar `WARN_POLITICA_BAJA_SIMILITUD` en log, no detener flujo)

### Step 6: Generar la prescripción técnica

Emite una recomendación accionable según el estado determinado:

| Estado del control | Prescripción |
|---|---|
| `no aplica` | *"Documentar formalmente la exclusión y su justificación en la SoA institucional."* |
| `implementado` | *"Control operativo. Mantener la evidencia vigente para la auditoría interna (Cláusula 9.2 de ISO/IEC 27701:2025)."* |
| `parcial` | *"Completar los requisitos pendientes del control coordinando con el [agente_responsable]."* |
| `no implementado` | *"Solicitar formalmente la implementación y evidencia documental al [agente_responsable]."* |

### Step 7: Emitir la respuesta final

Presenta el resultado con:

- `control`: ID del control auditado
- `nombre`: nombre del control
- `aplica`: true/false
- `justificacion`: motivo de aplicabilidad o exclusión (con riesgos vinculados si los hay)
- `estado`: estado probatorio determinado
- `evidencias`: lista de descripciones de las evidencias encontradas
- `politica_relacionada`: política UNSA asociada o null
- `responsable`: agente responsable del catálogo
- `recomendacion`: prescripción técnica accionable (del Step 6)
- `requiere_revision_humana: true` (invariante, no modificar)

---

## Examples

**User says:** *"Verifica el control A.1.2.6 para la UNSA como responsable. Tenemos un borrador de DPIA."*

**Actions:**
1. Buscar `A.1.2.6` en catálogo → encontrado: *"Evaluación de impacto de privacidad (DPIA)"*, agente: *"Agente de Riesgos"*
2. Rol = `responsable` → prefijo `A.1` → **aplica**
3. Buscar evidencias con `control: "A.1.2.6"` → encontrada 1 evidencia con `estado: "parcial"`
4. Estado probatorio = `parcial`
5. Buscar política FAISS → match con *"POL-UNSA-03. Evaluación de Impacto en la Privacidad (DPIA)"*
6. Prescripción: *"Completar los requisitos pendientes del control coordinando con el Agente de Riesgos."*
7. Emitir respuesta con `requiere_revision_humana: true`

---

**User says:** *"¿Está implementado el control A.2.5.7 si la UNSA solo actúa como responsable?"*

**Actions:**
1. Buscar `A.2.5.7` en catálogo → encontrado: *"Divulgación de subcontratistas"*
2. Rol = `responsable` → prefijo `A.2` → **NO aplica**
3. Estado = `no aplica`
4. Prescripción: *"Documentar formalmente la exclusión y su justificación en la SoA institucional."*
5. Emitir respuesta indicando que el control está excluido por rol, con justificación formal

---

## Troubleshooting

* **Error:** El ID del control no existe en el catálogo.
  **Solution:** Responder con `estado: "rechazada"` y mensaje: *"El control '[ID]' no está registrado en el catálogo de controles PIMS de la UNSA. Verifica el identificador según el Anexo A de ISO/IEC 27701:2025."* No continuar.

* **Error:** No se proporcionó el rol organizacional.
  **Solution:** Preguntar antes de continuar: *"¿La UNSA actúa como responsable del tratamiento, como encargada, o en ambos roles para el sistema en auditoría?"*

* **Error:** El usuario quiere que el control se marque como implementado sin evidencia documental.
  **Solution:** Aplicar el principio de verificación probatoria: *"Un control solo puede ser calificado como implementado si existe al menos un artefacto probatorio registrado. Sin evidencia objetiva, el estado es no implementado (ISO/IEC 27701:2025, Cláusula 9.1)."*

* **Error:** Se solicita verificar un control para toda la SoA en lugar de uno puntual.
  **Solution:** Redirigir al skill correcto: *"Para auditar todos los controles del PIMS y generar la SoA completa, utiliza la skill `generar-soa`."*

* **Error:** No se encontró política relacionada (score FAISS < 0.30).
  **Solution:** Asignar `politica_relacionada: null`, registrar `WARN_POLITICA_BAJA_SIMILITUD` y continuar. No interrumpir la auditoría.
