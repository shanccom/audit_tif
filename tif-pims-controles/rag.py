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
    """Lee los .md de una carpeta y los parte por párrafos extrayendo su identificador."""
    textos, metas = [], []
    for ruta in sorted(glob.glob(os.path.join(carpeta, "*.md"))):
        with open(ruta, encoding="utf-8") as f:
            for parte in f.read().split("\n\n"):
                p = parte.strip()
                if p:
                    textos.append(p)
                    primera_linea = p.split("\n")[0].replace("#", "").strip()
                    if ":" in primera_linea and len(primera_linea.split(":")[0]) < 80:
                        meta_label = primera_linea.split(":")[0].strip()
                    elif len(primera_linea) < 70:
                        meta_label = primera_linea
                    else:
                        meta_label = os.path.basename(ruta)
                    metas.append(meta_label)
    return Indice(textos, metas)
