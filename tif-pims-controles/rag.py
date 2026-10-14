import glob
import os
import re
from functools import lru_cache

try:
    import faiss
    import numpy as np
    from sentence_transformers import SentenceTransformer
    HAVE_VECTOR = True
except Exception:
    HAVE_VECTOR = False


@lru_cache(maxsize=1)
def get_model():
    if not HAVE_VECTOR:
        return None
    # Modelo local multilingüe (funciona bien en español)
    return SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")


class Indice:
    """Índice vectorial: textos + metadatos, búsqueda por similitud."""

    def __init__(self, textos, metas):
        self.textos, self.metas = textos, metas
        self.index = None
        self.tokens_docs = []
        if not textos:
            return

        if HAVE_VECTOR:
            try:
                model = get_model()
                if model is not None:
                    vecs = model.encode(textos, normalize_embeddings=True)
                    self.index = faiss.IndexFlatIP(vecs.shape[1])  # producto interno = coseno
                    self.index.add(np.asarray(vecs, dtype="float32"))
                    return
            except Exception:
                self.index = None

        self._preparar_terminos()

    def _preparar_terminos(self):
        def tokenizar(txt):
            return set(re.findall(r"\w+", txt.lower()))

        self.tokens_docs = [tokenizar(t) for t in self.textos]

    def buscar(self, consulta, k=3):
        if not self.textos:
            return []

        if self.index is not None and HAVE_VECTOR:
            try:
                model = get_model()
                q = np.asarray(
                    model.encode([consulta], normalize_embeddings=True), dtype="float32"
                )
                scores, ids = self.index.search(q, min(k, len(self.textos)))
                return [
                    {"texto": self.textos[i], "meta": self.metas[i], "score": float(s)}
                    for s, i in zip(scores[0], ids[0])
                    if i != -1
                ]
            except Exception:
                pass

        if not self.tokens_docs:
            self._preparar_terminos()

        q_tokens = set(re.findall(r"\w+", consulta.lower()))
        if not q_tokens:
            return []

        resultados = []
        for i, doc_tokens in enumerate(self.tokens_docs):
            if not doc_tokens:
                continue
            meta_tokens = set(re.findall(r"\w+", self.metas[i].lower()))
            coincidencias = len(q_tokens & doc_tokens)
            coincidencias_meta = len(q_tokens & meta_tokens)
            score = (coincidencias * 1.5 + coincidencias_meta * 3.0) / (len(q_tokens) * 2.5)
            score = min(1.0, score)
            if score > 0:
                resultados.append({"texto": self.textos[i], "meta": self.metas[i], "score": round(score, 3)})

        resultados.sort(key=lambda x: x["score"], reverse=True)
        return resultados[:k]


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
                    if ":" in primera_linea and len(primera_linea.split(":")[0]) < 140:
                        meta_label = primera_linea.split(":")[0].strip()
                    elif len(primera_linea) < 140:
                        meta_label = primera_linea
                    else:
                        meta_label = os.path.basename(ruta)
                    metas.append(meta_label)
    return Indice(textos, metas)
