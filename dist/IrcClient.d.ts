export = IrcClient;
declare class IrcClient {
    constructor(verbose?: boolean);
    _onMsg: any[];
    _onDisconnect: any[];
    verbose: boolean;
    connected: boolean;
    channels: any[];
    identity: string;
    on(eventName: any, handler: any): void;
    parse(tags: any, prefix: any, cmd: any, args: any): {
        tags: any;
        prefix: any;
        cmd: any;
        channel: any;
        user: any;
        msg: any;
        sender?: undefined;
        server?: undefined;
        args?: undefined;
    } | {
        tags: any;
        prefix: any;
        cmd: any;
        sender: any;
        user: any;
        msg: any;
        channel?: undefined;
        server?: undefined;
        args?: undefined;
    } | {
        tags: any;
        prefix: any;
        cmd: any;
        msg: any;
        channel?: undefined;
        user?: undefined;
        sender?: undefined;
        server?: undefined;
        args?: undefined;
    } | {
        tags: any;
        prefix: any;
        cmd: any;
        server: any;
        channel?: undefined;
        user?: undefined;
        msg?: undefined;
        sender?: undefined;
        args?: undefined;
    } | {
        tags: any;
        prefix: any;
        cmd: any;
        args: any;
        channel?: undefined;
        user?: undefined;
        msg?: undefined;
        sender?: undefined;
        server?: undefined;
    };
    connect(host: any, port: any, timeout?: number): Promise<any>;
    client: any;
    disconnect(): void;
    msg(command: any, parameters: any, log: any): void;
    pass(token: any): void;
    nick(identity: any): void;
    join(channel: any): void;
    part(channel: any): void;
    cap(name: any): void;
    pong(server: any): void;
    privmsg(channel: any, text: any): void;
    whisper(target: any, text: any): void;
}
//# sourceMappingURL=IrcClient.d.ts.map