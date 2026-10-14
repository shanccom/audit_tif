#!/usr/bin/env python3
"""
simulador_mas.py - Simulador de Interacción Multi-Agente (MAS) para la UNSA.
Demuestra cómo el Agente de Controles y SoA consume e integra las salidas
simuladas de los otros 7 agentes para emitir la Declaración de Aplicabilidad.
"""

import os
import sys
import json
import argparse
from pathlib import Path

# Colores ANSI para presentación ejecutiva en terminal
CYAN = "\033[96m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BOLD = "\033[1m"
RESET = "\033[0m"

BASE_DIR = Path(__file__).resolve().parent.parent
SIM_DIR = BASE_DIR / "knowledge" / "simulacion_agentes"

def print_header(title: str):
    print(f"\n{BOLD}{CYAN}{'=' * 80}{RESET}")
    print(f"{BOLD}{CYAN}  {title}{RESET}")
    print(f"{BOLD}{CYAN}{'=' * 80}{RESET}\n")

def mostrar_agente(nombre_agente: str):
    archivo = SIM_DIR / f"agente_{nombre_agente}_output.json"
    if not archivo.exists():
        print(f"{RED}[!] Error: No se encontró plantilla para {nombre_agente} ({archivo}){RESET}")
        return

    with open(archivo, "r", encoding="utf-8") as f:
        data = json.load(f)

    print_header(f"SALIDA EMITIDA POR EL AGENTE: [{nombre_agente.upper()}]")
    print(f"{YELLOW}• Origen:{RESET} {archivo.name}")
    print(f"{YELLOW}• Formato:{RESET} JSON Estructurado para el Orquestador MAS\n")
    print(json.dumps(data, indent=2, ensure_ascii=False))

def ejecutar_orquestacion():
    print_header("SIMULACIÓN DE PIPELINE MULTI-AGENTE (n8n / ORQUESTADOR)")
    
    agentes = ["inventario", "riesgos", "terceros", "derechos", "evidencia"]
    print(f"{BOLD}[1/3] Recolectando salidas de los agentes colaboradores:{RESET}")
    for a in agentes:
        p = SIM_DIR / f"agente_{a}_output.json"
        estado = f"{GREEN}✓ Recibido (200 OK){RESET}" if p.exists() else f"{RED}✗ Faltante{RESET}"
        print(f"  • Agente de {a.capitalize():12} -> {estado}")

    payload_file = SIM_DIR / "payload_consolidado_n8n.json"
    if not payload_file.exists():
        print(f"{RED}[!] No existe el payload consolidado {payload_file}{RESET}")
        return

    with open(payload_file, "r", encoding="utf-8") as f:
        payload = json.load(f)

    print(f"\n{BOLD}[2/3] Ensamblando contrato JSON para el Agente de Controles:{RESET}")
    print(f"  • Entidad Auditada: {payload['perfil']['organizacion']}")
    print(f"  • Rol Evaluado:     {payload['perfil']['rol']}")
    print(f"  • Riesgos mapeados: {len(payload['riesgos'])}")
    print(f"  • Evidencias:       {len(payload['evidencias'])} artefactos verificados en disco")

    print(f"\n{BOLD}[3/3] Invocando al Agente de Controles (Motor Determinista + FAISS RAG)...{RESET}")
    sys.path.insert(0, str(BASE_DIR))
    from agents.controles import AgenteControles

    agente = AgenteControles(str(BASE_DIR / "knowledge"))
    resultado = agente.ejecutar(payload)

    print(f"\n{BOLD}{GREEN}✓ RESULTADO OFICIAL DE LA DECLARACIÓN DE APLICABILIDAD (SoA):{RESET}")
    print(f"{YELLOW}Estado:{RESET}     {resultado.get('estado')}")
    print(f"{YELLOW}Dictamen:{RESET}   {resultado.get('respuesta')}")
    
    resumen = resultado["datos"]["resumen"]
    print(f"\n{BOLD}Métricas Consolidadas de la SoA:{RESET}")
    print(f"  • Controles Evaluados: {resumen['controles_evaluados']}")
    print(f"  • Aplican a la UNSA:   {resumen['aplican']}")
    print(f"  • Excluidos por Rol:   {resumen['excluidos']} (A.2.5.7 Subcontratistas)")
    print(f"  • Implementados:       {GREEN}{resumen['implementados']}{RESET}")
    print(f"  • Parciales:           {YELLOW}{resumen['parciales']}{RESET}")
    print(f"  • No Implementados:    {RED}{resumen['no_implementados']}{RESET}")

    brechas = resultado["datos"]["brechas"]
    if brechas:
        print(f"\n{BOLD}{RED}Plan Prescriptivo de Brechas Asignadas a los Agentes Custodios:{RESET}")
        for b in brechas:
            print(f"  [!] Control {b['control']} ({b['nombre']}) -> Solicitar acción a: {BOLD}{b['solicitar_a']}{RESET}")

    print(f"\n{BOLD}Gobernanza Ética (Human-in-the-Loop):{RESET}")
    print(f"  • Bandera legal: requerida_revision_humana = {BOLD}{resultado['requiere_revision_humana']}{RESET}")
    print(f"  • Certificación: Sujeta a aprobación del DPO / Comité de Seguridad (Cláusulas 5.1 y 9.3 ISO 27701)\n")

def main():
    parser = argparse.ArgumentParser(description="Simulador de Ecosistema Multi-Agente (MAS) - UNSA")
    parser.add_argument("--agente", choices=["inventario", "riesgos", "terceros", "derechos", "evidencia"],
                        help="Muestra el payload JSON generado por un agente específico")
    parser.add_argument("--orquestar", action="store_true",
                        help="Ejecuta la consolidación completa en n8n y corre la SoA con nuestro agente")

    args = parser.parse_args()
    if args.agente:
        mostrar_agente(args.agente)
    elif args.orquestar:
        ejecutar_orquestacion()
    else:
        ejecutar_orquestacion()

if __name__ == "__main__":
    main()
