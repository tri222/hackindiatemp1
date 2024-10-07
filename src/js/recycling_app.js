RecycApp = {
    loadAddress: async function () {
        $('.container').hide();
        const accounts = await web3.eth.getAccounts(); // Get accounts from the provider
        if (accounts.length > 0) {
            App.account = accounts[0];
            const acInstance = await App.contracts.AdminContract.deployed();
            const exists = await acInstance.checkRecycleUnit(App.account);

            if (!exists) {
                alert("Please log in with a Recycling Unit account to access this page");
            } else {
                const accountName = await acInstance.getRecycleUnitName(App.account);
                $('.accountaddress').html("Welcome, " + accountName);
                $('.loader').hide();
                $('.container').show();
            }
        }
    },

    addPercentage: async function () {
        const pInstance = await App.contracts.NodeContract.deployed();
        const productid = $('#productid').val();
        const weightglass = $('#weightglass').val();
        const weightplastic = $('#weightplastic').val();
        const weightnickel = $('#weightnickel').val();
        const weightaluminium = $('#weightaluminium').val();
        const weightcopper = $('#weightcopper').val();
        const weightmagnesium = $('#weightmagnesium').val();
        const weightlead = $('#weightlead').val();

        if (productid && weightglass && weightnickel && weightcopper && weightmagnesium && weightlead) {
            const count = await pInstance.getProductCount();
            if (productid > count) {
                alert("Enter Valid Product ID");
            } else {
                const singleProduct = await pInstance.ProductList(productid);
                if (singleProduct[7] != 0) {
                    alert("Product already recycled");
                } else if (!singleProduct[5] || !singleProduct[6]) {
                    alert("Enter Valid Product ID");
                } else {
                    const singleWeight = await pInstance.weights(productid);
                    if (parseInt(singleWeight[0]) < parseInt(weightglass)) {
                        alert("Reused weight of glass is greater than manufactured weight");
                    } else if (parseInt(singleWeight[1]) < parseInt(weightplastic)) {
                        alert("Reused weight of plastic is greater than manufactured weight");
                    } else if (parseInt(singleWeight[2]) < parseInt(weightnickel)) {
                        alert("Reused weight of nickel is greater than manufactured weight");
                    } else if (parseInt(singleWeight[3]) < parseInt(weightaluminium)) {
                        alert("Reused weight of aluminium is greater than manufactured weight");
                    } else if (parseInt(singleWeight[4]) < parseInt(weightcopper)) {
                        alert("Reused weight of copper is greater than manufactured weight");
                    } else if (parseInt(singleWeight[5]) < parseInt(weightmagnesium)) {
                        alert("Reused weight of magnesium is greater than manufactured weight");
                    } else if (parseInt(singleWeight[6]) < parseInt(weightlead)) {
                        alert("Reused weight of lead is greater than manufactured weight");
                    } else {
                        const totalweight = singleWeight.reduce((acc, weight) => acc + parseInt(weight), 0);
                        const totalReused = [weightglass, weightplastic, weightnickel, weightaluminium, weightcopper, weightmagnesium, weightlead]
                            .reduce((acc, weight) => acc + parseInt(weight), 0);

                        const reusedpercentage = Math.round((totalReused / totalweight) * 100);
                        const proceed = confirm("Press OK to continue");

                        if (proceed) {
                            const amount = await pInstance.getValue(productid, reusedpercentage);
                            const receipt = await pInstance.addPercentage(productid, reusedpercentage, {
                                from: App.account,
                                value: amount
                            });

                            if (receipt) {
                                alert("Transaction successful");
                            }
                        } else {
                            alert("User cancelled transaction");
                        }
                    }
                }
            }
        } else {
            alert("Fill Empty Fields");
        }
    }
};

$(document).ready(function () {
    $(window).on('load', function () {
        RecycApp.loadAddress();
    });
});
