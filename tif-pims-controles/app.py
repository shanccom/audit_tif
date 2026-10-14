import os
from flask import Flask, jsonify, request
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

@app.get("/panel")
def panel():
    return app.send_static_file("panel.html")

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

if __name__ == "__main__":
    import os
    puerto = int(os.environ.get("PORT", 5000))
    print(f"Servidor Agente de Controles iniciado en http://127.0.0.1:{puerto}")
    app.run(host="0.0.0.0", port=puerto, debug=True)
