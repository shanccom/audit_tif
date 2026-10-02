---
name: verificar-controles
description: Verifica el estado de implementación de un control concreto del PIMS
  (ISO/IEC 27701:2025), identifica la brecha y recomienda la siguiente acción.
  Usar cuando se pregunte si un control está implementado o qué falta.
---

# Verificar un control

## Activación
Se ejecuta cuando se pide revisar un control específico (por ejemplo A.1.2.6) o
saber qué falta para cumplirlo.

## Entrada
- control: identificador (por ejemplo "A.1.2.6")
- perfil: { rol }
- riesgos y evidencias (mismo formato que en generar-soa)

## Pasos
1. Validar: el control debe existir en el catálogo y el rol ser válido.
2. Determinar si el control aplica al rol (misma regla A.1 / A.2 / A.3).
3. Reunir las evidencias de ese control.
4. Buscar una política relacionada en el repositorio.
5. Determinar el estado (implementado / parcial / no implementado / no aplica).
6. Recomendar la siguiente acción y a qué agente pedirla:
   - no aplica: documentar la exclusión en la SoA.
   - implementado: mantener la evidencia vigente para la auditoría interna (9.2).
   - parcial: completar la implementación con el agente responsable.
   - no implementado: solicitar evidencia o implementación al agente responsable.
7. Devolver el resultado en el contrato estándar.

## Salida
Mismo contrato que generar-soa; en datos va una fila con: control, nombre, aplica,
justificacion, estado, evidencias, politica_relacionada, responsable, recomendacion.

## Restricciones
- Basar el estado únicamente en evidencias recibidas.
- Si el control no está en el catálogo, decirlo y no inventar información.
