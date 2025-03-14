import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { sendDingTalkMessage } from './sendDingTalkMessage.js'; // 导入发送钉钉消息的模块
import TokenAnnouncementChecker from './TokenAnnouncementChecker.js';
// 目标价格阈值
const TARGET_PRICE_ETH = 3079;
const TARGET_PRICE_BTC = 50000;
// 使用 let 声明以便更新目标价格
let targetPriceBTCHigh = 67000; // BTC的目标高价
let targetPriceBTCLow = 66000; // BTC的目标低价
let targetPriceETHHigh = 3700; // ETH的目标高价
let targetPriceETHLow = 3600; // ETH的目标低价
// 阿里云短信服务配置
const SMS_API_HOST = "https://gyytz.market.alicloudapi.com";
const SMS_API_PATH = "/sms/smsSend";
const APPCODE = "";
const RECIPIENT_MOBILE = "";
const SMS_SIGN_ID = "";
const TEMPLATE_ID = "";
let smsSent = false;

// 创建代理对象
const proxyUrl = 'http://127.0.0.1:7890';  // 代理服务器的 URL
const agent = new HttpsProxyAgent(proxyUrl);  // 创建代理实例

// 创建一个 Axios 实例
const axiosInstance = axios.create({
    httpsAgent: agent
});

let lastTokenSymbol = null;  // 用于存储上一次的 tokenSymbol
let lastSentTime = null;  // 用于存储上一次发送消息的时间
// 定义通用的正则表达式
const regex = /Will List\s+(.*?)\s+\((.*?)\)/gi;

// 定义通用的正则表达式
const okxRegex = /上线\s+([^\s]+?\s+\([^\)]+\))\s+币币交易/i;






// 创建 Binance 检查器实例
const binanceChecker = new TokenAnnouncementChecker(
    'https://www.binance.com/en/support/announcement/c-48?navId=48#/48',
    'Binance',
    regex
);

// 创建 Bitget 检查器实例
const bitgetChecker = new TokenAnnouncementChecker(
    'https://www.bitget.fit/support/sections/12508313443483',
    'Bitget',
    regex
);

// 创建 OKX 检查器实例
const okxChecker = new TokenAnnouncementChecker(
    'https://www.okx.com/zh-hans/help/section/announcements-latest-announcements',
    'OKX',
    okxRegex
);


// 新增函数：获取HTML内容并检查是否包含指定文本
async function checkForBinanceAnnouncement() {
        // 调用 checkAnnouncement 方法
        binanceChecker.checkAnnouncement();

}



async function checkForBitgetAnnouncement() {
    

    // 调用 checkAnnouncement 方法
    bitgetChecker.checkAnnouncement();
}

// 新增函数：获取HTML内容并检查是否包含指定文本
async function checkForOKxAnnouncement() {
    // 调用 checkAnnouncement 方法
    okxChecker.checkAnnouncement();

}


async function checkAllAnnouncements() {
    try {
        // 依次调用三个检查函数
        await checkForBinanceAnnouncement();
        await checkForBitgetAnnouncement();
        await checkForOKxAnnouncement();
    } catch (error) {
        console.error("Error checking announcements:", error);
    }
}

// 初始化目标价格和波动范围
const targetPrices = {
    ETH: { high: 3700, low: 3600 },
    BTC: { high: 67000, low: 66000 },
    BNB: { high: 500, low: 490 },
    XRP: { high: 3.0, low: 2.5 },
};

// 初始化每种币的价格波动范围
const targetRanges = {
    ETH: 30,
    BTC: 300,
    BNB: 10, 
    XRP:0.01
};

// 主函数：获取价格并发送通知
async function main() {
    try {
        // 定义需要获取价格的币种
        const symbols = ['ETH', 'BTC', 'BNB', 'XRP'];
        const prices = {};
        const notifications = []; // 用于收集需要发送的通知内容

        // 获取所有币种的价格
        for (const symbol of symbols) {
            prices[symbol] = await fetchPrice(symbol);
        }

        const now = new Date().toLocaleString(); // 获取当前时间并格式化
        console.log(`Prices: ${JSON.stringify(prices)}, Time: ${now}`);

        // 遍历每种币种，检查目标价格
        for (const symbol of symbols) {
            const price = prices[symbol];
            if (targetPrices[symbol].high <= price || targetPrices[symbol].low >= price) {
                console.log(`${symbol} target price reached: ${price}`);
                // 更新目标价格
                targetPrices[symbol].high = price +  targetRanges[symbol] ;
                targetPrices[symbol].low = price - targetRanges[symbol];
                // 添加到通知内容
                notifications.push(`${symbol} Price: ${price}`);
            } else {
                console.log(`${symbol} target price not reached: ${price}`);
            }
        }

        // 如果有需要通知的内容，合并为一条消息发送
        if (notifications.length > 0) {
            const message = `${notifications.join('\n')}`;
            sendDingTalkMessage(message);
        } else {
            console.log('No target prices reached, no notifications sent.');
        }
    } catch (error) {
        console.error('Failed to fetch price or send notification:', error);
    }
}

// 通用函数：获取指定币种对USDT的价格
async function fetchPrice(symbol) {
    const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`;
    try {
        const response = await axiosInstance.get(url);
        return parseFloat(response.data.price);
    } catch (error) {
        console.error(`Error fetching ${symbol} price:`, error);
        throw error;
    }
}

// 定时发送服务状态消息
function sendServiceStatus() {
    sendDingTalkMessage('服务ok');
}



main() 
// checkAllAnnouncements()
// 设置定时执行价格检查
setInterval(main, 2 * 60 * 1000);  // 每2分钟执行一次main函数

// 设置定时执行服务状态消息
// setInterval(sendServiceStatus, 3 * 60 * 60 * 1000);  // 每3小时执行一次sendServiceStatus函数


// setInterval(checkAllAnnouncements,  30 * 60 * 1000);  // 每3小时执行一次sendServiceStatus函数
