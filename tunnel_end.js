"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TunnelEnd = void 0;
var net_1 = require("net");
var TunnelEnd = /** @class */ (function () {
    function TunnelEnd(plugin) {
        var _this = this;
        this.host = '127.0.0.1';
        this.server = net_1.createServer();
        var port = +process.argv[2];
        this.plugin = plugin;
        this.plugin.SetSendPacketDelegate(function (packet) { _this.SendPacket(packet); });
        this.server.listen(port, this.host);
        this.server.on('connection', function (sock) {
            _this.socket = sock;
            sock.on('data', function (buffer) {
                var currentPos = 0;
                while (currentPos < buffer.length) {
                    var packetSize = buffer.readInt32LE(currentPos);
                    currentPos += 4;
                    var packet = buffer.toString("utf8", currentPos, currentPos + packetSize);
                    currentPos += packetSize;
                    _this.plugin.OnPacketReceived(packet);
                }
            });
        });
    }
    TunnelEnd.prototype.SendPacket = function (packet) {
        var buffer = new Buffer(packet, "binary");
        //create a buffer with +4 bytes
        var consolidatedBuffer = new Buffer(4 + buffer.length);
        //write at the beginning of the buffer, the total size
        consolidatedBuffer.writeInt32LE(buffer.length, 0);
        //Copy the message buffer to the consolidated buffer at position 4     (after the 4 bytes about the size)
        buffer.copy(consolidatedBuffer, 4);
        if (this.socket != null)
            this.socket.write(consolidatedBuffer);
        else
            console.log("Fatal: socket is null");
    };
    return TunnelEnd;
}());
exports.TunnelEnd = TunnelEnd;
