import getSigner from './getsigner.js'
import deploySafe from './deploySafe.js'

// const txServiceURL = 'https://safe-transaction.goerli.gnosis.io'
const signer = getSigner()
const deployerSafe = await deploySafe(signer, [signer.address], 1,)
const safeAddress = deployerSafe.getAddress()

console.log("Safe Address: ", safeAddress)
