from http.server import BaseHTTPRequestHandler, HTTPServer

host = "localhost"
port = 8000

class ServidorSimples(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)  # Código de sucesso
        self.send_header("Content-type", "text/html")
        self.end_headers()
        self.wfile.write(b"<h1>Servidor rodando!</h1>")

# Cria e inicia o servidor
servidor = HTTPServer((host, port), ServidorSimples)
print(f"Servidor rodando em http://{host}:{port} 🚀")
servidor.serve_forever()
