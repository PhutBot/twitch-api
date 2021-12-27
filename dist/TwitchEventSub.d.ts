export namespace EventSubscriptionType {
    const CHANNEL_FOLLOW: string;
    const CHANNEL_SUBSCRIBE: string;
    const CHANNEL_GIFT: string;
    const CHANNEL_REDEEM: string;
}
export class EventSubscription {
    constructor(token: any, hostname: any, server: any);
    _token: any;
    _hostname: any;
    _server: any;
    _subscriptions: {};
    _verifySignature(transport: any, headers: any, body: any): boolean;
    _dummyEvent(transport: any, status: any, type: any, condition: any, hostname: any, uri: any): void;
    createSubscription(subName: any, transport: any, type: any, condition: any, handler: any): Promise<void>;
    deleteSubscription(subName: any): Promise<void>;
    _listSubscription(status: any): Promise<{}>;
    cleanup(): Promise<void[]>;
}
//# sourceMappingURL=TwitchEventSub.d.ts.map