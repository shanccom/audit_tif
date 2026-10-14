---
name: generar-soa
description: >
  Genera la Declaración de Aplicabilidad (SoA) completa del PIMS conforme a ISO/IEC 27701:2025
  para la UNSA, evaluando todos los controles del Anexo A según el rol organizacional (responsable,
  encargado o ambos), calculando su estado probatorio y detectando brechas.
  Úsalo cuando el usuario pida: "genera la SoA", "genera la declaración de aplicabilidad",
  "quiero la SoA completa del PIMS", "evalúa todos los controles del PIMS",
  "actualiza la declaración de aplicabilidad con las nuevas evidencias".
metadata:
  author: Escuela Profesional de Ingeniería de Sistemas - UNSA
  version: 2.1.0
  standard: ISO/IEC 27701:2025 - Anexo A
  scope: SISUNSA, Comedor Universitario, Admisión, Biblioteca Central - UNSA
---

# Generar Declaración de Aplicabilidad (SoA)

## Instructions

### Step 1: Identificar el rol organizacional

Antes de cualquier procesamiento, determina el rol PIMS de la organización:

- Si el usuario menciona que la UNSA **determina los fines del tratamiento** → `rol = "responsable"` (aplican controles A.1 + A.3)
- Si la UNSA **procesa datos por cuenta de otro** → `rol = "encargado"` (aplican controles A.2 + A.3)
- Si actúa en **ambas capacidades** → `rol = "ambos"` (aplican A.1 + A.2 + A.3)
- Si el rol no está claro, pregunta: *"¿La UNSA actúa como responsable del tratamiento, como encargada, o en ambos roles?"*

> No continúes si el rol no es uno de: `responsable`, `encargado`, `ambos`. Responde con un error claro.

### Step 2: Cargar el catálogo de controles

Lee el archivo `knowledge/catalogo_controles.json`. Este archivo contiene los 10 controles representativos del Anexo A con su `id`, `nombre` y `agente_responsable`.

Para cada control `C_i`, aplica la **regla de aplicabilidad por prefijo**:
- Prefijo `A.1` → Aplica si `rol ∈ {responsable, ambos}`
- Prefijo `A.2` → Aplica si `rol ∈ {encargado, ambos}`
- Prefijo `A.3` → **Siempre aplica** (controles comunes universales)

### Step 3: Calcular el estado probatorio de cada control

Para cada control que aplica, busca sus evidencias en el array `evidencias` del input:

| Condición | Estado asignado |
|---|---|
| Al menos una evidencia con `estado: "implementado"` | `implementado` |
| Al menos una evidencia con `estado: "parcial"` | `parcial` |
| Sin evidencias para el control | `no implementado` |
| Control no aplica por rol | `no aplica` |

> **Regla de oro:** Sin evidencia objetiva = `no implementado`. Nunca inferir implementación por razonamiento.

### Step 4: Redactar la justificación normativa de cada control

Para cada control:
- **Si aplica:** Redacta el motivo por rol + vincula los IDs de riesgos que referencian ese control (del array `riesgos` del input).
  - Ejemplo: *"La UNSA actúa como responsable del tratamiento. Vinculado a los riesgos: R-UNSA-01."*
- **Si no aplica:** Redacta una justificación formal de exclusión basada en el rol.
  - Ejemplo: *"Excluido: la organización no actúa como encargada (controles A.2)."*
  - **Prohibido** dejar una exclusión sin justificación documentada.

### Step 5: Asociar política institucional mediante búsqueda semántica (RAG)

Para cada control, consulta el índice vectorial FAISS sobre `knowledge/politicas/` usando el nombre del control como query.

- Si el score de similitud `>= 0.30` → registra la política como `politica_relacionada`
- Si el score `< 0.30` → asigna `politica_relacionada: null`

Esto se ejecuta a través del agente Python en `agents/controles.py` (método `_fila`).

### Step 6: Detectar brechas de cumplimiento

Registra como **brecha** todo control donde:
```
aplica == true  AND  estado != "implementado"
```

