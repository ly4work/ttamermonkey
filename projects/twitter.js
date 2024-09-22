// ==UserScript==
// @name         twitter自动转发关闭
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  twitter
// @match        https://x.com/intent/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 钱包地址
    let global_account = ""
    // 延迟时间
    let global_delay = 1500

    function autoRun() {
        setTimeout(() => {
            window.close()
        }, 300);
    }

    // // 页面加载完成后执行
    window.addEventListener('load', autoRun);

    // 监听页面可见性变化
    // document.addEventListener('visibilitychange', function () {
    //     if (!document.hidden) {
    //         global_account = ""
    //         // 页面变为可见时执行 autoRun
    //         // autoRun();
    //     }
    // });
})();
