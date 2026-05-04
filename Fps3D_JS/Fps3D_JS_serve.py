#!/usr/bin/env python3
"""Tiny local server for the hidden Fps3D_JS playtest."""

from __future__ import annotations

import argparse
import mimetypes
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
DEFAULT_PORT = 4173
DEFAULT_INDEX = "Fps3D_JS.html"

mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("application/javascript", ".mjs")
mimetypes.add_type("application/manifest+json", ".webmanifest")


class PlaytestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT_DIR), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def translate_path(self, path):
        if path in ("", "/"):
            path = f"/{DEFAULT_INDEX}"
        return super().translate_path(path)

    def log_message(self, format, *args):
        print(f"[fps3d] {self.address_string()} - {format % args}")


def parse_args():
    parser = argparse.ArgumentParser(description="Serve Fps3D_JS for local playtesting.")
    parser.add_argument("--host", default="127.0.0.1", help="Bind host (default: 127.0.0.1)")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help=f"Bind port (default: {DEFAULT_PORT})")
    return parser.parse_args()


def main():
    args = parse_args()
    server = ThreadingHTTPServer((args.host, args.port), PlaytestHandler)
    url = f"http://{args.host}:{args.port}/{DEFAULT_INDEX}"
    print(f"Fps3D_JS server running at {url}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
