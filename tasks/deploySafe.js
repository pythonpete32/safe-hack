import { ethers } from 'ethers'
import EthersAdapter from '@gnosis.pm/safe-ethers-lib'
import { SafeFactory } from '@gnosis.pm/safe-core-sdk'


const deploySafe = async (signer, owners, threshold) => {
  const ethAdapter = new EthersAdapter['default']({ ethers, signer })
  const safeFactory = await SafeFactory.create({ ethAdapter })

  const safeSdk = await safeFactory.deploySafe({ safeAccountConfig: { owners, threshold } })
  return safeSdk
}
export default deploySafe
