// ==UserScript==
// @name         Bitlayer
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Bitlayer
// @match        https://www.bitlayer.org/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 钱包地址
    let global_account = ""
    // 延迟时间
    let global_delay = 1500

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

    // ... 现有代码 ...

    // 添加全局Toast组件
    const Toast = {
        create: function (message, duration = 3000) {
            const toast = document.createElement('div');
            toast.textContent = message;
            toast.style.cssText = `
            position: fixed;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 10000;
            transition: opacity 0.3s ease-in-out;
        `;

            document.body.appendChild(toast);

            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(toast);
                }, 300);
            }, duration);
        },

        success: function (message, duration) {
            this.create('✅ ' + message, duration);
        },

        error: function (message, duration) {
            this.create('❌ ' + message, duration);
        },

        info: function (message, duration) {
            this.create('ℹ️ ' + message, duration);
        }
    };

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

    // 通过文本匹配按钮
    function getBtnByText(text) {
        const target = Array.from(document.querySelectorAll('div')).find(el => el.textContent.trim() === text);
        console.log(text, "=>", target)
        return target
    }
    // 通过文本匹配父元素
    function getParentDomByText(text) {
        // 获取所有的 div 元素
        const elements = document.querySelectorAll('div');

        // 筛选出包含特定文本的 div 元素
        const targetDiv = Array.from(elements).find(el => el.textContent.trim() === 'Daily Share');

        if (targetDiv) {
            // 获取最外层的 a 标签
            const parentAnchor = targetDiv.closest('a');

            if (parentAnchor) {
                console.log('找到的 a 标签:', parentAnchor);
                const isDisabled = parentAnchor.hasAttribute('disabled');
                console.log(text, 'disabled 状态:', isDisabled); // 由于 a 标签没有 disabled 属性，需另行处理

                return {
                    ...parentAnchor,
                    isDisabled: isDisabled
                }
            } else {
                console.log('没有找到父 a 标签');
                return null
            }
        } else {
            console.log('没有找到包含 "Daily Share" 的 div 元素');
            return null
        }
    }
    async function getElements({ needLogin }) {
        // DAILY BROWSE按钮
        const dailyBrowseBtn = getBtnByText('Daily Browse');
        if (!needLogin && dailyBrowseBtn && !dailyShareBtn.isDisabled) {
            dailyBrowseBtn && dailyBrowseBtn.click();
            Toast.success("调用dailyShareBtn...")
        }

        // DAILY SHARE按钮
        // const dailyShareBtn = getBtnByText("Daily Share");
        const dailyShareBtn = getParentDomByText("Daily Share");
        if (!needLogin && dailyShareBtn && !dailyShareBtn.isDisabled) {
            dailyShareBtn && dailyShareBtn.click();
            Toast.success("调用dailyShareBtn...")
        }

        // DAILY MESON按钮
        const dailyMesonBtn = getBtnByText("Daily Meson Bridge");
        if (dailyMesonBtn) {
            // dailyMesonBtn && dailyMesonBtn.click();
            // Toast.success("调用Daily MESON BRIDGE...")
        }

        // 获取断开钱包连接的按钮
        const disconnectBtn = document.getElementById('popover-body-:rm:');
        // disconnectBtn && disconnectBtn.click();

        const collectBtn = Array.from(document.querySelectorAll('span')).find(el => el.textContent.trim() === 'Connect Wallet');
        if (needLogin) {
            collectBtn.click();
            Toast.info("准备登录...")
            setTimeout(() => {
                const metaMaskBtn = Array.from(document.querySelectorAll('span')).find(el => el.textContent.trim() === 'MetaMask');
                metaMaskBtn && metaMaskBtn.click()
            }, 1000)
        }
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
        }, global_delay);
    }




    // // 页面加载完成后执行
    window.addEventListener('load', autoRun);

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) {
            global_account = ""
            // 页面变为可见时执行 autoRun
            // autoRun();
        }
    });
})();
