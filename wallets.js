// 1. 安装 web3.js
// 请确保在运行代码前安装了 web3.js，运行以下命令：
// npm install web3

const Web3 = require("web3");
const fs = require("fs");

function createWallet() {
    // 初始化 Web3 实例（这里不需要连接到节点，仅用于生成钱包）
    const web3 = new Web3();

    // 生成一个新账户
    const account = web3.eth.accounts.create();

    // 提取钱包信息
    const walletInfo = {
        address: account.address,  // 钱包地址
        privateKey: account.privateKey,  // 私钥
    };

    console.log("钱包已成功创建！");
    console.log("钱包地址:", walletInfo.address);
    console.log("私钥:", walletInfo.privateKey);

    // 将钱包信息保存到文件
    fs.writeFileSync(
        "wallet_web3.json",
        JSON.stringify(walletInfo, null, 2),
        "utf-8"
    );
    console.log("钱包信息已保存到 wallet_web3.json 文件中，请妥善保管！");

    return walletInfo;
}

// 调用函数创建钱包
const newWallet = createWallet();
