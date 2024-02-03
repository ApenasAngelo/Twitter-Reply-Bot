import { aiRequest } from "./ai.request";
import { client } from "./client";
import { scraper } from "./scraper";
import { Tweet } from "@the-convocation/twitter-scraper"

async function observeProfile(username: string) {

    let lastTweetId: string | null | undefined = null;
    let filteredText: string | undefined = '';
    const targetedUserId: string = process.env.TARGETED_USER_ID || '';

    console.log('Observing profile:', username);

    while (true) {
        const tweet = await scraper.getLatestTweet(username, true, 1);

        console.log('Checking for new tweets...');
        console.log(new Date());

        if (filteredText !== '') filteredText = ''

        if (tweet) {
            if (tweet.id !== lastTweetId && tweet.userId === targetedUserId) {
                lastTweetId = tweet.id;

                filteredText = filterText(tweet);
                if (filterText !== undefined) {
                    aiRequest(tweet.text).then((response) => {
                        if (response) { client.v2.reply(response, tweet.id); }
                    });
                }
            }

            await new Promise((resolve) => setTimeout(resolve, 60000)); // Check for new tweets every 60 seconds
        }
    }
}

function filterText(tweet: Tweet): string | undefined {

    let formattedText: string = tweet.text ?? '';
    if (formattedText === '') return undefined;

    filterMentions();
    filterLinks();
    return formattedText;

    function filterMentions() {
        for (const mention of tweet.mentions) {
            let regex: string = mention.username?.replace(/^/, "@") ?? '';

            if (regex && tweet.text) {
                const index: number = tweet.text.indexOf(regex);
                if (index !== -1 && tweet.text[index + regex.length] === " ") {
                    regex += ' ';
                }

                if (tweet.text?.includes(regex)) {
                    formattedText = formattedText.replace(regex, '');
                }
            }
        }
    }

    function filterLinks() {
        const regex: RegExp = /\s?https:\/\/t\.co\/\S+/;
        if (regex.test(formattedText)) {
            formattedText = formattedText.replace(regex, '');
        }
    }
}

async function scraperLogin(username: string | undefined, password: string | undefined): Promise<void> {

    try {
        if (!username || !password) throw new Error("Username or password not provided");

        await scraper.login(username, password);
        console.log("Logged in: " + await scraper.isLoggedIn());
    } catch (e) {
        console.error(e);
    }
}

console.log('Starting bot...');
console.log('Logging in...');
scraperLogin(process.env.TWITTER_USERNAME, process.env.TWITTER_PASSWORD);
observeProfile('');