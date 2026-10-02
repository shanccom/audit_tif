= Desarrollo Metodológico e Implementación

== De Prompt a Skill: Transformación y Metodología

En las etapas iniciales de la adopción de inteligencia artificial en auditoría, las tareas de verificación suelen abordarse mediante *prompts* empíricos enviados directamente a un modelo de lenguaje. Sin embargo, en un entorno de cumplimiento regulatorio e inspección de seguridad, los prompts presentan debilidades estructurales críticas:

#table(
  columns: (1.2fr, 2.2fr, 2.2fr),
  align: (center, left, left),
  stroke: 0.5pt + rgb("#b8c2cc"),
  fill: (_, row) => if row == 0 { rgb("#d9e8f5") } else { none },
  [*Dimensión*], [*Enfoque con Prompt Tradicional*], [*Enfoque con Skill Especializado*],
  [Determinismo], [Comportamiento estocástico; respuestas variables ante una misma entrada], [Ejecución algorítmica con reglas de negocio fijas e invariantes],
  [Estructura de Datos], [Texto libre no tipado, dependiente de la formulación del prompt], [Contrato JSON estricto con validación de esquemas y tipos],
  [Rigor Probatorio], [Propenso a alucinar "implementado" por cortesía conversacional], [Imposibilidad de asignar "implementado" sin evidencias verificables],
  [Trazabilidad], [Omite justificaciones o inventa motivos no normativos], [Justificación formal obligatoria vinculada al rol y al catálogo],
  [Reusabilidad], [Requiere reescribir y refinar la instrucción en cada consulta], [Invocación modular estandarizada por humanos o por el orquestador]
)

=== Transformación del Caso 1: Elaboración de la SoA
- *Prompt Original:* _"Con esta información de mi organización, dime qué controles de ISO 27701 aplican, por qué, y en qué estado de implementación están."_
- *Skill Resultante (`generar-soa`):* Procedimiento formal que valida el rol (`responsable`, `encargado`, `ambos`), analiza los riesgos vinculados, computa el estado de implementación a partir de la matriz de evidencias, consulta políticas en FAISS y emite la SoA completa junto al resumen de brechas y la bandera obligatoria de supervisión humana (`requiere_revision_humana = true`).

=== Transformación del Caso 2: Auditoría de un Control Específico
- *Prompt Original:* _"Revisa si el control de DPIA está realmente implementado con estas evidencias y dime qué falta."_
- *Skill Resultante (`verificar-controles`):* Procedimiento especializado que valida la existencia del control en el catálogo normativo, computa la brecha exacta y formula una recomendación prescriptiva indicando qué agente específico debe subsanar la deficiencia.

== Especificación Formal de los Skills

Los Skills se definen siguiendo el estándar de especificación de agentes, almacenados en archivos `SKILL.md` dentro del directorio `skills/`.

=== Ficha Técnica del Skill `generar-soa`
- *Nombre:* `generar-soa`
- *Descripción:* Elabora la Declaración de Aplicabilidad (SoA) integral conforme a ISO/IEC 27701:2025.
- *Condición de Activación:* Peticiones de elaboración, actualización o auditoría completa de la SoA organizacional.
- *Entradas:*
  - `perfil`: `{ organizacion: string, rol: "responsable" | "encargado" | "ambos" }`
  - `riesgos`: Lista de `{ id: string, descripcion: string, controles: string[] }`
  - `evidencias`: Lista de `{ control: string, descripcion: string, estado: "implementado" | "parcial" }`
