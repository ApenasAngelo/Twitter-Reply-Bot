import { aiRequest } from "./ai.request";
import { client } from "./client";
import { scraper } from "./scraper";

async function observeProfile(username: string) {

    console.log('Observing profile:', username);
    let lastTweetId: string | null | undefined = null;

    while (true) {
        console.log('Checking for new tweets...');
        console.log(new Date());
        const tweet = await scraper.getLatestTweet(username, false, 1);

        if (tweet) {
            if (tweet.id !== lastTweetId) {
                lastTweetId = tweet.id;
                aiRequest(tweet.text).then((response) => {
                    if (response) {
                        client.v2.reply(response, tweet.id);
                    }
                });
            }
        }

        await new Promise((resolve) => setTimeout(resolve, 60000)); // Check for new tweets every 60 seconds
    }
}

async function scraperLogin(username: string | undefined, password: string | undefined): Promise<void> {

    try {
        if (!username || !password) {
            throw new Error("Username or password not provided");
        }
        await scraper.login(username, password);
        console.log("Logged in: " + await scraper.isLoggedIn());
    } catch (e) {
        console.error(e);
    }
}

console.log('Starting bot...');
console.log('Logging in...');
scraperLogin(process.env.TWITTER_USERNAME, process.env.TWITTER_PASSWORD);
observeProfile('apenasangelo');