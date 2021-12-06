"use strict";
var __awaiter = (this && this.__awaiter) || function(thisArg, _arguments, P, generator) {
    return new(P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }

        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }

        function step(result) { result.done ? resolve(result.value) : new P(function(resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require('ws')
const events_1 = require("events");
const fetch = require('node-fetch');
class VimmChat extends events_1.EventEmitter {
    constructor(auth) {
        super();
        this.auth = auth;
        this._connected = false;
        this.readOnly = false;
        this.debug = auth.debug;
        this.token = auth.token;
    }

    close() {
        return __awaiter(this, void 0, void 0, function*() {
            clearInterval(this.heartbeatTimer);
            this.socket.close();
        });
    }
    connect(channel) {
        return __awaiter(this, void 0, void 0, function*() {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function*() {
                let suffix = channel;
                let readOnly = false;
                let headers = {
                    "Content-Type": "application/json"
                };
                
                this.socket = new WebSocket(`wss://www.vimm.tv:9001/ws/chat/${suffix}/`);
                this.socket.on("open", () => __awaiter(this, void 0, void 0, function*() {
                    this._connected = true;
                    const packet = { 'mtype': 'signal', 'message': '', 'chatter': suffix, 'channel': suffix };
                    yield this.send(packet) && console.log("Connected to Vimm WSS Server.");
                    this.heartbeatTimer = setInterval(() => __awaiter(this, void 0, void 0, function*() { return yield this.send({ 'mtype': 'signal', 'message': '', 'chatter': suffix, 'channel': suffix }); }), 29 * 1000);
                    yield this.send({ 'mtype': 'signal', 'message': '', 'chatter': suffix, 'channel': suffix })
                    console.log(`Joined: ${suffix}`)
                    return resolve({
                        connected: true,
                        readOnly: this.readOnly
                    });
                }));

                this.socket.on("message", (message) => {
                    const packet = JSON.parse(message.toString());
                    if (message == `{ 'mtype': 'signal', 'message': '', 'chatter': suffix, 'channel': suffix }`) { // Heart beat response.
                        if (this.debug == true) {
                            console.log("Heart beat.")
                        }
                    } else {
                        
			var objdata = packet.prefix;

			if (objdata.indexOf("[dev]") !== -1) {
   				var dev = true;
			} else {
   				var dev = false;
			}

			if (objdata.indexOf("[op]") !== -1) {
   				var admin = true;
			} else {
   				var admin = false;
			}
                        
            if (objdata.indexOf("[mod]") !== -1) {
   				var mod = true;
			} else {
   				var mod = false;
			}
			
			if (objdata.indexOf("[bot]") !== -1) {
   				var bot = true;
			} else {
   				var bot = false;
			}

			if (objdata.indexOf("[sup]") !== -1) {
   				var supporters = true;
			} else {
   				var supporters = false;
			}

			if (objdata.indexOf("[prem1]") !== -1) {
   				var prem1 = true;
			} else {
  				var prem1 = false;
			}

			if (objdata.indexOf("[prem2]") !== -1) {
   				var prem2 = true;
			} else {
   				var prem2 = false;
			}

			if (objdata.indexOf("[prem3]") !== -1) {
   				var prem3 = true;
			} else {
   				var prem3 = false;
			}

			if (objdata.indexOf("[sub1]") !== -1) {
   				var sub = true;
			} else {
   				var sub = false;
			}

            if (packet.chatter == packet.channel) {
   				var broadcaster = true;
			} else {
   				var broadcaster = false;
			}

			
            const chatformatter = {
				roles: [{
					admins: admin,
					developer: dev,
					broadcaster: broadcaster,
                    moderators: mod,
					bot: bot,
					subscriber: sub,
					premiumT1: prem1,
					premiumT2: prem2,
					premiumT3: prem3,
					supporter: supporters
				}],
  				mtype: packet.mtype,
  				message: packet.message,
  				chatter: packet.chatter,
  				channel: packet.channel,
				prefix: packet.prefix
			};
                       
                        const chatMessage = chatformatter;
                        if (!chatMessage.message || !chatMessage.chatter) {
                            return;
                        }
                        this.emit("message", chatMessage);
                    }
                });
                this.socket.on("close", (event) => {
                    this._connected = false;
                    console.log("Disconnected from Vimm server.")
                    try {
                        this.emit("close", event) && console.log("Attempting to reconnect.");
                    } catch (error) {
                        console.error("Failed to reconnect.\n" + error)
                    }
                })

            }));
        });
    }
    sendMessage(channel, message) {
        return __awaiter(this, void 0, void 0, function*() {
            const messageQuery = `message=${message}&channel=${channel}`;
            yield fetch("https://www.vimm.tv/api/v0/chatpost", {
                body: messageQuery,
                headers: {
                    Authorization: `Api-Key ${this.token}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                method: "POST"
            }).then(res => res.json())
    		.then(data => {
                
                if (data.success == 1) {
                    return; 
                } else {
                   return console.log("Error: " + data.error); 
                }
                
            });
        });
    }
    
    setTitle(channel, message) {
        return __awaiter(this, void 0, void 0, function*() {
            const messageQuery = `title=${message}&channel=${channel}`;
            yield fetch("https://www.vimm.tv/api/v0/channelstatus", {
                body: messageQuery,
                headers: {
                    Authorization: `Api-Key ${this.token}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                method: "POST"
            }).then(res => res.json())
    		.then(data => {
                
                if (data.success == 1) {
                    return this.sendMessage(channel, `Title has been Set To: ${message}`); 
                } else {
                   return this.sendMessage(channel, data.error); 
                }
                
            });
        });
    }
    
    ban(channel, message) {
        return __awaiter(this, void 0, void 0, function*() {
            const messageQuery = `user=${message}&action=ban&channel=${channel}`;
            yield fetch("https://www.vimm.tv/api/v0/chatmod", {
                body: messageQuery,
                headers: {
                    Authorization: `Api-Key ${this.token}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                method: "POST"
            }).then(res => res.json())
    		.then(data => {
                
                if (data.success == 1) {
                    return this.sendMessage(channel, `${message} has now been Banned from Channel`); 
                } else {
                   return this.sendMessage(channel, data.error); 
                }
                
            });
        });
    }
    
    unban(channel, message) {
        return __awaiter(this, void 0, void 0, function*() {
            const messageQuery = `user=${message}&action=unban&channel=${channel}`;
            yield fetch("https://www.vimm.tv/api/v0/chatmod", {
                body: messageQuery,
                headers: {
                    Authorization: `Api-Key ${this.token}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                method: "POST"
            }).then(res => res.json())
    		.then(data => {
                
                if (data.success == 1) {
                    return this.sendMessage(channel, `${message} has been Unbanned!`); 
                } else {
                   return this.sendMessage(channel, data.error); 
                }
                
            });
        });
    }
    
    setGame(channel, message) {
        return __awaiter(this, void 0, void 0, function*() {
            const messageQuery = `game=${message}&channel=${channel}`;
            yield fetch("https://www.vimm.tv/api/v0/channelstatus", {
                body: messageQuery,
                headers: {
                    Authorization: `Api-Key ${this.token}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                method: "POST"
            }).then(res => res.json())
    		.then(data => {
                
                if (data.success == 1) {
                    return this.sendMessage(channel, `Game has been Set To: ${message}`); 
                } else {
                   return this.sendMessage(channel, data.error); 
                }
                
            });
        });
    }
    
    send(packet) {
        return __awaiter(this, void 0, void 0, function*() {
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