Cada brecha incluye:
- `control`: ID del control (ej. `A.1.2.6`)
- `nombre`: nombre del control
- `estado`: estado actual (`parcial` o `no implementado`)
- `solicitar_a`: el `agente_responsable` del catálogo

### Step 7: Calcular métricas de resumen

Computa las siguientes métricas sobre el conjunto completo de la SoA:

```
controles_evaluados = total de controles en el catálogo
aplican            = controles donde aplica == true
excluidos          = controles_evaluados - aplican
implementados      = controles donde aplica == true AND estado == "implementado"
parciales          = controles donde aplica == true AND estado == "parcial"
no_implementados   = controles donde aplica == true AND estado == "no implementado"
```

### Step 8: Emitir la respuesta con gobernanza humana

Presenta la SoA como una **propuesta técnica auditada**, nunca como un documento auto-aprobado. La respuesta siempre incluye:

- La matriz SoA completa (un registro por control)
- La lista de brechas con su agente responsable
- El resumen de métricas
- El campo `requiere_revision_humana: true` (invariante, nunca puede ser `false`)
- Un texto narrativo de resumen legible para el DPO o auditor líder

---

## Examples

**User says:** *"Genera la SoA para la UNSA como responsable del tratamiento, sin evidencias aún."*

**Actions:**
1. Identificar `rol = "responsable"` → aplican controles A.1.x y A.3.x
2. Cargar `catalogo_controles.json` → 10 controles
3. Aplicar regla de aplicabilidad: 6 controles aplican (A.1: 5, A.3: 1... ajustar según catálogo), 1 excluido (A.2.5.7)
4. Como `evidencias = []`, todos los aplicables quedan en `no implementado`
5. Buscar políticas FAISS para cada control
6. Todas las filas aplicables → brecha → `solicitar_a` = agente responsable correspondiente
7. Calcular resumen: `implementados: 0`, `no_implementados: N`
8. Emitir respuesta con `requiere_revision_humana: true` y advertencia de brechas críticas

---

**User says:** *"Actualiza la SoA con la evidencia DPIA-Biometria.pdf para el control A.1.2.6 (parcial)."*

**Actions:**
1. Rol ya conocido o preguntar si no está definido
2. Cargar catálogo y procesar normalmente
3. Para control `A.1.2.6`: encontrar evidencia `estado: "parcial"` → asignar estado `parcial`
4. `A.1.2.6` sigue siendo brecha (parcial ≠ implementado) → mantener en lista de brechas
5. Emitir SoA actualizada con el control `A.1.2.6` en estado `parcial`

---

## Troubleshooting

* **Error:** El usuario no especificó el rol organizacional.
  **Solution:** Pregunta directamente antes de continuar: *"¿La UNSA actúa como responsable del tratamiento, como encargada, o en ambos roles para este sistema?"*

* **Error:** El catálogo `catalogo_controles.json` no se puede leer.
  **Solution:** Notificar error crítico de configuración. Responder con `estado: "rechazada"` y mensaje `ERR_CATALOGO_NO_DISPONIBLE`. No intentar inferir controles desde cero.

* **Error:** El usuario quiere aprobar la SoA directamente desde el sistema.
  **Solution:** Recordar el principio de supervisión humana: *"La SoA generada es una propuesta técnica. Debe ser revisada y aprobada formalmente por el DPO o la dirección antes de considerarse un documento oficial del PIMS (ISO/IEC 27701:2025, cláusula 9.3)."*

* **Error:** Un control tiene evidencia pero el estado no es claro.
  **Solution:** Aplicar la regla de prioridad: `implementado > parcial > no implementado`. Si coexisten múltiples evidencias con distintos estados, el estado final es el más favorable con soporte documental.

* **Error:** No se encontró política relacionada para un control (score FAISS < 0.30).
  **Solution:** Asignar `politica_relacionada: null` y continuar. No detener el flujo. Registrar en log como `WARN_POLITICA_BAJA_SIMILITUD`.
