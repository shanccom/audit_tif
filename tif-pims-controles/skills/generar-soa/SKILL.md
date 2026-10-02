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
- base_politicas: repositorio corporativo de políticas y directivas (indexado en knowledge/politicas/)

## Pasos
1. Validar la entrada. Si falta perfil.rol o no es válido, rechazar con estado
   "rechazada".
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
6. Buscar en el repositorio de políticas (búsqueda semántica) una política
   relacionada y registrarla como referencia.
7. Identificar brechas: controles que aplican y no están implementados, indicando
   a qué agente solicitar la evidencia.
8. Armar la SoA (una fila por control) y un resumen con totales.
9. Marcar requiere_revision_humana = true: la SoA debe ser aprobada por la
   dirección o el responsable del PIMS.

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

## Restricciones
- No declarar un control "implementado" sin evidencia que lo respalde.
- No omitir controles del catálogo: toda exclusión lleva justificación.
- No aprobar la SoA: solo la propone.
- No inventar controles ni números de control que no estén en el catálogo.
