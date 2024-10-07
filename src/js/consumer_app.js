ConApp = {
    QuantityAvailable: null,
    frequency: {},

    loadAddress: async function() {
        $('.container').hide();
        // Get the current account
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
            App.account = accounts[0];
            setTimeout(async function() {
                const acInstance = await App.contracts.AdminContract.deployed();
                const exists = await acInstance.checkConsumer(App.account);
                if (!exists) {
                    alert("Please log in with a Consumer account to access this page");
                } else {
                    const accountName = await acInstance.getConsumerName(App.account);
                    $('.accountaddress').html("Welcome, " + accountName);
                    $('.loader').hide();
                    $('.container').show();
                    ConApp.render();
                }
            }, 500);
        } else {
            console.error("No accounts found");
        }
    },

    render: async function() {
        const acInstance = await App.contracts.AdminContract.deployed();
        const retailerCount = await acInstance.getRetailerCount();
        const retailerSelect = $('#retailerSelect');
        retailerSelect.empty();
        retailerSelect.append("<option value='" + null + "' disabled selected>Select Retailer</option>");

        for (let i = 0; i < retailerCount; i++) {
            const singleProducer = await acInstance.retailers(i);
            const name = singleProducer[2];
            const address = singleProducer[0];
            retailerSelect.append("<option value='" + address + "'>" + name + "</option>");
        }

        const pInstance = await App.contracts.NodeContract.deployed();
        const pCount = await pInstance.getProductCount();
        const productList = $('#productList');
        productList.empty();

        for (let i = 0; i < pCount; i++) {
            const singleProduct = await pInstance.ProductList(i);
            if (App.account === singleProduct[2] && !singleProduct[5] && !singleProduct[6]) {
                const id = i; // Use the current index as the id
                const name = singleProduct[3];
                const type = singleProduct[4];
                const productTemplate = "<tr><td>" + id + "</td><td>" + name + "</td><td>" + type + "</td></tr>";
                productList.append(productTemplate);
            }
        }

        const returnList = $('#returnedProductList');
        returnList.empty();

        for (let i = 0; i < pCount; i++) {
            const singleProduct = await pInstance.ProductList(i);
            if (App.account === singleProduct[2] && singleProduct[5]) {
                const id = i; // Use the current index as the id
                const name = singleProduct[3];
                const type = singleProduct[4];
                const productTemplate = "<tr><td>" + id + "</td><td>" + name + "</td><td>" + type + "</td></tr>";
                returnList.append(productTemplate);
            }
        }
    },

    updateRetailer: async function() {
        const pInstance = await App.contracts.NodeContract.deployed();
        const pCount = await pInstance.getProductCount();
        const rAddress = $('#retailerSelect').val();
        const pType = $('#productType').val();
        const nameSet = new Set();
        ConApp.frequency = {};
        const productlistSelect = $('#productlistSelect');
        productlistSelect.empty();
        productlistSelect.append("<option value='" + null + "' disabled selected>Select an option</option>");

        for (let i = 0; i < pCount; i++) {
            const singleProduct = await pInstance.ProductList(i);
            if (singleProduct[2] === "0x0000000000000000000000000000000000000000" && singleProduct[1] === rAddress && singleProduct[4] === pType) {
                if (singleProduct[3] in ConApp.frequency) {
                    ConApp.frequency[singleProduct[3]] += 1;
                } else {
                    ConApp.frequency[singleProduct[3]] = 1;
                }
                nameSet.add(singleProduct[3]);
            }
        }

        nameSet.forEach(values => {
            productlistSelect.append("<option value='" + values + "'>" + values + "</option>");
        });

        setTimeout(function() {
            const type = $('#productlistSelect').val();
            ConApp.QuantityAvailable = ConApp.frequency[type] || 0;
            alert("Available Stock: " + ConApp.QuantityAvailable);
        }, 500);
    },

    updateCount: function() {
        const type = $('#productlistSelect').val();
        if (ConApp.frequency[type] === undefined) {
            alert("Available Stock: 0");
        } else {
            ConApp.QuantityAvailable = ConApp.frequency[type];
            alert("Available Stock: " + ConApp.frequency[type]);
        }
    },

    buyProduct: async function() {
        const rAddress = $('#retailerSelect').val();
        const pType = $('#productType').val();
        const productname = $('#productlistSelect').val();
        const quantity = $('#quantity').val();
        const pInstance = await App.contracts.NodeContract.deployed();

        if (rAddress != null && pType != null && productname != null && quantity != "") {
            if (quantity > ConApp.QuantityAvailable || quantity == 0) {
                alert("Enter Valid Quantity");
            } else {
                const amount = await pInstance.getCostForConsumer(rAddress, productname, pType, quantity);
                const proceed = confirm("Total Cost of product(s): " + amount + " ethers\nPress ok to continue");
                if (proceed) {
                    const receipt = await pInstance.soldToConsumer(rAddress, productname, pType, quantity, {
                        from: App.account,
                        value: web3.utils.toWei(amount.toString(), 'ether') // Updated line
                    });
                    if (receipt != undefined) {
                        alert("Transaction successful");
                        ConApp.render();
                    }
                }
            }
        } else {
            alert("Fill empty fields");
        }
    }
};

$(document).ready(function() {
    $(window).on('load', function() {
        ConApp.loadAddress();
    });
});
