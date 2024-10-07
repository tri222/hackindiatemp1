$(document).ready(function() {
    $('.container').hide();
    $('.footer').hide();
    
    setTimeout(function() {
        $('.loader').hide();
        $('.footer').show();
        $('.container').show();
        $('#accountAddress').val(App.account);
    }, 1000);
});

async function addUser() {
    const accountType = $('#accountType').val();
    
    if (!accountType) {
        alert("Please select an option");
        $('#accountType').focus();
        return;
    }

    switch (accountType) {
        case "Producer":
            await addProducer();
            break;
        case "Retailer":
            await addRetailer();
            break;
        case "Consumer":
            await addConsumer();
            break;
        case "RecyclingUnit":
            await addRecycleUnit();
            break;
        default:
            alert("There was an error completing the transaction");
    }
}

async function addProducer() {
    const name = $('#name').val();
    const acInstance = await App.contracts.AdminContract.deployed();
    
    const exists = await acInstance.checkProducer(App.account);
    if (!exists) {
        await acInstance.addProducer(App.account, name);
        alert("Producer added successfully");
    } else {
        alert("Producer is already associated with this account");
    }
}

async function addRetailer() {
    const name = $('#name').val();
    const acInstance = await App.contracts.AdminContract.deployed();
    
    const exists = await acInstance.checkRetailer(App.account);
    if (!exists) {
        await acInstance.addRetailer(App.account, name);
        alert("Retailer added successfully");
    } else {
        alert("Retailer is already associated with this account");
    }
}

async function addConsumer() {
    const name = $('#name').val();
    const acInstance = await App.contracts.AdminContract.deployed();
    
    const exists = await acInstance.checkConsumer(App.account);
    if (!exists) {
        await acInstance.addConsumer(App.account, name);
        alert("Consumer added successfully");
    } else {
        alert("Consumer is already associated with this account");
    }
}

async function addRecycleUnit() {
    const name = $('#name').val();
    const acInstance = await App.contracts.AdminContract.deployed();
    
    const exists = await acInstance.checkRecycleUnit(App.account);
    if (!exists) {
        await acInstance.addRecycleUnit(App.account, name);
        alert("Recycle Unit added successfully");
    } else {
        alert("Recycle Unit is already associated with this account");
    }
}
