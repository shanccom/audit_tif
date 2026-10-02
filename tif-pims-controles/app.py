from flask import Flask, jsonify, request

from agents.controles import AgenteControles

app = Flask(__name__, static_folder="static", static_url_path="")
controles = AgenteControles()


@app.get("/")
def inicio():
    return app.send_static_file("index.html")


@app.get("/api/controles/catalogo")
def catalogo():
    return jsonify(controles.catalogo)


@app.post("/api/controles/ejecutar")
def ejecutar():
    entrada = request.get_json(silent=True) or {}
    return jsonify(controles.ejecutar(entrada))


if __name__ == "__main__":
    app.run(debug=True)
