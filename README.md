DEBUG=grid-bot-web:* npm start
liquidjs-lib
"wallycore": "^0.9.0"


const fs = require('fs');
const liquidJs = require('liquidjs-lib');

(async () => {
    const wally = (await import('wallycore')).default;

    let tx = wally.tx_from_hex('020000000100000000000000000000000000000000000000000000000000000000000000000000000000fdffffff0101000000000000000000000000', 0)
    console.log(wally.tx_get_txid(tx).toString('hex'))
    wally.tx_free(tx)

    
    tx = wally.tx_from_hex("020000000001012f94ddd965758445be2dfac132c5e75c517edf5ea04b745a953d0bc04c32829901000000006aedc98002a8c500000000000022002009246bbe3beb48cf1f6f2954f90d648eb04d68570b797e104fead9e6c3c87fd40544020000000000160014c221cdfc1b867d82f19d761d4e09f3b6216d8a8304004830450221008aaa56e4f0efa1f7b7ed690944ac1b59f046a59306fcd1d09924936bd500046d02202b22e13a2ad7e16a0390d726c56dfc9f07647f7abcfac651e35e5dc9d830fc8a01483045022100e096ad0acdc9e8261d1cdad973f7f234ee84a6ee68e0b89ff0c1370896e63fe102202ec36d7554d1feac8bc297279f89830da98953664b73d38767e81ee0763b9988014752210390134e68561872313ba59e56700732483f4a43c2de24559cb8c7039f25f7faf821039eb59b267a78f1020f27a83dc5e3b1e4157e4a517774040a196e9f43f08ad17d52ae89a3b720", 0)
    console.log(wally.tx_get_txid(tx).toString('hex'))
    wally.tx_free(tx)
    
    const rawTx = fs.readFileSync('./transaction.hex', 'utf8');
    //console.log(rawTx);
    const rawBytes = Buffer.from(rawTx, "hex");
    console.log(rawBytes)
    tx = wally.tx_from_bytes(rawBytes, wally.WALLY_TX_FLAG_USE_ELEMENTS);
    console.log(wally.hex_from_bytes(wally.tx_get_txid(tx)))
    console.log(wally.hex_from_bytes(wally.tx_get_txid(tx)))
    for(let i=0;i< wally.tx_get_num_outputs(tx); i++) {
        console.log(i)
        asset = wally.tx_get_output_asset(tx, i)
        console.log("Blinded asset:", wally.hex_from_bytes(asset))
        script = wally.tx_get_output_script(tx, i)
        try {
            t = wally.scriptpubkey_get_type(script)
            console.log("Type:", t)
            try {
                address = wally.scriptpubkey_to_address(script, wally.WALLY_NETWORK_LIQUID)
            } catch (ex) {}
            address2 = liquidJs.address.fromOutputScript(script);
            console.log("Address: ", address)    
            console.log("Address2: ", address2)    
        }catch(ex){}
    }
})();


