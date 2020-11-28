import {Socket, createServer} from 'net';
import {ITunnel} from './ITunnel';

export class TunnelEnd {
    host = '127.0.0.1';
    socket?: Socket;
    server = createServer();
    plugin: ITunnel;

    constructor(plugin: ITunnel) {
        var port:number = +process.argv[2];
        this.plugin = plugin;
        this.plugin.SetSendPacketDelegate((packet: string)=>{this.SendPacket(packet);});
        this.server.listen(port, this.host);
        this.server.on('connection', (sock) => {
            this.socket = sock;
        
            sock.on('data', (buffer: Buffer) => {
                var currentPos = 0;
                while(currentPos < buffer.length) {
                    var packetSize = buffer.readInt32LE(currentPos);
                    currentPos += 4;
                    var packet = buffer.toString("utf8", currentPos, currentPos+packetSize);
                    currentPos += packetSize;
                    this.plugin.OnPacketReceived(packet);
                }
            });
        });
    }
    SendPacket(packet: string) {
        var buffer = new Buffer(packet, "binary");
        //create a buffer with +4 bytes
        var consolidatedBuffer = new Buffer(4 + buffer.length);

        //write at the beginning of the buffer, the total size
        consolidatedBuffer.writeInt32LE(buffer.length, 0);

        //Copy the message buffer to the consolidated buffer at position 4     (after the 4 bytes about the size)
        buffer.copy(consolidatedBuffer, 4);
        if (this.socket != null)
            this.socket.write(consolidatedBuffer);
        else console.log("Fatal: socket is null");
    }
}