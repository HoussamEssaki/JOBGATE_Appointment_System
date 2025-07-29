import http.server
import socketserver
import threading

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

def run_server():
    with socketserver.TCPServer(("", 80), QuietHandler) as httpd:
        httpd.serve_forever()

if __name__ == '__main__':
    run_server()