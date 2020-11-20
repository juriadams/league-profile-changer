import LCUConnector from "lcu-connector";
import { LCUCredentials } from "./interfaces/lcu-credentials.interface";
import axios from "axios";
import https from "https";
import ora from "ora";
import prompts from "prompts";

// Create new LCU Connector instance and HTTP Agent
const connector = new LCUConnector();
const agent = new https.Agent({
    rejectUnauthorized: false,
});

// Array of all available Queue Types
const QUEUE_TYPES = [
    { title: "Ranked Solo/Duo", value: "RANKED_SOLO_5x5" },
    { title: "Ranked Flex 5v5", value: "RANKED_FLEX_SR" },
    { title: "Ranked Flex 3v3", value: "RANKED_FLEX_TT" },
    { title: "TFT", value: "RANKED_TFT" },
];

// Array of all available Tiers
const TIERS = [
    { title: "Challenger", value: "CHALLENGER" },
    { title: "Grandmaster", value: "GRANDMASTER" },
    { title: "Master", value: "MASTER" },
    { title: "Diamond", value: "DIAMOND" },
    { title: "Platinum", value: "PLATINUM" },
    { title: "Gold", value: "GOLD" },
    { title: "Silver", value: "SILVER" },
    { title: "Bronze", value: "BRONZE" },
    { title: "Iron", value: "IRON" },
];

// Array of all available Divisions
const DIVISIONS = [
    { title: "I", value: "I" },
    { title: "II", value: "II" },
    { title: "III", value: "III" },
    { title: "IV", value: "IV" },
    { title: "V", value: "V" },
    { title: "VI", value: "VI" },
    { title: "VII", value: "VII" },
    { title: "VIII", value: "VIII" },
];

// Array of all available Levels
const REWARD_LEVELS = [
    { title: "1", value: "1" },
    { title: "2", value: "2" },
    { title: "3", value: "3" },
];

// Show Project Headline
console.log(`\n> League Profile Changer\n`);

// Show LCU Connector loading Spinner
const LCUConnection = ora("Connect to League Client").start();

// Connect to the League Client
connector
    .on("connect", async (credentials: LCUCredentials) => {
        // Finish Spinner
        LCUConnection.succeed();

        // Get user Profile
        const profile = await getProfile(credentials);

        // Print "Welcome" Message
        console.log(`\n> What's up, ${profile.name}?\n`);

        // Set custom Queue
        const queue = await prompts({
            type: "select",
            name: "value",
            message: "Select Queue Type",
            choices: QUEUE_TYPES,
            initial:
                QUEUE_TYPES.findIndex(
                    (p) => p.value === profile.lol.rankedLeagueQueue
                ) || 0,
        });

        // Set custom Tier
        const tier = await prompts({
            type: "select",
            name: "value",
            message: "Select Tier",
            choices: TIERS,
            initial:
                TIERS.findIndex(
                    (p) => p.value === profile.lol.rankedLeagueTier
                ) || 0,
        });

        // Set custom Division
        const division = await prompts({
            type: "select",
            name: "value",
            message: "Select Division",
            choices: DIVISIONS,
            initial:
                DIVISIONS.findIndex(
                    (p) => p.value === profile.lol.rankedLeagueDivision
                ) || 0,
        });

        // Set custom Reward Level
        const rewardLevel = await prompts({
            type: "select",
            name: "value",
            message: "Select Reward Level",
            choices: REWARD_LEVELS,
            initial:
                REWARD_LEVELS.findIndex(
                    (p) => p.value === profile.lol.rankedSplitRewardLevel
                ) || 0,
        });

        // Set custom Status Message
        const status = await prompts({
            type: "text",
            name: "value",
            message: "Custom Status Message",
            initial: profile.statusMessage,
        });

        // Print empty line
        console.log("");

        // Update Profile with specified Information
        await updateProfile(credentials, {
            lol: {
                rankedLeagueDivision: division.value,
                rankedLeagueQueue: queue.value,
                rankedLeagueTier: tier.value,
                rankedSplitRewardLevel: rewardLevel.value,
                rankedWins: (Math.floor(Math.random() * 750) + 100).toString(),
            },
            statusMessage: status.value,
        });
    })
    .start();

/**
 * Get the Chat profile of the currently logged in User
 * @param credentials Credentials object containing LCU Credentials
 */
async function getProfile(credentials: LCUCredentials): Promise<any> {
    const spinner = ora("Get Summoner Profile").start();
    return axios
        .get(
            `${credentials.protocol}://${credentials.address}:${credentials.port}/lol-chat/v1/me`,
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
            return res.data;
        })
        .catch((error) => {
            spinner.fail("Error getting Summoner Profile");
            console.error(error.response.data);
        });
}

/**
 * Update the Chat profile of the currently logged in User
 * @param credentials Credentials object containing LCU Credentials
 * @param profile Profile object containing values that will be updated
 */
async function updateProfile(
    credentials: LCUCredentials,
    profile: any
): Promise<number> {
    const spinner = ora("Update Summoner Profile").start();
    return axios
        .put(
            `${credentials.protocol}://${credentials.address}:${credentials.port}/lol-chat/v1/me`,
            profile,
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
            return res.data;
        })
        .catch((error) => {
            spinner.fail("Error updating Summoner Profile");
            console.error(error);
            console.error(error.response.data);
        });
}
