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
const fetch = require('node-fetch');
const https = require('https'); // Import the 'https' module

function secondsToDhms(seconds) {
    const delta = new Date(seconds * 1000); // Convert seconds to milliseconds

    const years = delta.getUTCFullYear() - 1970;
    const months = delta.getUTCMonth();
    const days = delta.getUTCDate() - 1;
    const hours = delta.getUTCHours();
    const minutes = delta.getUTCMinutes();
    const remainingSeconds = delta.getUTCSeconds();

    let formattedTime = '';

    if (years > 0) {
        formattedTime += `${years} years, `;
    }
    if (months > 0 || formattedTime !== '') {
        formattedTime += `${months} months, `;
    }
    if (days > 0 || formattedTime !== '') {
        formattedTime += `${days} days, `;
    }
    if (hours > 0 || formattedTime !== '') {
        formattedTime += `${hours} hours, `;
    }
    if (minutes > 0 || formattedTime !== '') {
        formattedTime += `${minutes} minutes, `;
    }
    formattedTime += `${remainingSeconds} seconds`;

    const uptimeMessage = "Stream is online for ";

    return uptimeMessage + formattedTime;
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

    close(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            clearInterval(this.heartbeatTimer);
            this.socket.close();
            this.socket.terminate();
        });
    }

    sendMessage(channel, message) {
        return __awaiter(this, void 0, void 0, function* () {
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

    connect(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let suffix = channel;
                let readOnly = false;
                let headers = {
                    "Content-Type": "application/json"
                };
                var that = this;

                for (let i = 0; i < suffix.length; i++) {

                    setTimeout(function () {

                        // Disable SSL verification
                        const wsOptions = {
                            agent: new https.Agent({
                                rejectUnauthorized: false // This line disables SSL verification
                            })
                        };

                        that.socket = new WebSocket(`wss://chat.vimm.tv:9001/ws/chat/${suffix[i]}/`, [], wsOptions); // Modify the WebSocket constructor to include the options

                        that.socket.on("open", () => __awaiter(that, void 0, void 0, function* () {
                            that._connected = true;
                            const packet = { 'mtype': 'signal', 'message': '', 'chatter': suffix[i], 'channel': suffix[i] };
                            yield that.send(packet) && console.log("Connected to Vimm WSS Server.");
                            that.heartbeatTimer = setInterval(() => __awaiter(that, void 0, void 0, function* () { return yield that.send({ 'mtype': 'signal', 'message': '', 'chatter': suffix[i], 'channel': suffix[i] }); }), 29 * 1000);
                            yield that.send({ 'mtype': 'signal', 'message': '', 'chatter': suffix[i], 'channel': suffix[i] })
                            console.log(`Joined: ${suffix[i]}`)

                            //this.sendMessage(suffix[i],`Hello world!`)
                            return resolve({
                                connected: true,
                                readOnly: that.readOnly
                            });
                        }));

                        that.socket.on("message", async (message) => {
                            const packet = JSON.parse(message.toString());
                            if (message == `{ 'mtype': 'signal', 'message': '', 'chatter': ${suffix[i]}, 'channel': ${suffix[i]} }`) { // Heart beat response.
                                if (that.debug == true) {
                                    // console.log("Heart beat.")
                                }
                            } else {

                                const rolesMapping = {
                                    '[dev]': 'developer',
                                    '[op]': 'admins',
                                    '[mod]': 'moderators',
                                    '[bot]': 'bot',
                                    '[sup]': 'supporter',
                                    '[prem1]': 'premiumT1',
                                    '[prem2]': 'premiumT2',
                                    '[prem3]': 'premiumT3',
                                    '[sub1]': 'subscriber',
                                };

                                function parseRoles(objdata) {
                                    const roles = {};
                                    for (const [roleKey, roleName] of Object.entries(rolesMapping)) {
                                        roles[roleName] = objdata.includes(roleKey);
                                    }
                                    return roles;
                                }

                                function isBroadcaster(packet) {
                                    return packet.chatter === packet.channel;
                                }

                                // Process role and user info
                                async function processUserInfo(packet) {
                                    const roles = parseRoles(packet.prefix);
                                    const broadcaster = isBroadcaster(packet);

                                    return {
                                        roles: [roles],
                                        mtype: packet.mtype,
                                        message: packet.message,
                                        chatter: packet.chatter,
                                        channel: packet.channel,
                                        prefix: packet.prefix,
                                        broadcaster,
                                    };
                                }

                                const chatMessage = await processUserInfo(packet);
                                if (!chatMessage.message || !chatMessage.chatter) {
                                    return;
                                }
                                that.emit("message", chatMessage);
                            }
                        });

                    }, 5000 * i);

                }

            }));
        });
    }

    setTitle(channel, message) {
        return __awaiter(this, void 0, void 0, function* () {
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
        return __awaiter(this, void 0, void 0, function* () {
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
        return __awaiter(this, void 0, void 0, function* () {
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
        return __awaiter(this, void 0, void 0, function* () {
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

    getUptime(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            yield fetch(`https://www.vimm.tv/hls/${channel}.m3u8`).then(body => body.text()).then(babble => {
                //  if (err) throw err;
                let arr = babble.split('\n');
                let link = arr[arr.length - 2];
                if (!!link) {
                    fetch(`https://www.vimm.tv/hls/${link}`).then(body => body.text()).then(babble1 => {
                        //  if (err) throw err;
                        let arr = babble1.split('\n');
                        let text = arr[arr.length - 2];
                        if (!!text) {
                            let number = Number(text.replace('.ts', ''));
                            if (isNaN(number)) return this.sendMessage(channel, "USER IS OFFLINE!");
                            let seconds = number * 2;
                            this.sendMessage(channel, secondsToDhms(seconds));
                        }

                    })
                }
            })
        });
    }


    getInfo(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            const messageQuery = `https://www.vimm.tv/status/${channel}`;
            yield fetch(messageQuery, {
                method: "GET"
            }).then(res => res.json())
                .then(data => {

                    if (data.error == 404) {
                        return this.sendMessage(channel, `ERROR: ${data.message}`);
                    } else {
                        return data;
                    }

                });
        });
    }

    getTitle(channel) {
        return __awaiter(this, void 0, void 0, function* () {
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
        return __awaiter(this, void 0, void 0, function* () {
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
