import json
import os

from rag import desde_carpeta

ROLES = ("responsable", "encargado", "ambos")
UMBRAL_POLITICA = 0.30   # similitud mínima para citar una política relacionada
UMBRAL_CONSULTA = 0.30   # similitud mínima para responder una consulta conceptual


class AgenteControles:
    nombre = "controles"
    descripcion = (
        "Genera la Declaración de Aplicabilidad (SoA) y verifica la "
        "implementación de controles de ISO/IEC 27701:2025."
    )
    ejemplos = [
        "Genera la declaración de aplicabilidad",
        "¿Qué controles aplican a una organización responsable?",
        "Verifica si el control A.1.2.6 está implementado",
        "¿Qué controles faltan por implementar?",
        "Actualiza la SoA con las nuevas evidencias",
    ]

    def __init__(self, carpeta=None):
        if carpeta is None:
            base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            carpeta = os.path.join(base, "knowledge")
        with open(os.path.join(carpeta, "catalogo_controles.json"), encoding="utf-8") as f:
            self.catalogo = json.load(f)
        self.normativa = desde_carpeta(os.path.join(carpeta, "normativa"))
        self.politicas = desde_carpeta(os.path.join(carpeta, "politicas"))

    # ------------------------------------------------------------------
    # Punto de entrada único (contrato estándar)
    # ------------------------------------------------------------------
    def ejecutar(self, entrada):
        operacion = entrada.get("operacion", "consultar")
        try:
            if operacion == "generar_soa":
                return self._generar_soa(entrada)
            if operacion == "verificar_control":
                return self._verificar_control(entrada)
            return self._consultar(entrada.get("solicitud", ""))
        except ValueError as e:
            return self._resp(operacion, "rechazada", f"Entrada inválida: {e}")

    # ------------------------------------------------------------------
    # Motor de reglas
    # ------------------------------------------------------------------
    @staticmethod
    def _aplica(control, rol):
        ambito = control["id"][:3]  # "A.1", "A.2" o "A.3"
        if ambito == "A.3":
            return True, "Control común de seguridad: aplica a cualquier rol."
        if ambito == "A.1":
            if rol in ("responsable", "ambos"):
                return True, "La organización actúa como responsable del tratamiento."
            return False, "Excluido: la organización no actúa como responsable (controles A.1)."
        if ambito == "A.2":
            if rol in ("encargado", "ambos"):
                return True, "La organización actúa como encargada del tratamiento."
            return False, "Excluido: la organización no actúa como encargada (controles A.2)."
        raise ValueError(f"ámbito desconocido en el control {control['id']}")

    @staticmethod
    def _estado(control_id, evidencias):
        propias = [e for e in evidencias if e.get("control") == control_id]
        if any(e.get("estado") == "implementado" for e in propias):
            return "implementado", propias
        if any(e.get("estado") == "parcial" for e in propias):
            return "parcial", propias
        return "no implementado", propias

    def _fila(self, control, rol, riesgos, evidencias):
        aplica, justificacion = self._aplica(control, rol)
        vinculados = [r["id"] for r in riesgos if control["id"] in r.get("controles", [])]
        if aplica and vinculados:
            justificacion += f" Vinculado a los riesgos: {', '.join(vinculados)}."

        if aplica:
            estado, propias = self._estado(control["id"], evidencias)
        else:
            estado, propias = "no aplica", []

        # Herramienta: repositorio de políticas (búsqueda semántica con FAISS)
        hits = self.politicas.buscar(control["nombre"], k=1)
        politica = hits[0]["meta"] if hits and hits[0]["score"] >= UMBRAL_POLITICA else None

        return {
            "control": control["id"],
            "nombre": control["nombre"],
            "aplica": aplica,
            "justificacion": justificacion,
            "estado": estado,
            "evidencias": [e.get("descripcion", "") for e in propias],
            "politica_relacionada": politica,
            "responsable": control["agente_responsable"],
        }

    # ------------------------------------------------------------------
    # Skill 1: generar-soa
    # ------------------------------------------------------------------
    def _generar_soa(self, entrada):
        perfil = entrada.get("perfil") or {}
        rol = perfil.get("rol")
        if rol not in ROLES:
            raise ValueError("perfil.rol debe ser 'responsable', 'encargado' o 'ambos'")
        riesgos = entrada.get("riesgos", [])
        evidencias = entrada.get("evidencias", [])

        soa = [self._fila(c, rol, riesgos, evidencias) for c in self.catalogo]
        aplicables = [f for f in soa if f["aplica"]]
        brechas = [
            {"control": f["control"], "nombre": f["nombre"], "estado": f["estado"],
             "solicitar_a": f["responsable"]}
            for f in aplicables if f["estado"] != "implementado"
        ]
        resumen = {
            "controles_evaluados": len(soa),
            "aplican": len(aplicables),
            "excluidos": len(soa) - len(aplicables),
            "implementados": sum(f["estado"] == "implementado" for f in aplicables),
            "parciales": sum(f["estado"] == "parcial" for f in aplicables),
            "no_implementados": sum(f["estado"] == "no implementado" for f in aplicables),
        }
        org = perfil.get("organizacion", "la organización")
        texto = (
            f"SoA generada para {org} (rol: {rol}). Controles evaluados: "
            f"{resumen['controles_evaluados']}; aplican: {resumen['aplican']}; "
            f"implementados: {resumen['implementados']}; brechas: {len(brechas)}. "
            "Requiere revisión y aprobación humana."
        )
        return self._resp(
            "generar_soa", "ok", texto,
            datos={"soa": soa, "brechas": brechas, "resumen": resumen},
            fuentes=["catalogo_controles.json"], confianza=1.0, revision=True,
        )

    # ------------------------------------------------------------------
    # Skill 2: verificar-controles
    # ------------------------------------------------------------------
    def _verificar_control(self, entrada):
        cid = entrada.get("control")
        control = next((c for c in self.catalogo if c["id"] == cid), None)
        if control is None:
            raise ValueError(f"el control '{cid}' no está en el catálogo")
        rol = (entrada.get("perfil") or {}).get("rol")
        if rol not in ROLES:
            raise ValueError("perfil.rol debe ser 'responsable', 'encargado' o 'ambos'")

        fila = self._fila(control, rol, entrada.get("riesgos", []), entrada.get("evidencias", []))
        fila["recomendacion"] = self._recomendar(fila)
        texto = f"Control {fila['control']} ({fila['nombre']}): {fila['estado']}. {fila['recomendacion']}"
        return self._resp(
            "verificar_control", "ok", texto, datos=fila,
            fuentes=["catalogo_controles.json"], confianza=1.0,
        )

    @staticmethod
    def _recomendar(fila):
        if not fila["aplica"]:
            return "Documentar la exclusión y su justificación en la SoA."
        if fila["estado"] == "implementado":
            return "Mantener la evidencia vigente para la auditoría interna (cláusula 9.2)."
        if fila["estado"] == "parcial":
            return f"Completar la implementación; coordinar con el {fila['responsable']}."
        return f"Solicitar evidencia o implementación al {fila['responsable']}."

    # ------------------------------------------------------------------
    # Consulta conceptual (base de conocimiento)
    # ------------------------------------------------------------------
    def _consultar(self, solicitud):
        if not solicitud.strip():
            return self._resp("consultar", "rechazada", "La consulta está vacía.")
        hits = self.normativa.buscar(solicitud, k=3)
        if not hits or hits[0]["score"] < UMBRAL_CONSULTA:
            return self._resp(
                "consultar", "sin_respuesta",
                "No tengo información suficiente en mi base de conocimiento para responder.",
                confianza=hits[0]["score"] if hits else 0.0,
            )
        return self._resp(
            "consultar", "ok", "\n\n".join(h["texto"] for h in hits),
            datos={"hits": hits},
            fuentes=sorted({h["meta"] for h in hits}),
            confianza=round(hits[0]["score"], 3),
        )

    # ------------------------------------------------------------------
    @staticmethod
    def _resp(operacion, estado, respuesta, datos=None, fuentes=None,
              confianza=0.0, revision=False):
        return {
            "agente": "controles",
            "operacion": operacion,
            "estado": estado,
            "respuesta": respuesta,
            "datos": datos or {},
            "fuentes": fuentes or [],
            "confianza": confianza,
            "requiere_revision_humana": revision,
        }
