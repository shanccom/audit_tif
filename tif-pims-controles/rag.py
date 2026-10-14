import glob
import os
from functools import lru_cache

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer


@lru_cache(maxsize=1)
def get_model():
    # Modelo local multilingüe (funciona bien en español)
    return SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")


class Indice:
    """Índice vectorial: textos + metadatos, búsqueda por similitud."""

    def __init__(self, textos, metas):
        self.textos, self.metas = textos, metas
        self.index = None
        if not textos:
            return
        vecs = get_model().encode(textos, normalize_embeddings=True)
        self.index = faiss.IndexFlatIP(vecs.shape[1])  # producto interno = coseno
        self.index.add(np.asarray(vecs, dtype="float32"))

    def buscar(self, consulta, k=3):
        if self.index is None:
            return []
        q = np.asarray(
            get_model().encode([consulta], normalize_embeddings=True), dtype="float32"
        )
        scores, ids = self.index.search(q, min(k, len(self.textos)))
        return [
            {"texto": self.textos[i], "meta": self.metas[i], "score": float(s)}
            for s, i in zip(scores[0], ids[0])
            if i != -1
        ]


def desde_carpeta(carpeta):
    """Lee los .md de una carpeta, une encabezados con sus párrafos y extrae metadatos limpios."""
    textos, metas = [], []
    for ruta in sorted(glob.glob(os.path.join(carpeta, "*.md"))):
        with open(ruta, encoding="utf-8") as f:
            contenido = f.read()

        partes = [p.strip() for p in contenido.split("\n\n") if p.strip()]
        i = 0
        while i < len(partes):
            p = partes[i]
            # Si el bloque es muy corto (< 100 caracteres) y parece un encabezado
            if len(p) < 100 and (p.startswith("#") or ":" in p or p.startswith("ISO/IEC") or p.startswith("Normativa")):
                if i + 1 < len(partes):
                    titulo = p.replace("#", "").strip()
                    cuerpo = partes[i + 1]
                    texto_completo = f"{titulo}\n\n{cuerpo}"
                    meta_label = titulo.split("\n")[0].strip().rstrip(":")
                    textos.append(texto_completo)
                    metas.append(meta_label)
                    i += 2
                    continue

            # Bloque con contenido completo
            if len(p) >= 80:
                lineas = [l for l in p.split("\n") if l.strip()]
                primera = lineas[0].replace("#", "").strip()
                meta_label = primera.split(":")[0].strip() if ":" in primera else primera[:90]
                textos.append(p)
                metas.append(meta_label)
            i += 1

    return Indice(textos, metas)
