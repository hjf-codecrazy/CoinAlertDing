import axios from './AxiosInstance.js';
import { sendDingTalkMessage } from './sendDingTalkMessage.js';
export default class TokenAnnouncementChecker {
    constructor(url, platformName, regex) {
        this.url = url;
        this.platformName = platformName;
        this.regex = regex;
        this.lastTokenSymbol = null;
    }

    async checkAnnouncement() {
        try {
            const response = await axios.get(this.url);
            const htmlContent = response.data;

            const match = this.regex.exec(htmlContent);

            if (match) {
                const tokenName = match[1];
                const tokenSymbol = match[2];
            
                const message = tokenSymbol
                ? `${this.platformName}将上线新: ${tokenName} (${tokenSymbol})`
                : `${this.platformName}将上线新: ${tokenName} `;
        

                if (tokenSymbol !== this.lastTokenSymbol) {
                    console.log(message);
                    // await sendDingTalkMessage(message);

                    this.lastTokenSymbol = tokenSymbol;
                } else {
                    console.log(`Duplicate token detected: ${tokenSymbol}, no message sent.`);
                }
            } else {
                console.log(`No token symbol found in the ${this.platformName} announcement.`);
            }

        } catch (error) {
            console.error(`Error fetching ${this.platformName} announcement:`, error);
        }
    }
}
