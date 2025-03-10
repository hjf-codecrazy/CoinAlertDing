import axios from 'axios';
import crypto from 'crypto';
import querystring from 'querystring';
import { HttpsProxyAgent } from 'https-proxy-agent';
import dotenv from 'dotenv';

dotenv.config(); // 读取 .env 文件中的环境变量

const webhookUrl = 'https://oapi.dingtalk.com/robot/send';
const accessToken = process.env.ACCESS_TOKEN;
const secret = process.env.SECRET;
console.log('accessToken:', accessToken);  // 添加调试
console.log('SECRET:', secret);  // 添加调试

const proxyUrl = 'http://127.0.0.1:7890';  
const agent = new HttpsProxyAgent(proxyUrl);  

const axiosInstance = axios.create({
    httpsAgent: agent
});

function generateSignature(secret, timestamp) {
    const stringToSign = `${timestamp}\n${secret}`;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(stringToSign);
    const hmacCode = hmac.digest();
    return querystring.escape(Buffer.from(hmacCode).toString('base64'));
}

export async function sendDingTalkMessage(message) {
    const timestamp = new Date().toLocaleString();
    const formattedMessage = `${timestamp}\n${message}`;

    const signatureTimestamp = new Date().getTime();
    const signature = generateSignature(secret, signatureTimestamp);

    try {
        const response = await axiosInstance.post(`${webhookUrl}?access_token=${accessToken}&timestamp=${signatureTimestamp}&sign=${signature}`, {
            msgtype: 'text',
            text: { content: formattedMessage },
            at: { atMobiles: [], isAtAll: false }
        });

        console.log('消息发送成功:', response.data);
    } catch (error) {
        console.error('消息发送失败:', error.response ? error.response.data : error.message);
    }
}
