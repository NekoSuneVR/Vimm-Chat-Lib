"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require('ws')
const events_1 = require("events");
class VimmChat extends events_1.EventEmitter {
    constructor(auth) {
        super();
        this.auth = auth;
        this._connected = false;
        this.readOnly = false;
		this.debug = auth.debug;
    }
    
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            clearInterval(this.heartbeatTimer);
            this.socket.close();
        });
    }
    connect(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let suffix = channel;
                let readOnly = false;
                let headers = {
                    "Content-Type": "application/json"
                };
				
                this.socket = new WebSocket(`wss://www.vimm.tv:9001/ws/chat/${suffix}/`);
                this.socket.on("open", () => __awaiter(this, void 0, void 0, function* () {
                    this._connected = true;
                    const packet = { 'mtype': 'signal', 'message': '', 'chatter': suffix, 'channel': suffix };
                    yield this.send(packet) && console.log("Connected to Vimm WSS Server.");
                    this.heartbeatTimer = setInterval(() => __awaiter(this, void 0, void 0, function* () { return yield this.send({ 'mtype': 'signal', 'message': '', 'chatter': suffix, 'channel': suffix }); }), 29 * 1000);
                    yield this.send(
						{ 'mtype': 'signal', 'message': '', 'chatter': suffix, 'channel': suffix })
						console.log(`Joined: ${channel}`)
                    return resolve({
                        connected: true,
                        readOnly: this.readOnly
                    });
                }));
                this.socket.on("message", (message) => {
					const packet = JSON.parse(message.toString());
                    if(message == `{ 'mtype': 'signal', 'message': '', 'chatter': suffix, 'channel': suffix }`){ // Heart beat response.
                        if(this.debug == true){
							console.log("Heart beat.")
						}
                    }
                    else{
                        const chatMessage = packet;
                        if (!chatMessage.message || !chatMessage.chatter) {
                            return;
                        }
                        this.emit("message", chatMessage);
                    }
                });
                this.socket.on("close", (event) => {
					this._connected = false;
					console.log("Disconnected from Vimm server.")
					try{
						this.emit("close", event) && console.log("Attempting to reconnect.");
					}
					catch(error){
						console.error("Failed to reconnect.\n" + error)
					}
                })
            }));
        });
    }
    /*sendMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const messageQuery = { prefix: '[prem1]', message: `${message}`, chatter: 'chisdealhd', mtype: 'message', channel: 'chisdealhd' };
            yield this.send(messageQuery);
        });
    }*/
    send(packet) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.socket.send(JSON.stringify(packet), err => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve();
                });
            });
        });
    }
    get connected() {
        return this._connected;
    }
}
exports.VimmChat = VimmChat;
//# sourceMappingURL=chat.js.map