- *Algoritmo de Ejecución:*
  1. Validar la obligatoriedad y formato del rol. Si es inválido, abortar con estado `"rechazada"`.
  2. Cargar el catálogo normativo oficial (`catalogo_controles.json`).
  3. Evaluar aplicabilidad: controles `A.1` (requieren rol responsable o ambos), `A.2` (encargado o ambos), `A.3` (universal).
  4. Redactar justificación técnica; asociar IDs de riesgos del Agente de Riesgos si aplica.
  5. Computar el estado estrictamente en base a evidencias recibidas: `implementado`, `parcial`, `no implementado` o `no aplica`.
  6. Consultar mediante embeddings y FAISS la política organizacional vinculada.
  7. Identificar brechas y asignar el agente responsable de su subsanación.
  8. Consolidar totales estadísticos y marcar obligatoriamente `requiere_revision_humana = true`.
- *Restricciones Clave:* Prohibición absoluta de declarar controles implementados sin evidencias documentadas; justificación obligatoria para toda exclusión; emisión en calidad de propuesta técnica sin auto-aprobación.

=== Ficha Técnica del Skill `verificar-controles`
- *Nombre:* `verificar-controles`
- *Descripción:* Evalúa el estado de cumplimiento de un control normativo puntual e identifica acciones correctivas.
- *Entradas:* `control` (ID normativo, ej. `"A.1.2.6"`), `perfil` (`rol`), `riesgos` y `evidencias`.
- *Salida:* Fila estructurada de control con diagnóstico detallado y recomendación prescriptiva dirigida al agente correspondiente.

== Definición y Modelado del Asistente

El Asistente de Controles se modela bajo un principio de especialización estricta:

- *Identidad Sistémica:* _"Soy el Agente de Controles del sistema de gestión de privacidad (PIMS) basado en ISO/IEC 27701:2025. Mi función es determinar qué controles del Anexo A aplican a la organización, generar la Declaración de Aplicabilidad (SoA) y verificar el estado de implementación de cada control."_
- *Directrices Operativas:* Priorizar la ejecución de los Skills estructurados; no realizar inferencias especulativas sobre la existencia de documentos no provistos; rechazar entradas con datos incompletos solicitando la aclaración de perfil; mantener estricta neutralidad y trazabilidad auditable.
- *Base de Conocimiento Local:*
  - `knowledge/catalogo_controles.json`: Catálogo de controles con metadatos y agente responsable.
  - `knowledge/normativa/resumen_27701.md`: Síntesis autorizada de cláusulas de ISO/IEC 27701:2025.
  - `knowledge/politicas/politica_privacidad_ejemplo.md`: Repositorio corporativo de políticas de privacidad.

== Arquitectura del Sistema y Contratos de Integración

La solución se estructura mediante una arquitectura desacoplada basada en microservicios y protocolos JSON, preparada para su despliegue individual o coordinado mediante un bus de integración.

#align(center)[
  #image("../imagenes/Arquitectura.png", width: 95%)
]
#align(center)[_Figura 1: Arquitectura de Componentes del Ecosistema PIMS y el Agente de Controles._]

=== Contrato Estándar de Comunicación Inter-Agentes
Para garantizar la interoperabilidad entre los 8 agentes del PIMS, se estableció una estructura JSON uniforme:

```json
{
  "agente": "controles",
  "operacion": "generar_soa | verificar_control | consultar",
  "estado": "ok | rechazada | sin_respuesta",
  "respuesta": "Resumen ejecutivo en lenguaje natural",
  "datos": {
    "soa": [ /* Matriz de controles evaluados */ ],
    "brechas": [ /* Controles aplicables no implementados con responsable */ ],
    "resumen": { /* Métricas agregadas */ }
  },
  "fuentes": ["catalogo_controles.json", "politica_privacidad_ejemplo.md"],
  "confianza": 1.0,
  "requiere_revision_humana": true
}
```

=== Flujo de Ejecución e Interacción Temporal
El procesamiento de la solicitud de generación de SoA sigue una secuencia coordinada entre el usuario, el servidor web, el orquestador y los agentes:

#align(center)[
  #image("../imagenes/Flujo.png", width: 95%)
]
#align(center)[_Figura 2: Diagrama de Secuencia del flujo de generación y verificación de la SoA._]

== Tecnologías, Motor Determinista e Infraestructura

