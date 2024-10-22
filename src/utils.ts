export const shouldLogWebSocket = !window.location.href.includes("nin0.dev");

export const Role = {
    Guest: 1 << 0,
    User: 1 << 1,
    Bot: 1 << 2,
    System: 1 << 3,
    Mod: 1 << 4,
    Admin: 1 << 5
};

export type Message = {
    userInfo: {
        id: string;
        username: string;
        roles: number;
        bridgeMetadata?: {
            from: string;
            color: string;
        };
    };
    id: string;
    content: string;
    timestamp: number;
    type: number;
};
