// const IrcClient = require('./IrcClient');
// const { Env, Millis } = require('helper-js');
import { IrcClient } from './IrcClient';
import { Env, Millis } from 'helper-js';

export class TwitchChat {
    static login:string;
    static authenticated:boolean;
    static ircClient = new IrcClient(false);

    static msgQueue:Array<string> = [];
    static msgQueueProcessor:NodeJS.Timer;
    static msgQueueMaxSize = 3;               // max msg count allowed in queue before dropping msgs (will be multiplied by 5 if the bot is a mod)
    static msgInterval = 100;                 // interval at which msgs are processed 
    static rateLimitCount = 2;                // twitch rate limit is 20 msgs (will be multiplied by 5 if the bot is a mod)
    static rateLimitTime = Millis.fromSec(3); // every 30 seconds
    static rateLimit = { count: 0, time: TwitchChat.rateLimitTime };

    private isMod:boolean;
    private channel:string;
    private cmdDel:string;
    private _onMsg:Function;
    private _onCmd:Function;

    static async connect(host='irc.chat.twitch.tv', port=6667, timeout=3000) {
        if (!!TwitchChat.ircClient.connected)
            return;
        await TwitchChat.ircClient.connect(host, port, timeout);
    }

    _startMsgQueueProcessor() {
        const rateLimitCount = this.isMod ? TwitchChat.rateLimitCount * 5 : TwitchChat.rateLimitCount;
        if (!TwitchChat.msgQueueProcessor) {
            TwitchChat.msgQueueProcessor = setInterval(() => {
                if (TwitchChat.msgQueue.length > 0 && TwitchChat.rateLimit.count < rateLimitCount) {
                    TwitchChat.rateLimit.count += 1;
                    const msg = TwitchChat.msgQueue.shift() ?? '';
                    this._handleMsg(this.channel, TwitchChat.login, msg);
                    if (!msg?.startsWith(this.cmdDel)) {
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

    static authenticate(tokenEnv:string, login:string) {
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

    constructor(channel:string, isMod=false, cmdDel='!') {
        this._onMsg = (user:string, msg:string) => console.log(`<<< ${user}: ${msg}`);
        this._onCmd = (user:string, cmd:string, msg:string) => console.log(`### ${user}: ${cmd}`);

        this.isMod = isMod;
        this.cmdDel = cmdDel;
        this.channel = channel;
        TwitchChat.ircClient.on('msg', (channel:string, user:string, msg:string) => this._handleMsg(channel, user, msg));
        TwitchChat.ircClient.on('disconnect', this._stopMsgQueueProcessor);
        TwitchChat.ircClient.join(this.channel);
        this._startMsgQueueProcessor();
    }

    get connected() {
        return TwitchChat.ircClient.connected;
    }

    on(eventName:string, handler:Function) {
        switch (eventName) {
            case 'msg': this._onMsg = handler; break;
            case 'cmd': this._onCmd = handler; break;
            default: throw 'TwitchCat - invalid event handler name';
        }
    }

    off(eventName:string) {
        switch (eventName) {
            case 'msg': this._onMsg = (user:string, msg:string) => {}; break;
            case 'cmd': this._onCmd = (user:string, cmd:string, msg:string) => {}; break;
            default: throw 'TwitchCat - invalid event handler name';
        }
    }

    chat(msg:string) {
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

    _handleMsg(channel:string, user:string, msg:string) {
        if (channel !== this.channel)
            return;

        if (!!msg) {
            if (msg.startsWith(this.cmdDel)) {
                let end:number|undefined = msg.indexOf(' ');
                end = end < 0 ? undefined : end;
                let cmd = msg.slice(1, end);
                let body = msg.slice(this.cmdDel.length + cmd.length).trim();
                this._onCmd(user, cmd, body);
            } else {
                this._onMsg(user, msg);
            }
        }
    }

    _recvMsg(user:string, msg:string) {
        this._onMsg(user, msg);
    }

    _recvCmd(user:string, cmd:string, msg:string) {
        this._onCmd(user, cmd, msg);
    }
}
