import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

class AxiosInstance {
    constructor() {
        const proxyUrl = 'http://127.0.0.1:7890';  // 代理服务器的 URL
        const agent = new HttpsProxyAgent(proxyUrl);  // 创建代理实例

        // 创建 Axios 实例
        this.axiosInstance = axios.create({
            httpsAgent: agent
        });
    }

    getInstance() {
        return this.axiosInstance;
    }
}

export default new AxiosInstance().getInstance();
