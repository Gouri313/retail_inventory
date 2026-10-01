"""Retail Inventory Management - Flask server.

Serves index.html, style.css and script.js from this folder.
Run locally:   python app.py        -> http://127.0.0.1:5000
Run in prod:   gunicorn app:app
"""
import os
from flask import Flask, send_from_directory

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, static_folder=None)

ALLOWED = {"style.css", "script.js"}


@app.route("/")
def home():
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/<path:filename>")
def assets(filename):
    if filename not in ALLOWED:
        return "Not found", 404
    return send_from_directory(BASE_DIR, filename)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
