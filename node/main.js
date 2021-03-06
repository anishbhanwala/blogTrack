var requestHandlers = require("./requestHandlers");
var http = require("http");
var url = require("url");
var logger = require("./logger").logger;

function route(handlers, pathname, request, response, postData) {
    logger.log("info", "About to route a request for " + pathname);
    if (typeof handlers[pathname] === 'function') {
        logger.log("info", "function found" + pathname);
        handlers[pathname](request, response, postData);
    } else {
        logger.log("No request handler found for " + pathname);
        response.writeHead(404, {"Content-Type": "text/plain"});
        response.write("404 Not found");
        response.end();
    }
}

function start(handlers) {
    function onRequest(request, response) {
        var postData = "";
        var pathname = url.parse(request.url).pathname;
        logger.log("Request for " + pathname + " received.");
        request.setEncoding("utf8");

        request.on("data", function(postDataChunk) {
                postData += postDataChunk;
                logger.log("Received POST data chunk.");
            });
        request.on("end", function() {
                route(handlers, pathname, request, response, postData);
            });
    }
    var server = http.createServer(onRequest);
    server.listen(8888);
    require('./socketHandlers').listen(server);
    logger.log("info", "Server has started.");
}

var handlers = {};
handlers["/"] = requestHandlers.staticContent;
handlers["/socket.io.min.js"] = requestHandlers.staticContent;
handlers["/start"] = requestHandlers.start;
handlers["/upload"] = requestHandlers.upload;
handlers["/broadcastMessage"] = requestHandlers.broadcastMessage;

start(handlers);
