let models = require('../models');
let validator = require('validator');
const liquidJs = require('liquidjs-lib');
const _ = require('lodash');

const validateCreateBroadcastTransactionFields = function(errors, req){
    let validatedData = {};
    console.log("Length: ", req.body.transaction.length);
    if (!validator.isLength(req.body.transaction, {min: 1, max: 65535})){
        errors["transaction"] = `Transaction length is not valid (1 < ${req.body.transaction.length} <65535)`;
    } else {
        // const rawBytes = Buffer.from(req.body.transaction, "hex");
        try {
            const tx = liquidJs.Transaction.fromHex(req.body.transaction);
            let addresses = [];
            _.forEach(tx.outs, out => {
                try{
                addresses.push(liquidJs.address.fromOutputScript(out.script));
                } catch (ex){}
            });

            if (!addresses || addresses.length == 0) {
                errors['transaction'] = "No output addresses found";
            } else {
                validatedData.addresses = addresses;
                validatedData.hash = tx.getHash().toString('hex');
            }
        } catch (ex) {
            errors["transaction"] = "This doesn't look like a valid transaction:" + ex.message;
            console.error("Error:", ex);
        }
    }

    return validatedData;
}

exports.validateBroadcastTransaction = function(errors, req) {
    return new Promise(function(resolve, reject){
        let validatedData = validateCreateBroadcastTransactionFields(errors, req);
        if (validatedData.addresses &&  validatedData.addresses.length > 0) {
            models.AccountAddress.findOne({
                where: {
                    account_id: req.params.account_id,
                    address: validatedData.addresses
                }
            }).then(address => {
                if (address == null) {
                    errors['transaction'] = "Couldn't find any of these addresses in account valid addresses: "+validatedData.addresses.join(', ');
                }
                resolve({errors, validatedData});
            })
        } else {
            resolve({errors, validatedData});
        }
    });
    
}