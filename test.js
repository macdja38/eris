/**
 * Created by macdja38 on 2017-05-17.
 */

let Eris = require("./index.js");
let client = new Eris("token");

let slave = false;

const WebSocket = require('ws');

let resolveReadyPromise;
let readyPromise = new Promise((resolve) => {
    resolveReadyPromise = resolve;
});

client.on("ready", () => {
    console.log("ready");
    resolveReadyPromise();
});

let identifier = "5";
let nonce = "0";
let guild_id = "97069403178278912";
let channel_id = "117454468076797959";
const wss = new WebSocket.Server({port: 80});

wss.on('connection', function connection(ws) {
    console.log("Got slave");
    slave = ws;
    let sendWS = function(json) {
        ws.send(JSON.stringify(json));
    };
    readyPromise.then(() => {
        /*Client.joinVoiceChannel("117454468076797959").then((data) => {
            console.log("Joined Voice Channel");
            if (slave) {
                console.log("Sending message", data);
                sendWS({
                    type: "join",
                    data,
                });
            }
        }).catch(console.error);*/
    });
    sendWS({
        identifier,
        nonce,
        action: "OPEN_CONNECTION",
        guild_id,
        channel_id,
    });
    client.on("VOICE_SERVER_UPDATE", (data) => {
        console.log("VOICE_SERVER_UPDATE_WITH_DATA", data);
        sendWS({
            identifier,
            nonce,
            action: "VOICE_SERVER_UPDATE",
            session_id: data.session_id,
            vsu: data,
            guild_id,
            channel_id,
        });
    });
    ws.on('message', function incoming(data) {
        data = JSON.parse(data);
        console.log("incommingData", data);

        // Broadcast to everyone else.
        switch (data.action) {
            case "SEND_WS": {
                let message = JSON.parse(data.message);
                console.log(message);
                client.shards.get(client.guildShardMap["97069403178278912"] || 0).sendWS(message.op, message.d);
            }
        }
    });
    setTimeout(() => {
        sendWS({
            identifier,
            nonce,
            action: "PLAY_SONG",
            guild_id,
            channel_id,
        });
    }, 3000);
});

client.connect();