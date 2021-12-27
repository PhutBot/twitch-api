"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const IrcClient = require('./IrcClient');
const { Env, Millis } = require('helper-js');
class TwitchChat {
    constructor(channel, isMod = false, cmdDel = '!') {
        this._onMsg = (user, msg) => console.log(`<<< ${user}: ${msg}`);
        this._onCmd = (user, cmd, msg) => console.log(`### ${user}: ${cmd}`);
        this.isMod = isMod;
        this.cmdDel = cmdDel;
        this.channel = channel;
        TwitchChat.ircClient.on('msg', (channel, user, msg) => this._handleMsg(channel, user, msg));
        TwitchChat.ircClient.on('disconnect', this._stopMsgQueueProcessor);
        TwitchChat.ircClient.join(this.channel);
        this._startMsgQueueProcessor();
    }
    static connect(host = 'irc.chat.twitch.tv', port = 6667, timeout = 3000) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!!TwitchChat.ircClient.connected)
                return;
            yield TwitchChat.ircClient.connect(host, port, timeout);
        });
    }
    _startMsgQueueProcessor() {
        const rateLimitCount = this.isMod ? TwitchChat.rateLimitCount * 5 : TwitchChat.rateLimitCount;
        if (!TwitchChat.msgQueueProcessor) {
            TwitchChat.msgQueueProcessor = setInterval(() => {
                if (TwitchChat.msgQueue.length > 0 && TwitchChat.rateLimit.count < rateLimitCount) {
                    TwitchChat.rateLimit.count += 1;
                    const msg = TwitchChat.msgQueue.shift();
                    this._handleMsg(this.channel, TwitchChat.login, msg);
                    if (!msg.startsWith(this.cmdDel)) {
                        TwitchChat.ircClient.privmsg(this.channel, msg);
                    }
                }
                TwitchChat.rateLimit.time -= TwitchChat.msgInterval;
                if (TwitchChat.rateLimit.time <= -TwitchChat.msgInterval) {
                    TwitchChat.rateLimit.count = 0;
                    TwitchChat.rateLimit.time = TwitchChat.rateLimitTime;
                }
            }, TwitchChat.msgInterval);
        }
    }
    _stopMsgQueueProcessor() {
        if (!!TwitchChat.msgQueueProcessor) {
            clearInterval(TwitchChat.msgQueueProcessor);
        }
    }
    static disconnect() {
        TwitchChat.ircClient.disconnect();
    }
    static authenticate(tokenEnv, login) {
        if (!!TwitchChat.authenticated)
            return;
        TwitchChat.login = login;
        TwitchChat.ircClient.pass(`oauth:${Env.get(tokenEnv)}`);
        TwitchChat.ircClient.nick(login);
        TwitchChat.ircClient.cap(':twitch.tv/membership');
        TwitchChat.ircClient.cap(':twitch.tv/tags');
        TwitchChat.ircClient.cap(':twitch.tv/commands');
        TwitchChat.authenticated = true;
    }
    get connected() {
        return TwitchChat.ircClient.connected;
    }
    on(eventName, handler) {
        switch (eventName) {
            case 'msg':
                this._onMsg = handler;
                break;
            case 'cmd':
                this._onCmd = handler;
                break;
            default: throw 'TwitchCat - invalid event handler name';
        }
    }
    off(eventName) {
        switch (eventName) {
            case 'msg':
                this._onMsg = (user, msg) => { };
                break;
            case 'cmd':
                this._onCmd = (user, cmd, msg) => { };
                break;
            default: throw 'TwitchCat - invalid event handler name';
        }
    }
    chat(msg) {
        if (!msg)
            return;
        const msgQueueMaxSize = this.isMod ? TwitchChat.msgQueueMaxSize * 5 : TwitchChat.msgQueueMaxSize;
        if (TwitchChat.msgQueue.length < msgQueueMaxSize) {
            TwitchChat.msgQueue.push(msg);
        }
    }
    part() {
        TwitchChat.ircClient.part(this.channel);
    }
    _handleMsg(channel, user, msg) {
        if (channel !== this.channel)
            return;
        if (!!msg) {
            if (msg.startsWith(this.cmdDel)) {
                let end = msg.indexOf(' ');
                end = end < 0 ? undefined : end;
                let cmd = msg.slice(1, end);
                let body = msg.slice(this.cmdDel.length + cmd.length).trim();
                this._onCmd(user, cmd, body);
            }
            else {
                this._onMsg(user, msg);
            }
        }
    }
    _recvMsg(user, msg) {
        this._onMsg(user, msg);
    }
    _recvCmd(user, cmd, msg) {
        this._onCmd(user, cmd, msg);
    }
}
TwitchChat.login = null;
TwitchChat.authenticated = false;
TwitchChat.ircClient = new IrcClient(false);
TwitchChat.msgQueue = [];
TwitchChat.msgQueueProcessor = null;
TwitchChat.msgQueueMaxSize = 3; // max msg count allowed in queue before dropping msgs (will be multiplied by 5 if the bot is a mod)
TwitchChat.msgInterval = 100; // interval at which msgs are processed 
TwitchChat.rateLimitCount = 2; // twitch rate limit is 20 msgs (will be multiplied by 5 if the bot is a mod)
TwitchChat.rateLimitTime = Millis.fromSec(3); // every 30 seconds
TwitchChat.rateLimit = { count: 0, time: TwitchChat.rateLimitTime };
module.exports = TwitchChat;
