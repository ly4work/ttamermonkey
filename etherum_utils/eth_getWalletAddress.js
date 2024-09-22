async function eth_getWalletAddress() {

    // 检查页面是否有以太坊对象
    if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask detected');

        // 定义一个函数来获取钱包地址，不触发授权请求
        async function getWalletAddress() {
            try {
                // 通过 eth_accounts 获取已连接的账户
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });

                if (accounts.length > 0) {
                    console.log('Connected wallet address:', accounts[0]);
                    return new Promise(resolve => {
                        resolve(accounts[0])
                    })
                } else {
                    console.log('No wallet connected');
                    alert('No wallet connected');
                    return new Promise(resolve => {
                        resolve(null)
                    })
                }
            } catch (error) {
                console.error('Error retrieving wallet address:', error);
                alert('Error retrieving wallet address');
            }
        }

        return await getWalletAddress()

    } else {
        console.log('MetaMask is not installed');
        alert('MetaMask is not installed');
    }
}

