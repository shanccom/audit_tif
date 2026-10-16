"""
Cliente local de Ollama para el Agente de Controles PIMS.

Se comunica con la API REST de Ollama (http://localhost:11434)
para generar respuestas enriquecidas con IA generativa local.
"""

import json
import os
import requests

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "qwen2.5:0.5b")
OLLAMA_TIMEOUT = int(os.environ.get("OLLAMA_TIMEOUT", "20"))

# Prompt del sistema para el agente de controles
SYSTEM_PROMPT = """\
Eres un asistente experto en auditoría de sistemas de gestión de privacidad \
de la información (PIMS) según la norma ISO/IEC 27701:2025. \
Trabajas para la Universidad Nacional de San Agustín de Arequipa (UNSA). \
Tu rol es analizar controles de privacidad, evaluar evidencias documentales \
y emitir recomendaciones técnicas precisas en español. \
Responde de forma concisa, profesional y citando los controles normativos relevantes.\
"""


def _disponible():
    """Verifica si el servidor Ollama está activo."""
    try:
        r = requests.get(f"{OLLAMA_URL}/api/tags", timeout=3)
        return r.status_code == 200
    except Exception:
        return False


def generar(prompt, system=None, temperature=0.3, max_tokens=1024):
    """
    Genera una respuesta usando Ollama.

    Devuelve el texto generado o None si Ollama no está disponible
    (para que el agente pueda usar su lógica determinista como fallback).
    """
    if not _disponible():
        return None

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "system": system or SYSTEM_PROMPT,
        "stream": False,
        "options": {
            "temperature": temperature,
            "num_predict": max_tokens,
        },
    }

    try:
        resp = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json=payload,
            timeout=OLLAMA_TIMEOUT,
        )
        if resp.status_code == 200:
            return resp.json().get("response", "").strip()
    except Exception:
        pass

    return None


def enriquecer_consulta_rag(consulta, fragmentos_rag):
    """
    Dado una consulta del usuario y los fragmentos recuperados por FAISS,
    genera una respuesta elaborada en lenguaje natural usando la IA.
    """
    if not fragmentos_rag:
        return None

    contexto = "\n\n---\n\n".join(
        f"[Fuente: {h['meta']}]\n{h['texto']}" for h in fragmentos_rag
    )

    prompt = f"""\
Contexto normativo recuperado de la base de conocimiento institucional:

{contexto}

---

Consulta del auditor: {consulta}

Instrucciones:
- Responde la consulta directamente en 1 o 2 párrafos concisos y bien estructurados.
- Basa tu respuesta en el contexto normativo proporcionado y menciona las directivas aplicables.
- Si no hay información suficiente en el contexto, indícalo de forma clara.
"""
    return generar(prompt, max_tokens=250)


def enriquecer_soa(soa_filas, resumen, organizacion, rol):
    """
    Genera un análisis ejecutivo de la SoA usando IA.
    """
    # Preparar resumen de brechas para el prompt
    brechas = [f for f in soa_filas if f["aplica"] and f["estado"] != "implementado"]
    brechas_texto = "\n".join(
        f"- {b['control']} ({b['nombre']}): estado '{b['estado']}'"
        for b in brechas
    ) or "No se identificaron brechas."

    implementados_texto = "\n".join(
        f"- {f['control']} ({f['nombre']})"
        for f in soa_filas if f["estado"] == "implementado"
    ) or "Ningún control implementado."

    prompt = f"""\
Se ha generado la Declaración de Aplicabilidad (SoA) ISO/IEC 27701:2025 para:
- Organización: {organizacion}
- Rol: {rol}

Resumen cuantitativo:
- Controles evaluados: {resumen['controles_evaluados']}
- Controles aplicables: {resumen['aplican']}
- Implementados: {resumen['implementados']}
- Parciales: {resumen['parciales']}
- No implementados (brechas): {resumen['no_implementados']}
- Excluidos: {resumen['excluidos']}

Controles implementados:
{implementados_texto}

Brechas identificadas:
{brechas_texto}

Genera un ANÁLISIS EJECUTIVO breve (máx. 150 palabras) que:
1. Resuma el nivel de madurez de privacidad de la organización.
2. Destaque las brechas más críticas y su impacto potencial.
3. Proponga las 2-3 acciones prioritarias inmediatas.
Responde en español profesional.
"""
    return generar(prompt, max_tokens=512)


def enriquecer_verificacion(fila_control):
    """
    Genera una recomendación detallada para un control individual usando IA.
    """
    evidencias_texto = "\n".join(
        f"  - {e}" for e in fila_control.get("evidencias", [])
    ) or "  (Sin evidencias registradas)"

    prompt = f"""\
Control auditado: {fila_control['control']} - {fila_control['nombre']}
¿Aplica?: {'Sí' if fila_control['aplica'] else 'No'}
Justificación: {fila_control['justificacion']}
Estado actual: {fila_control['estado']}
Evidencias presentadas:
{evidencias_texto}
Política relacionada: {fila_control.get('politica_relacionada', 'No identificada')}
Agente responsable: {fila_control['responsable']}

Genera una RECOMENDACIÓN TÉCNICA DETALLADA (máx. 100 palabras) que:
1. Evalúe la suficiencia de las evidencias presentadas.
2. Indique acciones concretas para alcanzar el cumplimiento pleno.
3. Cite las cláusulas relevantes de ISO/IEC 27701:2025.
Responde en español profesional.
"""
    return generar(prompt, max_tokens=300)


def esta_disponible():
    """Interfaz pública para verificar disponibilidad de Ollama."""
    return _disponible()
