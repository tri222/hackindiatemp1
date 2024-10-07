RecApp = {
    QuantityAvailable: null,
    frequency: {},
    returnProductIDs: new Set(),

    loadAddress: async function() {
        $('.container').hide();

        // Use window.ethereum instead of web3.currentProvider
        if (typeof window.ethereum !== 'undefined') {
            const provider = window.ethereum;

            try {
                // Request account access
                await provider.request({ method: 'eth_requestAccounts' });
                const accounts = await web3.eth.getAccounts(); // Use web3 to get accounts
                App.account = accounts[0]; // Use the first account

                var acInstance;
                setTimeout(async function() {
                    acInstance = await App.contracts.AdminContract.deployed();
                    const exists = await acInstance.checkRetailer(App.account);
                    if (!exists) {
                        alert("Please log in with a Retailer account to access this page");
                    } else {
                        const accountName = await acInstance.getRetailerName(App.account);
                        $('.accountaddress').html("Welcome, " + accountName);
                        $('.loader').hide();
                        $('.container').show();
                        RecApp.render();
                    }
                }, 500);
            } catch (error) {
                console.error("Error accessing accounts: ", error);
            }
        } else {
            console.log('MetaMask is not installed. Please install it to use this app.');
        }
    },

    render: async function() {
        var acInstance;
        var pAddress;
        var pInstance;

        acInstance = await App.contracts.AdminContract.deployed();
        const producerCount = await acInstance.getProducerCount();

        const producerSelect = $('#producerSelect');
        producerSelect.empty();
        producerSelect.append("<option value='" + null + "' disabled selected>Select Producer</option>");

        for (let i = 0; i < producerCount; i++) {
            const singleProducer = await acInstance.producers(i);
            const name = singleProducer[2];
            const address = singleProducer[0];
            producerSelect.append("<option value='" + address + "'>" + name + "</option>");
        }

        var pid = 0;
        pInstance = await App.contracts.NodeContract.deployed();
        const pCount = await pInstance.getProductCount();
        const productList = $('#productList');
        productList.empty();

        for (let i = 0; i < pCount; i++) {
            const singleProduct = await pInstance.ProductList(i);
            if (App.account == singleProduct[1] && !singleProduct[5] && !singleProduct[6]
                && singleProduct[2] == "0x0000000000000000000000000000000000000000") {
                const id = pid;
                const name = singleProduct[3];
                const type = singleProduct[4];
                productList.append("<tr><td>" + id + "</td><td>" + name + "</td><td>" + type + "</td></tr>");
            }
            pid++;
        }

        // Process returned products
        const returnList = $('#returnedProductList');
        returnList.empty();
        let rid = 0;
        for (let i = 0; i < pCount; i++) {
            const singleProduct = await pInstance.ProductList(i);
            if (App.account == singleProduct[1] && singleProduct[5] && !singleProduct[6]) {
                RecApp.returnProductIDs.add(rid);
                const name = singleProduct[3];
                const type = singleProduct[4];
                returnList.append("<tr><td>" + rid + "</td><td>" + name + "</td><td>" + type + "</td></tr>");
            }
            rid++;
        }
    },

    // Other methods remain unchanged...
}

// Document ready
$(document).ready(function() {
    $(window).on('load', function() {
        RecApp.loadAddress();
    });
});
