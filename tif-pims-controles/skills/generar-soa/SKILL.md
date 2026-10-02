---
name: generar-soa
description: >
  Genera la Declaración de Aplicabilidad (SoA) completa del PIMS según
  ISO/IEC 27701:2025. Para cada control del catálogo determina si aplica
  al rol de la organización, redacta la justificación formal, calcula el
  estado de implementación a partir de las evidencias recibidas, busca la
  política organizacional vinculada y produce el resumen de brechas.
  Usar cuando se solicite elaborar, actualizar, auditar o revisar la SoA.
---

# Skill: Generar la Declaración de Aplicabilidad (SoA)

## Cuándo se activa

Ejecutar este skill cuando:
- Se solicita elaborar o actualizar la SoA de la organización.
- El orquestador coordina un ciclo completo de evaluación del PIMS.
- Un agente externo (Riesgos, Evidencia) entrega información nueva que puede
  cambiar la aplicabilidad o el estado de implementación de los controles.

**No** se ejecuta para: consultas sobre un único control puntual
(usar `verificar-controles` en su lugar).

---

## Entrada esperada

```json
{
  "operacion": "generar_soa",
  "perfil": {
    "organizacion": "<nombre de la organización>",
    "rol": "responsable | encargado | ambos"
  },
  "riesgos": [
    { "id": "<ID>", "descripcion": "<texto>", "controles": ["<ID_control>"] }
  ],
  "evidencias": [
    { "control": "<ID_control>", "descripcion": "<texto>", "estado": "implementado | parcial" }
  ]
}
```

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `perfil.organizacion` | string | No | Nombre de la organización; si se omite usar `"la organización"` |
| `perfil.rol` | enum | **Sí** | Rol de la organización frente a los datos personales |
| `riesgos` | array | No | Lista de riesgos identificados por el Agente de Riesgos |
| `evidencias` | array | No | Lista de evidencias recopiladas por el Agente de Evidencia |

---

## Pasos de ejecución

### Paso 1 — Validar la entrada
- Si `perfil.rol` está ausente o no es uno de `responsable`, `encargado`,
  `ambos` → **rechazar** con `estado: "rechazada"` y un mensaje descriptivo.
- No continuar con el resto de los pasos si la validación falla.

### Paso 2 — Cargar el catálogo de controles
- Leer `knowledge/catalogo_controles.json`.
- El catálogo contiene: `id`, `nombre`, `agente_responsable`.
- No agregar ni eliminar controles del catálogo; procesarlos todos.

### Paso 3 — Determinar la aplicabilidad de cada control

| Prefijo del ID | Aplica si |
|---|---|
| `A.1` | `rol` = `responsable` o `ambos` |
| `A.2` | `rol` = `encargado` o `ambos` |
| `A.3` | Siempre (controles de seguridad comunes a ambos roles) |

### Paso 4 — Redactar la justificación
- **Si aplica:** redactar el motivo de inclusión según el rol. Si el control
  tiene riesgos vinculados, añadir: `"Vinculado a los riesgos: <ID1>, <ID2>."`.
- **Si no aplica:** redactar el motivo de exclusión (obligatorio; no puede
  quedar vacío). Ejemplo: `"Excluido: la organización no actúa como encargada
  del tratamiento (controles A.2)."`.

### Paso 5 — Calcular el estado de implementación

| Condición sobre las evidencias del control | Estado asignado |
|---|---|
| Al menos una evidencia con `estado: "implementado"` | `implementado` |
| Solo hay evidencias con `estado: "parcial"` | `parcial` |
| No hay evidencias para ese control | `no implementado` |
| Control excluido en el Paso 3 | `no aplica` |

 Nunca asignar `implementado` sin al menos una evidencia que lo respalde.

### Paso 6 — Vincular política organizacional (RAG semántico)
- Ejecutar búsqueda semántica sobre `knowledge/politicas/` con el `nombre`
  del control como consulta (umbral de similitud: ≥ 0.45).
- Si supera el umbral, registrar el identificador de la política en
  `politica_relacionada`. Si no, registrar `null`.

### Paso 7 — Identificar brechas
Brecha = control que **aplica** y cuyo estado **no** es `implementado`.

Por cada brecha registrar:
- `control`: ID del control
- `nombre`: nombre descriptivo del control
- `estado`: `"parcial"` o `"no implementado"`
- `solicitar_a`: el `agente_responsable` del catálogo

### Paso 8 — Calcular el resumen estadístico

```json
{
  "controles_evaluados": "<total de controles en catálogo>",
  "aplican": "<controles con aplica = true>",
  "excluidos": "<controles con aplica = false>",
  "implementados": "<controles con estado implementado>",
  "parciales": "<controles con estado parcial>",
  "no_implementados": "<controles con estado no implementado>"
}
```

### Paso 9 — Marcar supervisión humana obligatoria
- Siempre establecer `requiere_revision_humana: true`.
- La SoA es una **propuesta técnica auditada**, no un documento aprobado.
- La aprobación corresponde a la dirección o al DPO de la organización.

---

## Salida

```json
{
  "agente": "controles",
  "operacion": "generar_soa",
  "estado": "ok | rechazada",
  "respuesta": "SoA generada para <organización> (rol: <rol>). Controles evaluados: N; aplican: M; implementados: X; brechas: Y. Requiere revisión y aprobación humana.",
  "datos": {
    "soa": [
      {
        "control": "A.1.2.2",
        "nombre": "Identificar propósito",
        "aplica": true,
        "justificacion": "<justificación formal según rol y riesgos>",
        "estado": "implementado | parcial | no implementado | no aplica",
        "evidencias": ["<descripción de la evidencia>"],
        "politica_relacionada": "POL-01 | null",
        "responsable": "Agente de Inventario"
      }
    ],
    "brechas": [
      {
        "control": "A.1.2.6",
        "nombre": "Evaluación de impacto de privacidad (DPIA)",
        "estado": "no implementado",
        "solicitar_a": "Agente de Riesgos"
      }
    ],
    "resumen": {
      "controles_evaluados": 10,
      "aplican": 9,
      "excluidos": 1,
      "implementados": 1,
      "parciales": 1,
      "no_implementados": 7
    }
  },
  "fuentes": ["catalogo_controles.json"],
  "confianza": 1.0,
  "requiere_revision_humana": true
}
```

---

## Restricciones y reglas de oro

1. **Sin evidencia → sin "implementado":** Nunca declarar un control
   implementado sin al menos una evidencia con `estado: "implementado"`.
2. **Sin exclusión silenciosa:** Toda exclusión lleva justificación
   documentada; no puede omitirse ni dejarse vacía.
3. **Sin auto-aprobación:** El agente solo propone la SoA; nunca la aprueba.
4. **Sin controles inventados:** Solo procesar controles del catálogo;
   no añadir ni inferir controles que no estén en `catalogo_controles.json`.
5. **Sin inferencia de evidencias:** Si la evidencia no llega en la entrada,
   el control se considera `no implementado`, aunque se afirme verbalmente
   que está implementado.
