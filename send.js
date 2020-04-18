const StellarSdk = require('stellar-sdk')
require('dotenv').config()

const sourceSecretKey = process.env.SECRET;

const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecretKey);
const sourcePublicKey = sourceKeypair.publicKey();
const mudley = new StellarSdk.Asset('MUDLEY', 'GBEPESVMNKFMJFMC55QUSB45EIWTFMNOJLTQ57TNZBOK5UXUNIW3Y2EQ')


//const server = new StellarSdk.Server('https://horizon-testnet.stellar.org'); //TESTNET
const server = new StellarSdk.Server('https://horizon.stellar.org'); //MAINNET

const XLSX            = require('xlsx')
const workbook        = XLSX.readFile('sendmudley.xlsx') // Read excel file name
const sheet_name_list = workbook.SheetNames
var wallet_json       = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]])
var txID                  = ''
var txBlob                = ''
var total_wallet          = 0
var sending_wallet        = 0


async function test(address, amountId ) {
  
  const account = await server.loadAccount(sourcePublicKey);


  const fee = await server.fetchBaseFee();


  const transaction = new StellarSdk.TransactionBuilder(account, { 
      fee,
      networkPassphrase: StellarSdk.Networks.PUBLIC
    })
    .addOperation(StellarSdk.Operation.payment({
      destination: address,
      asset: mudley,
      amount: JSON.stringify(amountId),
    }))
    .setTimeout(30)
    .build()

  transaction.sign(sourceKeypair)

  console.log(transaction.toEnvelope().toXDR('base64'));

  try {
    const transactionResult = await server.submitTransaction(transaction);
 //   console.log(JSON.stringify(transactionResult, null, 2));
    console.log('\nSuccess! View the transaction at: ');
    console.log(transactionResult._links.transaction.href);

  } catch (e) {
    console.log('An error has occured:');
    console.log(e);
  }
  console.log('\n----------------------------------------------------------------------------------');

}


async function sendMUDLEY() {
    let wallet = wallet_json[sending_wallet]
    let address = wallet.address
    let amountId  = wallet.amount
//    let tag  = wallet.tag

    txJSON = await test(address, amountId)
//    txBlob = await sign()
//    earliestLedgerVersion = await doSubmit(txBlob)
    sending_wallet++

    if (sending_wallet < total_wallet) sendMUDLEY()



}


async function main() {

    total_wallet = wallet_json.length
    if (total_wallet > 0) sendMUDLEY()


}

setTimeout(main, 4000)
