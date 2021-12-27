export = TwitchOAuth2;
declare class TwitchOAuth2 {
    static defaultScopes: string[];
    static defaultVars: {
        ID: string;
        SECRET: string;
        TOKEN: string;
        REFRESH: string;
        CODE: string;
        EXPIRES: string;
    };
    static _storeToken(vars: any, { body }: {
        body: any;
    }): void;
    static _scopeVars(name: any, members: any): {};
    constructor(server?: null, stateToken?: null, vars?: {});
    _varNames: {
        ID: string;
        SECRET: string;
        TOKEN: string;
        REFRESH: string;
        CODE: string;
        EXPIRES: string;
    };
    _stateToken: any;
    _authCodeUrl: string | null;
    _serverRunning: boolean | undefined;
    _server: any;
    get serverAddress(): any;
    get stateToken(): any;
    get authCodeUrl(): string | null;
    generateAppToken(name: any, scopes?: string[]): Promise<TwitchAppTokenWrapper>;
    generateUserAccessToken(name: any, redirectUri: any, scopes?: string[]): Promise<TwitchUserAccessTokenWrapper>;
    generateAuthCodeUrl(vars: any, redirectUri: any, scopes?: string[]): string;
    startAuthServer(): void;
    stopAuthServer(): void;
}
declare class TwitchAppTokenWrapper extends TwitchTokenWrapper {
    constructor(name: any, auth: any, vars: any, scopes: any);
    _auth: any;
}
declare class TwitchUserAccessTokenWrapper extends TwitchTokenWrapper {
}
declare class TwitchTokenWrapper {
    constructor(name: any, vars: any, scopes: any);
    _name: any;
    _vars: any;
    _scopes: any;
    _refreshTimeout: number | null;
    _validationInterval: number;
    _init(): Promise<TwitchTokenWrapper>;
    get name(): any;
    get scopes(): any;
    hasScope(scope: any): any;
    release(revoke?: boolean): Promise<void>;
    _validate(): Promise<boolean>;
    _login: any;
    _valid: boolean | undefined;
    _refresh(): Promise<void>;
}
//# sourceMappingURL=TwitchOAuth2.d.ts.map