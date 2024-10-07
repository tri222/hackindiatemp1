ProApp = {
    addProduct: async function () {
        const productname = $('#productname').val();
        const weightglass = $('#weightglass').val();
        const weightplastic = $('#weightplastic').val();
        const weightnickel = $('#weightnickel').val();
        const weightaluminium = $('#weightaluminium').val();
        const weightcopper = $('#weightcopper').val();
        const weightmagnesium = $('#weightmagnesium').val();
        const weightlead = $('#weightlead').val();
        const producttype = $('#producttype').val();
        const price = $('#price').val();
        const quantity = $('#quantity').val();

        if (productname && weightglass && weightplastic && weightnickel && weightaluminium && weightcopper && weightmagnesium && weightlead && price && quantity) {
            const instance = await App.contracts.NodeContract.deployed();
            await instance.addProduct(productname, producttype, weightaluminium, weightnickel, weightglass, weightplastic, weightcopper, weightmagnesium, weightlead, price, quantity);
            ProApp.render();
        } else {
            alert("Fill empty fields");
        }
    },

    loadAddress: async function () {
        $('.container').hide();
        $('.footer').hide();
        $('.penalizeform').hide();

        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
            App.account = accounts[0];

            setTimeout(async function () {
                const acInstance = await App.contracts.AdminContract.deployed();
                const exists = await acInstance.checkProducer(App.account);
                if (!exists) {
                    alert("Please log in with a Producer account to access this page");
                } else {
                    const data = await acInstance.getProducerName(App.account);
                    $('.accountaddress').html("Welcome, " + data[0]);
                    $('.loader').hide();

                    if (data[1] == 0) {
                        $('.container').show();
                        $('.footer').show();
                        ProApp.render();
                    } else {
                        $('.penalizeform').show();
                        alert("You are penalized");
                    }
                }
            }, 500);
        }
    },

    render: async function () {
        const pInstance = await App.contracts.NodeContract.deployed();
        const pCount = await pInstance.getProductCount();
        const productList = $('#productList');
        productList.empty();

        for (let i = 0; i < pCount; i++) {
            const singleProduct = await pInstance.ProductList(i);
            if (App.account === singleProduct[0] && !singleProduct[5] && !singleProduct[6] && singleProduct[1] === "0x0000000000000000000000000000000000000000") {
                const id = i;
                const name = singleProduct[3];
                const type = singleProduct[4];
                const productTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + type + "</td></tr>";
                productList.append(productTemplate);
            }
        }

        const returnList = $('#returnedProductList');
        returnList.empty();
        let flag = false;

        for (let i = 0; i < pCount; i++) {
            const singleProduct = await pInstance.ProductList(i);
            if (App.account === singleProduct[0] && singleProduct[5] && singleProduct[6] && singleProduct[7] == 0) {
                if (!flag) {
                    returnList.empty();
                    $('#returnProductButton').show();
                    flag = true;
                }
                const id = i;
                const name = singleProduct[3];
                const type = singleProduct[4];
                const productTemplate = "<tr><td>" + id + "</td><td>" + name + "</td><td>" + type + "</td></tr>";
                returnList.append(productTemplate);
            }
        }
    },

    payPenalty: async function () {
        const acInstance = await App.contracts.AdminContract.deployed();
        const amount = await acInstance.getPenalizeAmount(App.account);
        await acInstance.payPenalizeAmount(App.account, {
            from: App.account,
            value: web3.utils.toWei(amount.toString(), 'ether') // Updated line
        });

        alert("Transaction Successful");
        $('.container').show();
        ProApp.render();
        $('.penalizeform').hide();
    }
};

$(document).ready(function () {
    ProApp.loadAddress();
});
