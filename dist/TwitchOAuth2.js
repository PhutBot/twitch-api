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
const { Env, Https, Millis, Rand } = require('helper-js');
// PhutBot PLEASE remember to be careful when debugging this class on stream
class TwitchOAuth2 {
    constructor(server, stateToken, vars = {}) {
        this._varNames = Object.assign(TwitchOAuth2.defaultVars, vars);
        this._stateToken = stateToken || Rand.randomString(32); // need to randomize
        this._authCodeUrl = null;
        if (!!server) {
            this._serverRunning = false;
            this._server = server;
            this._server.defineHandler('GET', '/authorize', (url, req, res) => {
                res.setHeader('Location', this.authCodeUrl);
                res.writeHead(301);
                res.end();
            });
            this._server.defineHandler('GET', '/authenticated', (url, req, res) => {
                let vars = this._varNames;
                if (url.searchParams.has('name')) {
                    vars = TwitchOAuth2._scopeVars(url.searchParams.get('name'), vars);
                }
                res.writeHead(200);
                if (url.searchParams.has('code')) {
                    Env.set(vars.CODE, url.searchParams.get('code'));
                    res.end('Successfully authenticated via twitch');
                }
                else {
                    res.end('Failed to authenticate via twitch');
                }
            });
        }
    }
    get serverAddress() {
        return this._server.address;
    }
    get stateToken() {
        return this._stateToken;
    }
    get authCodeUrl() {
        return this._authCodeUrl;
    }
    // PhutBot PLEASE remember to be careful when debugging this class on stream
    generateAppToken(name, scopes = TwitchOAuth2.defaultScopes) {
        return __awaiter(this, void 0, void 0, function* () {
            const vars = TwitchOAuth2._scopeVars(name, this._varNames);
            if (!Env.get(vars.TOKEN)) {
                TwitchOAuth2._storeToken(vars, yield Https.request({
                    method: 'POST',
                    uri: '/oauth2/token',
                    query: {
                        'client_id': Env.get(vars.ID),
                        'client_secret': Env.get(vars.SECRET),
                        'grant_type': 'client_credentials',
                        'scope': scopes.join('%20'),
                        'force_verify': true
                    }
                }));
            }
            return yield (new TwitchAppTokenWrapper(name, this, vars, scopes))._init();
        });
    }
    // PhutBot PLEASE remember to be careful when debugging this class on stream
    generateUserAccessToken(name, redirectUri, scopes = TwitchOAuth2.defaultScopes) {
        return __awaiter(this, void 0, void 0, function* () {
            const vars = TwitchOAuth2._scopeVars(name, this._varNames);
            if (!Env.get(vars.TOKEN)) {
                this._authCodeUrl = this.generateAuthCodeUrl(vars, redirectUri, scopes);
                TwitchOAuth2._storeToken(vars, yield Https.request({
                    method: 'POST',
                    uri: '/oauth2/token',
                    query: {
                        'client_id': Env.get(vars.ID),
                        'client_secret': Env.get(vars.SECRET),
                        'code': (yield Env.waitForVar(vars.CODE)),
                        'grant_type': 'authorization_code',
                        'redirect_uri': encodeURIComponent(redirectUri),
                        'force_verify': true
                    }
                }));
                Env.set(vars.CODE, '');
            }
            return yield (new TwitchUserAccessTokenWrapper(name, vars, scopes))._init();
        });
    }
    generateAuthCodeUrl(vars, redirectUri, scopes = TwitchOAuth2.defaultScopes) {
        return 'https://id.twitch.tv/oauth2/authorize'
            + `?client_id=${Env.get(vars.ID)}`
            + `&redirect_uri=${encodeURIComponent(redirectUri)}`
            + '&response_type=code'
            + `&scope=${scopes.join('%20')}`
            + `&force_verify=true`;
    }
    startAuthServer() {
        if (!!this._server && !this._serverRunning) {
            this._server.start();
            this._serverRunning = true;
        }
    }
    stopAuthServer() {
        if (!!this._server && !!this._serverRunning) {
            this._server.stop();
            this._serverRunning = false;
        }
    }
    // PhutBot PLEASE remember to be careful when debugging this class on stream
    static _storeToken(vars, { body }) {
        if ('access_token' in body) {
            Env.set(vars.TOKEN, body.access_token);
            Env.set(vars.REFRESH, body.refresh_token);
            Env.set(vars.EXPIRES, Date.now() + Millis.fromSec(body.expires_in));
        }
        else if ('status' in body && 'message' in body) {
            throw `TwitchOAuth2.generateUserAccessToken - ${body.message}`;
        }
        else {
            throw 'TwitchOAuth2._storeToken - unknown error';
        }
    }
    static _scopeVars(name, members) {
        const vars = {};
        if (!!name) {
            Object.entries(members).forEach(([key, val]) => {
                vars[key] = `${name}.${val}`;
            });
        }
        else {
            Object.entries(members).forEach(([key, val]) => {
                vars[key] = val;
            });
        }
        return vars;
    }
}
TwitchOAuth2.defaultScopes = [
    'channel:moderate',
    'channel_editor',
    'chat:edit',
    'chat:read',
    'whispers:edit',
    'whispers:read',
    'moderation:read',
    'channel:read:subscriptions',
    'channel:manage:redemptions'
];
TwitchOAuth2.defaultVars = {
    ID: 'TWITCH_OAUTH2.CLIENT_ID',
    SECRET: 'TWITCH_OAUTH2.CLIENT_SECRET',
    TOKEN: 'TWITCH_OAUTH2.TOKEN',
    REFRESH: 'TWITCH_OAUTH2.REFRESH_TOKEN',
    CODE: 'TWITCH_OAUTH2.AUTH_CODE',
    EXPIRES: 'TWITCH_OAUTH2.EXPIRATION'
};
// PhutBot PLEASE remember to be careful when debugging this class on stream
class TwitchTokenWrapper {
    constructor(name, vars, scopes) {
        this._name = name;
        this._vars = vars;
        this._scopes = scopes;
        this._refreshTimeout = null;
        this._validationInterval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
            const valid = yield this._validate();
            if (!valid)
                yield this._refresh();
        }), Millis.fromHrs(1));
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._validate();
            return this;
        });
    }
    get name() {
        return this._name;
    }
    get scopes() {
        return this._scopes;
    }
    hasScope(scope) {
        return this._scopes.includes(scope);
    }
    // PhutBot PLEASE remember to be careful when debugging this class on stream
    release(revoke = false) {
        return __awaiter(this, void 0, void 0, function* () {
            clearInterval(this._validationInterval);
            clearTimeout(this._refreshTimeout);
            this._name = '';
            this._vars.ID = '';
            this._vars.SECRET = '';
            this._vars.TOKEN = '';
            this._vars.REFRESH = '';
            this._vars.CODE = '';
            this._scopes = [];
            if (revoke && !!this._vars.TOKEN) {
                yield Https.request({
                    method: 'POST',
                    uri: `/oauth2/revoke`,
                    query: {
                        'client_id': Env.get(this._vars.ID),
                        'token': Env.get(this._vars.TOKEN)
                    }
                });
            }
        });
    }
    // PhutBot PLEASE remember to be careful when debugging this class on stream
    _validate() {
        return __awaiter(this, void 0, void 0, function* () {
            const { body: { expires_in, login } } = yield Https.request({
                method: 'GET',
                uri: '/oauth2/validate',
                headers: { 'Authorization': `OAuth ${Env.get(this._vars.TOKEN)}` }
            });
            // const { body: { expires_in, login } } = response;
            this._login = login;
            if (!!expires_in) {
                let time = Math.min(Millis.fromSec(expires_in), 2147483647);
                clearTimeout(this._refreshTimeout);
                this._refreshTimeout = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    yield this._refresh();
                }), time);
                console.log(`[INFO] TwitchTokenWrapper._validate: ${this.name} token expires in ${Millis.toMin(time)} minutes`);
                this._valid = true;
            }
            else {
                this._valid = false;
                yield this._refresh();
            }
            return this._valid;
        });
    }
    // PhutBot PLEASE remember to be careful when debugging this class on stream
    _refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            throw 'TwitchTokenWrapper._refresh - not implemented';
        });
    }
}
class TwitchAppTokenWrapper extends TwitchTokenWrapper {
    constructor(name, auth, vars, scopes) {
        super(name, vars, scopes);
        this._auth = auth;
    }
    // PhutBot PLEASE remember to be careful when debugging this class on stream
    _refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._auth.generateAppToken();
            this._valid = true;
            const ms = Number.parseInt(Env.get(this._vars.EXPIRES)) - Date.now();
            console.log(`[INFO] TwitchTokenWrapper._refresh: ${this.name} token expires in ${Millis.toMin(ms)} minutes`);
            clearTimeout(this._refreshTimeout);
            this._refreshTimeout = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                yield this._refresh();
            }), ms);
        });
    }
}
class TwitchUserAccessTokenWrapper extends TwitchTokenWrapper {
    constructor(name, vars, scopes) {
        super(name, vars, scopes);
    }
    // PhutBot PLEASE remember to be careful when debugging this class on stream
    _refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            TwitchOAuth2._storeToken(this._vars, yield Https.request({
                method: 'POST',
                uri: '/oauth2/token',
                query: {
                    'client_id': Env.get(this._vars.ID),
                    'client_secret': Env.get(this._vars.SECRET),
                    'refresh_token': Env.get(this._vars.REFRESH),
                    'grant_type': 'refresh_token'
                }
            }));
            this._valid = true;
            const ms = Number.parseInt(Env.get(this._vars.EXPIRES)) - Date.now();
            console.log(`[INFO] TwitchTokenWrapper._refresh: ${this.name} token expires in ${Millis.toMin(ms)} minutes`);
            clearTimeout(this._refreshTimeout);
            this._refreshTimeout = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                yield this._refresh();
            }), ms);
        });
    }
}
module.exports = TwitchOAuth2;
