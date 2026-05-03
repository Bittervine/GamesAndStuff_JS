from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        super().end_headers()


def main():
    port = int(os.environ.get("PORT", "8000"))
    here = Path(__file__).resolve().parent
    root = here.parent if here.name == "devel" else here
    os.chdir(root)
    print(f"Serving {root} on http://localhost:{port}/ThoriumGap.html")
    server = ThreadingHTTPServer(("127.0.0.1", port), NoCacheHandler)
    try:
      server.serve_forever()
    except KeyboardInterrupt:
      pass


if __name__ == "__main__":
    main()
