import LCUConnector from "lcu-connector";
import { LCUCredentials } from "./interfaces/lcu-credentials.interface";
import axios from "axios";
import https from "https";
import ora from "ora";

const connector = new LCUConnector();
const agent = new https.Agent({
    rejectUnauthorized: false,
});

const LCUConnection = ora("Waiting for League Client").start();

connector
    .on("connect", async (credentials: LCUCredentials) => {
        LCUConnection.succeed();

        const accountId = await getAccountId(credentials);
        const bearerToken = await getBearerToken(credentials);
        const wallet = await getAccountWallet(credentials);
    })
    .start();

async function getAccountId(credentials: LCUCredentials): Promise<number> {
    const spinner = ora("Getting Account ID").start();
    return axios
        .get(
            `${credentials.protocol}://${credentials.address}:${credentials.port}/lol-rso-auth/v1/authorization`,
            {
                headers: {
                    Authorization: `Basic ${Buffer.from(
                        `${credentials.username}:${credentials.password}`
                    ).toString("base64")}`,
                },
                httpsAgent: agent,
            }
        )
        .then((res) => {
            spinner.succeed();
            return res.data.currentAccountId;
        })
        .catch(() => {
            spinner.fail("Error getting Account ID");
        });
}

async function getBearerToken(credentials: LCUCredentials): Promise<string> {
    const spinner = ora("Getting Bearer Token").start();
    return axios
        .get(
            `${credentials.protocol}://${credentials.address}:${credentials.port}/lol-rso-auth/v1/authorization/access-token`,
            {
                headers: {
                    Authorization: `Basic ${Buffer.from(
                        `${credentials.username}:${credentials.password}`
                    ).toString("base64")}`,
                },
                httpsAgent: agent,
            }
        )
        .then((res) => {
            spinner.succeed();
            return res.data.token;
        })
        .catch(() => {
            spinner.fail("Error getting Bearer Token");
        });
}

async function getAccountWallet(credentials: LCUCredentials): Promise<string> {
    const spinner = ora("Getting Account Wallet").start();
    return axios
        .get(
            `${credentials.protocol}://${credentials.address}:${credentials.port}/lol-store/v1/wallet`,
            {
                headers: {
                    Authorization: `Basic ${Buffer.from(
                        `${credentials.username}:${credentials.password}`
                    ).toString("base64")}`,
                },
                httpsAgent: agent,
            }
        )
        .then((res) => {
            spinner.succeed();
            console.log(res.data);
            return res.data;
        })
        .catch((error) => {
            console.error(error);
            spinner.fail("Error getting Account Wallet");
        });
}
