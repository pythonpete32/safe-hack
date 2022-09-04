import { ethers } from 'ethers'
import * as dotenv from 'dotenv'

dotenv.config()

const getSigner = () => {
  const provider = new ethers.getDefaultProvider(process.env.GOERLI_RPC_URL)
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
  return signer
}
export default getSigner
