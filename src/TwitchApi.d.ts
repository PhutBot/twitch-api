export = TwitchApi;
declare class TwitchApi {
    static MAX_RETRY: number;
    constructor(token: any);
    _token: any;
    _cache: {
        users: {};
        channels: {};
        streams: {};
        moderators: {};
        follows: {};
        subscriptions: {};
    };
    users(login: any, cacheTime?: number): Promise<any>;
    channels(login: any, cacheTime?: number): Promise<any>;
    streams(login: any, cacheTime?: number): Promise<any>;
    moderators(login: any, cacheTime?: number): Promise<any>;
    follows(from_login: any, to_login: any, cacheTime?: number, params?: {}): Promise<any>;
    subscriptions(from_login: any, to_login: any, cacheTime?: number): Promise<any>;
    getCustomReward(broadcaster_id: any, only_manageable_rewards?: boolean): Promise<any>;
    createCustomReward(broadcaster_id: any, title: any, cost: any, prompt?: undefined, is_user_input_required?: boolean, should_redemptions_skip_request_queue?: boolean): Promise<any>;
    updateRedemptionStatus(broadcaster_id: any, reward_id: any, id: any, status: any): Promise<any>;
    _paginate(endpoint: any, params: any, want: any): Promise<any>;
    _api(uri: any, params?: {}, retry?: boolean, depth?: number): Promise<any>;
}
//# sourceMappingURL=TwitchApi.d.ts.map