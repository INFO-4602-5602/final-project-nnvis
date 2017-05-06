"""
References
    1. https://docs.python.org/3/library/http.server.html
    2. https://daanlenaerts.com/blog/2015/06/03/create-a-simple-http-server-with-python-3/
"""


from http.server import BaseHTTPRequestHandler, HTTPServer

class testHTTPServer_RequestHandler(BaseHTTPRequestHandler):

    # GET
    def do_GET(self):
        # Send response status code
        self.send_response(200)

        # Send headers
        self.send_header("Content-type", "text/html")
        self.end_headers()

        return


def run():
    print("Starting server...")

    # Server settings
    server_address = ('127.0.0.1', 8089)
    httpd = HTTPServer(server_address, testHTTPServer_RequestHandler)
    print("Running Server on Port {}...".format(server_address))
    httpd.serve_forever()

run()
