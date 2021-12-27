export = TwitchChat;
declare class TwitchChat {
    static login: null;
    static authenticated: boolean;
    static ircClient: IrcClient;
    static msgQueue: any[];
    static msgQueueProcessor: null;
    static msgQueueMaxSize: number;
    static msgInterval: number;
    static rateLimitCount: number;
    static rateLimitTime: any;
    static rateLimit: {
        count: number;
        time: any;
    };
    static connect(host?: string, port?: number, timeout?: number): Promise<void>;
    static disconnect(): void;
    static authenticate(tokenEnv: any, login: any): void;
    constructor(channel: any, isMod?: boolean, cmdDel?: string);
    _startMsgQueueProcessor(): void;
    _stopMsgQueueProcessor(): void;
    _onMsg: (user: any, msg: any) => void;
    _onCmd: (user: any, cmd: any, msg: any) => void;
    isMod: boolean;
    cmdDel: string;
    channel: any;
    get connected(): boolean;
    on(eventName: any, handler: any): void;
    off(eventName: any): void;
    chat(msg: any): void;
    part(): void;
    _handleMsg(channel: any, user: any, msg: any): void;
    _recvMsg(user: any, msg: any): void;
    _recvCmd(user: any, cmd: any, msg: any): void;
}
import IrcClient = require("./IrcClient");
//# sourceMappingURL=TwitchChat.d.ts.map