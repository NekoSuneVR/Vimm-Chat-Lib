"use strict";
var __awaiter = (this && this.__awaiter) || function(thisArg, _arguments, P, generator) {
    return new(P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }

        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }

        function step(result) {
            result.done ? resolve(result.value) : new P(function(resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
const WebSocket = require('ws')
const events_1 = require("events");
const fetch = require('node-fetch');

async function livechecksvimm(channel, servers) {
    let data;

    if (servers == "usa") {
        const urlcheck = "https://www.vimm.tv/hls/" + channel + ".m3u8";

        // Note the await keyword
        await fetch(urlcheck)
            .then((response) => {

                if (response.status == 200) {

                    data = "https://www.vimm.tv/hls/" + channel + ".m3u8";

                } else {

                    data = "OFFLINE";

                }

            })
            .catch((error) => console.log("error", error));

        return data;
    } else if (servers == "fl") {

        const url1check = "https://fl.vimm.tv/hls/" + channel + ".m3u8";

        await fetch(url1check).then((response) => {
                if (response.status == 200) {
                    data = "https://fl.vimm.tv/hls/" + channel + ".m3u8";
                } else {
                    data = "OFFLINE";
                }
            })
            .catch((error) => console.log("error", error));

        return data;

    }
}

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
                var that = this;

                for (let i = 0; i < suffix.length; i++) {

                    setTimeout(function() {

                        that.socket = new WebSocket(`wss://www.vimm.tv:9001/ws/chat/${suffix[i]}/`);
                        that.socket.on("open", () => __awaiter(that, void 0, void 0, function*() {
                            that._connected = true;
                            const packet = {
                                'mtype': 'signal',
                                'message': '',
                                'chatter': suffix[i],
                                'channel': suffix[i]
                            };
                            yield that.send(packet) && console.log("Connected to Vimm WSS Server.");
                            that.heartbeatTimer = setInterval(() => __awaiter(that, void 0, void 0, function*() {
                                return yield that.send({
                                    'mtype': 'signal',
                                    'message': '',
                                    'chatter': suffix[i],
                                    'channel': suffix[i]
                                });
                            }), 29 * 1000);
                            yield that.send({
                                'mtype': 'signal',
                                'message': '',
                                'chatter': suffix[i],
                                'channel': suffix[i]
                            })
                            console.log(`Joined: ${suffix[i]}`)
                            return resolve({
                                connected: true,
                                readOnly: that.readOnly
                            });
                        }));

                        that.socket.on("message", (message) => {
                            const packet = JSON.parse(message.toString());
                            if (message == `{ 'mtype': 'signal', 'message': '', 'chatter': ${suffix[i]}, 'channel': ${suffix[i]} }`) { // Heart beat response.
                                if (that.debug == true) {
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
                                that.emit("message", chatMessage);
                            }
                        });
                        that.socket.on("close", (event) => {
                            that._connected = false;
                            console.log("Disconnected from Vimm server.")
                            try {
                                that.emit("close", event) && console.log("Attempting to reconnect.");
                            } catch (error) {
                                console.error("Failed to reconnect.\n" + error)
                            }
                        })

                    }, 5000 * i);

                }

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


    getUptime(channel) {
        return __awaiter(this, void 0, void 0, function*() {
            yield livechecksvimm(channel, "usa").then((data) => {
                if (data == "https://www.vimm.tv/hls/" + channel + ".m3u8") {
                    fetch(data).then(res => res.text()).then(data20 => {
                        let arr = data20.split('\n');
                        let link = arr[arr.length - 2];
                        if (!!link) {
                            fetch(`https://www.vimm.tv/hls/${link}`).then(res1 => res1.text()).then(data => {
                                let arr1 = data.split('\n');
                                let text = arr1[arr1.length - 2];
                                if (!!text) {
                                    let number = Number(text.replace('.ts', ''));
                                    if (isNaN(number)) {
                                        return this.sendMessage(channel, "USER IS OFFLINE!");
                                    } else {
                                        let seconds = number * 2;
                                        return this.sendMessage(channel, `Uptime: ${this.secondsToDhms(seconds)}`);
                                    }
                                }
                            });
                        }

                    });
                } else {
                    livechecksvimm(channel, "fl").then((data1) => {
                        if (data1 == "https://fl.vimm.tv/hls/" + channel + ".m3u8") {
                            fetch(data1).then(res => res.text()).then(data21 => {
                                let arr = data21.split('\n');
                                let link = arr[arr.length - 2];
                                if (!!link) {
                                    fetch(`https://fl.vimm.tv/hls/${link}`).then(res1 => res1.text()).then(data => {
                                        let arr1 = data.split('\n');
                                        let text = arr1[arr1.length - 2];
                                        if (!!text) {
                                            let number = Number(text.replace('.ts', ''));
                                            if (isNaN(number)) {
                                                return this.sendMessage(channel, "USER IS OFFLINE!");
                                            } else {
                                                let seconds = number * 2;
                                                return this.sendMessage(channel, `Uptime: ${this.secondsToDhms(seconds)}`);
                                            }
                                        }
                                    });
                                }
                            });
                        } else {
                            return this.sendMessage(channel, "USER IS OFFLINE!");
                        }
                    })
                }
            })
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

    getTitle(channel) {
        return __awaiter(this, void 0, void 0, function*() {
            const messageQuery = `https://www.vimm.tv/status/${channel}`;
            yield fetch(messageQuery, {
                    method: "GET"
                }).then(res => res.json())
                .then(data => {

                    if (data.error == 404) {
                        return this.sendMessage(channel, `ERROR: ${data.message}`);
                    } else {
                        return this.sendMessage(channel, `TITLE: ${data[0].fields.stream_title}`);
                    }

                });
        });
    }

    getGame(channel) {
        return __awaiter(this, void 0, void 0, function*() {
            const messageQuery = `https://www.vimm.tv/status/${channel}`;
            yield fetch(messageQuery, {
                    method: "GET"
                }).then(res => res.json())
                .then(data => {

                    if (data.error == 404) {
                        return this.sendMessage(channel, `ERROR: ${data.message}`);
                    } else {
                        return this.sendMessage(channel, `GAME: ${data[0].fields.stream_game}`);
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
