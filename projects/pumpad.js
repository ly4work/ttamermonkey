// ==UserScript==
// @name         自动连接 MetaMask 并签名
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  自动连接 MetaMask 钱包并进行签名授权
// @match        https://pumpad.io/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 钱包地址
    var global_account = ""


    function createFloatingMenu({ isLogin, isCheckIn }) {
        const menuStyle = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: rgba(0, 123, 255, 0.7);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            z-index: 9999;
            transition: all 0.3s ease;
        `;

        const menuItemStyle = `
            background-color: rgba(0, 123, 255, 0.9);
            color: white;
            padding: 10px;
            margin-bottom: 5px;
            border-radius: 5px;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s ease;
            white-space: nowrap;
        `;

        const menu = document.createElement('div');
        menu.id = 'floating-menu';
        menu.style.cssText = menuStyle;
        menu.textContent = 'Menu';

        const menuItems = document.createElement('div');
        menuItems.id = 'menu-items';
        menuItems.style.cssText = `
            position: absolute;
            bottom: 100%;
            right: 0;
            margin-bottom: 10px;
            display: none;
        `;

        const item1 = document.createElement('div');
        item1.textContent = isCheckIn ? '✅今日已签到' : '🔒未签到';
        item1.style.cssText = menuItemStyle;

        const item2 = document.createElement('div');
        item2.textContent = isLogin ? '✅已登录' : '🔒未登录';
        item2.style.cssText = menuItemStyle;

        menuItems.appendChild(item1);
        menuItems.appendChild(item2);
        menu.appendChild(menuItems);

        menu.addEventListener('mouseenter', () => {
            menuItems.style.display = 'block';
            setTimeout(() => {
                item1.style.opacity = '1';
                item1.style.transform = 'translateY(0)';
                item2.style.opacity = '1';
                item2.style.transform = 'translateY(0)';
            }, 50);
        });

        menu.addEventListener('mouseleave', () => {
            item1.style.opacity = '0';
            item1.style.transform = 'translateY(20px)';
            item2.style.opacity = '0';
            item2.style.transform = 'translateY(20px)';
            setTimeout(() => {
                menuItems.style.display = 'none';
            }, 300);
        });

        document.body.appendChild(menu);
    }

    async function eth_getWalletAddress() {

        // 检查页面是否有以太坊对象
        if (typeof window.ethereum !== 'undefined') {
            console.log('MetaMask detected');

            // 定义一个函数来获取钱包地址，不触发授权请求
            async function getWalletAddress() {
                try {
                    // 通过 eth_accounts 获取已连接的账户
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    console.log("getWalletAddress:::=>", accounts)
                    if (accounts.length > 0) {
                        console.log('Connected wallet address:', accounts[0]);
                        return new Promise(resolve => {
                            global_account = accounts[0]
                            resolve(accounts[0])
                        })
                    } else {
                        console.log('No wallet connected');
                        // alert('No wallet connected');
                        return new Promise(resolve => {
                            resolve(null)
                        })
                    }
                } catch (error) {
                    console.error('Error retrieving wallet address:', error);
                    // alert('Error retrieving wallet address');
                }
            }

            return getWalletAddress()

        } else {
            console.log('MetaMask is not installed');
            alert('MetaMask is not installed');
        }
    }

    async function getElements({ needLogin }) {
        // 获取verify your account的验证按钮
        const verifyAccountBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent === 'Follow');
        console.log(verifyAccountBtn);
        // verifyAccountBtn.click();

        // 获取断开钱包连接的按钮
        const disconnectBtn = document.getElementById('popover-body-:rm:');
        // disconnectBtn && disconnectBtn.click();

        const metamaskBtn = Array.from(document.querySelectorAll('div')).find(el => el.textContent.trim() === 'MetaMask');
        console.log("needLogin :metamaskBtn =>", needLogin, metamaskBtn);
        needLogin && metamaskBtn.click();
    }

    // 检查是否存在 钱包登录状态
    async function checkWeb3Provider() {
        if (typeof window.ethereum !== 'undefined') {
            console.log('MetaMask 已检测到');
            return connectWallet();
        } else {
            console.log('请安装 MetaMask');
            return false
        }
    }

    // 连接钱包
    async function connectWallet() {
        // alert("connectWallet")
        console.log("调用 connectWallet")
        try {
            // 请求用户授权连接其 MetaMask 钱包
            console.log('准备查询钱包地址:');
            const account = await eth_getWalletAddress()
            console.log("查询钱包地址为 ==>", account);
            return new Promise((resolve, reject) => {
                resolve(!!account);
            });
            // if () {
            //     return new Promise((resolve, reject) => {
            //         resolve(true);
            //     });
            // } else {
            //     // return await signMessage(account);
            // }
        } catch (error) {
            console.error('连接钱包时出错:', error);
        }
    }

    // 签名消息
    async function signMessage(account) {
        console.log("调用 signMessage")
        const message = "请授权此应用程序";
        try {
            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [message, account]
            });
            console.log('消息已签名:', signature);
            // 在这里可以将签名发送到您的服务器进行验证
        } catch (error) {
            console.error('签名消息时出错:', error);
        }
    }
    async function autoRun() {
        console.log(window.location.href)


        const isLogin = await checkWeb3Provider();
        if (global_account) {
            console.log("已登录 ", global_account);
        } else {
            console.log("未登录", global_account);
        }
        setTimeout(() => {
            getElements({ needLogin: !global_account });
            createFloatingMenu({ isLogin: !!global_account, isCheckIn: false })
        }, 1500);
    }




    // // 页面加载完成后执行
    window.addEventListener('load', autoRun);

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) {
            global_account = ""
            // 页面变为可见时执行 autoRun
            autoRun();
        }
    });
})();
