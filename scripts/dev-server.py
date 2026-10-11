#!/usr/bin/env python3
import http.server, socketserver, os, sys
ROOT = sys.argv[1] if len(sys.argv) > 1 else os.getcwd()
os.chdir(ROOT)
class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()
with socketserver.TCPServer(("127.0.0.1", 8000), NoCacheHandler) as httpd:
    httpd.serve_forever()
