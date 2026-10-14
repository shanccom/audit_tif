import os
from flask import Flask, jsonify, request, send_from_directory
from agents.controles import AgenteControles

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
static_dir = os.path.join(BASE_DIR, "static")
knowledge_dir = os.path.join(BASE_DIR, "knowledge")

app = Flask(__name__, static_folder=static_dir, static_url_path="")
controles = AgenteControles(carpeta=knowledge_dir)

# Soporte CORS sin dependencias externas
@app.after_request
def habilitar_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response

@app.get("/")
def inicio():
    return app.send_static_file("index.html")

@app.route("/api/controles/catalogo", methods=["GET", "OPTIONS"])
def catalogo():
    if request.method == "OPTIONS":
        return "", 204
    return jsonify(controles.catalogo)

@app.route("/api/controles/ejecutar", methods=["POST", "OPTIONS"])
def ejecutar():
    if request.method == "OPTIONS":
        return "", 204
    entrada = request.get_json(silent=True) or {}
    return jsonify(controles.ejecutar(entrada))

@app.route("/api/evidencias", methods=["GET"])
def listar_evidencias():
    evidencias_dir = os.path.join(knowledge_dir, "evidencias")
    if not os.path.exists(evidencias_dir):
        return jsonify([])
    archivos = []
    for f in os.listdir(evidencias_dir):
        ruta = os.path.join(evidencias_dir, f)
        if os.path.isfile(ruta):
            archivos.append({
                "archivo": f,
                "es_pdf": f.lower().endswith(".pdf"),
                "tamano": os.path.getsize(ruta)
            })
    return jsonify(archivos)

@app.route("/api/evidencias/subir", methods=["POST"])
def subir_evidencia():
    if "archivo" not in request.files:
        return jsonify({"error": "No se envió ningún archivo"}), 400
    archivo = request.files["archivo"]
    if archivo.filename == "":
        return jsonify({"error": "Nombre de archivo vacío"}), 400
    
    # Sanitizar nombre simple manteniendo extension
    nombre_seguro = os.path.basename(archivo.filename).replace(" ", "_")
    evidencias_dir = os.path.join(knowledge_dir, "evidencias")
    os.makedirs(evidencias_dir, exist_ok=True)
    destino = os.path.join(evidencias_dir, nombre_seguro)
    archivo.save(destino)
    return jsonify({
        "mensaje": "Archivo guardado correctamente",
        "archivo": nombre_seguro,
        "url": f"/api/evidencias/{nombre_seguro}"
    })

@app.route("/api/evidencias/<path:filename>", methods=["GET"])
def ver_evidencia(filename):
    evidencias_dir = os.path.join(knowledge_dir, "evidencias")
    return send_from_directory(evidencias_dir, filename)

if __name__ == "__main__":
    import os
    puerto = int(os.environ.get("PORT", 5000))
    print(f"Servidor Agente de Controles iniciado en http://127.0.0.1:{puerto}")
    app.run(host="0.0.0.0", port=puerto, debug=True)
