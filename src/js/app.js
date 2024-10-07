App = {
    web3Provider: null,
    contracts: {},
    contractAddress: {
        AdminContract: '0x0',
        NodeContract: '0x0'
    },
    account: '0x0',

    init: function() {
        return App.initWeb3();
    },

    initWeb3: async function() {
        // Check for MetaMask
        if (typeof window.ethereum !== 'undefined') {
            App.web3Provider = window.ethereum;
            web3 = new Web3(App.web3Provider);

            // Request account access
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                console.log("MetaMask is connected");
            } catch (error) {
                console.error("User denied account access:", error);
            }
        } else {
            console.error('MetaMask is not installed. Please install it to use this application.');
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);
        }
        return App.initAccount();
    },

    initAccount: async function() {
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
            App.account = accounts[0];
            $('#loginAddress').html("Your account address: " + App.account);
            return App.initContract();
        } else {
            console.error("No accounts found");
        }
    },

    initContract: function() {
        var counter = 0;
        for (let contractName in App.contractAddress) {
            $.getJSON(contractName + '.json', function(result) {
                counter++;
                App.contracts[contractName] = TruffleContract(result);
                App.contracts[contractName].setProvider(App.web3Provider);
                return App.initAddresses(contractName, counter);
            });
        }
    },

    initAddresses: function(contractName, counter) {
        App.contracts[contractName].deployed()
            .then((i) => i.address)
            .then(function(address) {
                App.contractAddress[contractName] = address;
            });
    },

    // Call this when initializing contracts
    listenForEvents: function() {
        // Implement your event listeners here
    },

    makeTransaction: function(receiver, sender, amount) {
        amount = Number(amount);
        web3.eth.sendTransaction({
            to: receiver,
            from: sender,
            value: web3.utils.toWei(amount.toString(), 'ether') // Updated this line
        }).then(function(result) {
            console.log("Transaction successful:", result);
            return "success";
        }).catch(function(error) {
            console.error("Transaction failed:", error);
            return "failure";
        });
    }
};

$(function() {
    $(window).on('load', function() {
        App.init();
    });
});
