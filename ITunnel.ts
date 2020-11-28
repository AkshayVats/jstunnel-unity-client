export interface ITunnel {
    OnPacketReceived: (packet: string) => void;
    SetSendPacketDelegate: (sendPacket: (packet:string)=>void) => void;
}