La implementación técnica adopta un enfoque híbrido que balancea determinismo, privacidad de datos y eficiencia computacional:

1. *Lenguaje Backend y Servidor Web:* Desarrollado en *Python 3* utilizando el microframework *Flask* para exponer endpoints REST (`/api/controles/ejecutar` y `/api/controles/catalogo`).
2. *Motor de Reglas Determinista:* Métodos puros `_aplica()` y `_estado()` en `AgenteControles`. A diferencia de los modelos generativos estocásticos, las reglas lógicas garantizan que la evaluación del Anexo A sea 100% reproducible y auditable, eliminando el riesgo de alucinaciones en decisiones regulatorias.
3. *Motor de Embeddings Local:* Empleo de `SentenceTransformer` con el modelo multilingüe `paraphrase-multilingual-MiniLM-L12-v2` @reimers2019sentencebert, que procesa semántica en español de forma 100% offline en CPU local sin latencia de red ni costos de API externa.
4. *Indexación Vectorial con FAISS:* Utilización de `faiss-cpu` @johnson2019billion con métrica de producto interno (`IndexFlatIP`) sobre vectores normalizados para búsqueda de similitud coseno ultrarrápida en memoria.
5. *Integración Opcional de SLMs/LLMs:* En consultas conceptuales (`_consultar`), el sistema permite conectar un modelo de lenguaje local (e.g. Ollama con Llama 3 o Mistral) para enriquecer la redacción, restringiendo su contexto a los fragmentos recuperados por FAISS, manteniendo las reglas de la SoA estrictamente en código.
6. *Estrategia de Despliegue e Infraestructura:* Diseñado para ejecutarse en computadoras de laboratorio o desplegarse mediante contenedores *Docker*, permitiendo que las instancias de los diferentes grupos interactúen de forma homogénea en una red local o en servidores virtuales (VPS) asegurando soberanía de datos.

== Demostración y Plan de Pruebas

Se diseñó una batería de 6 casos de prueba exhaustivos para validar la integridad del agente:

#table(
  columns: (0.5fr, 1.3fr, 1.8fr, 2.4fr),
  align: (center, center, left, left),
  stroke: 0.5pt + rgb("#b8c2cc"),
  fill: (_, row) => if row == 0 { rgb("#d9e8f5") } else { none },
  [*N°*], [*Caso de Prueba*], [*Datos de Entrada*], [*Resultado Esperado y Verificado*],
  [1], [Generación SoA (Responsable)], [Rol: `responsable`, Riesgo: `R1`, Evidencias: `A.1.2.2` (imp.), `A.3.12` (parcial)], [10 evaluados, 9 aplican, 1 excluido (`A.2.5.7`), 1 implementado, 1 parcial, 7 no implementados. 8 brechas detectadas. Flag `requiere_revision_humana: true`.],
  [2], [Cambio de Rol a Encargado], [Rol: `encargado`, mismas evidencias], [Controles `A.1` quedan excluidos con justificación formal; aplican `A.2.5.7` y controles comunes `A.3`.],
  [3], [Cambio de Rol a Ambos], [Rol: `ambos`], [Los 10 controles del catálogo aplican en su totalidad con sus respectivas justificaciones.],
  [4], [Verificación Puntual (A.1.2.6)], [Control: `A.1.2.6`, Rol: `responsable`, sin evidencias], [Estado: `no implementado`. Recomendación prescriptiva: "Solicitar evidencia o implementación al Agente de Riesgos".],
  [5], [Consulta Normativa RAG], [Pregunta: "¿Qué debe incluir la Declaración de Aplicabilidad?"], [Recuperación semántica de fragmentos de `resumen_27701.md`, fuentes citadas y nivel de confianza calculado.],
  [6], [Validación de Entrada Errónea], [Entrada sin campo `perfil.rol` o rol inválido], [Rechazo inmediato con estado `"rechazada"` y mensaje descriptivo de error, sin fallos de ejecución.]
)
