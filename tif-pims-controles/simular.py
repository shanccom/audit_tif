"""
Script de simulación: ejecuta el Agente de Controles directamente
sin necesitar el servidor Flask corriendo.

Uso:
    python simular.py

Edita la variable PAYLOAD con tu JSON de simulación.
"""
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from agents.controles import AgenteControles

# ────────────────────────────────────────────────────────
# PEGA AQUÍ TU JSON DE SIMULACIÓN
# ────────────────────────────────────────────────────────
PAYLOAD = {
  "operacion": "generar_soa",
  "perfil": {
    "organizacion": "Universidad Nacional de San Agustín (UNSA)",
    "rol": "responsable"
  },
  "riesgos": [
    {
      "id": "R-UNSA-01",
      "descripcion": "Acceso no autorizado a datos de postulantes en SISUNSA",
      "controles": ["A.1.2.2", "A.1.2.9", "A.3.11"]
    },
    {
      "id": "R-UNSA-02",
      "descripcion": "Tratamiento de datos biométricos en Comedor Universitario sin DPIA",
      "controles": ["A.1.2.6", "A.1.2.7"]
    },
    {
      "id": "R-UNSA-03",
      "descripcion": "Ausencia de protocolo de respuesta a incidentes en OTIC",
      "controles": ["A.3.11", "A.3.12"]
    },
    {
      "id": "R-UNSA-04",
      "descripcion": "Personal sin capacitación en protección de datos",
      "controles": ["A.3.17"]
    },
    {
      "id": "R-UNSA-05",
      "descripcion": "No se garantiza ejercicio de derechos ARCO en Admisión y Biblioteca",
      "controles": ["A.1.3.7", "A.1.3.9"]
    }
  ],
  "evidencias": [
    {
      "control": "A.1.2.2",
      "descripcion": "[Archivo: Politica-Privacidad-UNSA-2025.pdf] Política institucional aprobada por RR N°0089-2025",
      "estado": "implementado"
    },
    {
      "control": "A.1.2.9",
      "descripcion": "[Archivo: RAT-SISUNSA-v2.xlsx] Registro de Actividades de Tratamiento aprobado por ODP",
      "estado": "implementado"
    },
    {
      "control": "A.1.2.6",
      "descripcion": "[Doc: DPIA-Biometria-Borrador-v1.docx] Borrador preliminar sin aprobación formal",
      "estado": "parcial"
    },
    {
      "control": "A.3.17",
      "descripcion": "[Registro: Capacitacion-Privacidad-Oct2025.pdf] Sesión a 45 trabajadores el 10/10/2025",
      "estado": "implementado"
    }
  ]
}
# ────────────────────────────────────────────────────────

def main():
    base = os.path.dirname(os.path.abspath(__file__))
    knowledge_dir = os.path.join(base, "knowledge")

    print("🔄 Iniciando Agente de Controles...")
    agente = AgenteControles(carpeta=knowledge_dir)

    print(f"⚙️  Ejecutando operación: '{PAYLOAD.get('operacion')}'...\n")
    resultado = agente.ejecutar(PAYLOAD)

    # ── Mostrar resultado completo ──
    print("=" * 60)
    print("📋 RESULTADO COMPLETO (JSON)")
    print("=" * 60)
    print(json.dumps(resultado, ensure_ascii=False, indent=2))

    # ── Mostrar resumen legible si es generar_soa ──
    if resultado.get("operacion") == "generar_soa" and resultado.get("estado") == "ok":
        datos = resultado.get("datos", {})
        resumen = datos.get("resumen", {})
        brechas = datos.get("brechas", [])
        soa = datos.get("soa", [])

        print("\n" + "=" * 60)
        print("📊 RESUMEN DE MÉTRICAS")
        print("=" * 60)
        for k, v in resumen.items():
            print(f"  {k:<25}: {v}")

        print("\n" + "=" * 60)
        print("📑 MATRIZ SoA")
        print("=" * 60)
        for fila in soa:
            icono = {"implementado": "✅", "parcial": "⚠️ ", "no implementado": "❌", "no aplica": "➖"}.get(fila["estado"], "?")
            print(f"  {icono} {fila['control']:<10} {fila['nombre']:<45} [{fila['estado']}]")

        print("\n" + "=" * 60)
        print(f"🚨 BRECHAS DETECTADAS ({len(brechas)})")
        print("=" * 60)
        for b in brechas:
            print(f"  ❌ {b['control']:<10} {b['nombre']:<40} → {b['solicitar_a']}")

        print(f"\n⚠️  requiere_revision_humana: {resultado.get('requiere_revision_humana')}")


if __name__ == "__main__":
    main()
