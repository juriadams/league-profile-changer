export interface LCUCredentials {
    protocol: "http" | "https";
    address: string;
    port: number;
    username: string;
    password: string;
}
