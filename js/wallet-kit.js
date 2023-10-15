import Web3 from 'web3'
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi'
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { bsc } from '@wagmi/core/chains'

import 'bootstrap/dist/js/bootstrap.bundle.min';

import { readContracts } from 'wagmi';
import { getAccount, readContract, writeContract, disconnect, watchAccount } from '@wagmi/core'

import featuredWallets from '../config/featured-wallets.js'
import includedWallets from '../config/included-wallets.js'

import ABI_WETH from '../abi/WETH.json'
import ABI_ERC20 from '../abi/ERC20.json'
import ABI_SWAP_ROUTER from '../abi/SWAP_ROUTER.json'

import CONTRACTS from '../config/contracts.js'

const MAX_INT_HEX =  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

const WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
const BUSD = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56';

// 1. Define constants
const projectName = import.meta.env.VITE_APPLICATION_NAME
const projectDescription = import.meta.env.VITE_APPLICATION_DESCRIPTION
const projectId = import.meta.env.VITE_APPLICATION_ID
const projectURL = import.meta.env.VITE_APPLICATION_URL

// 2. Create wagmiConfig

const chains = [bsc]
const optionalChains = []
const showQrModal = true
const methods = ['eth_sendTransaction', 'eth_accounts']
const optionalMethods = []
const events = []
const optionalEvents = []
const rpcMap = {}
const metadata = {
  name: projectName,
  description: projectDescription,
  url: projectURL,
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}
const qrModalOptions = {}

const termsOfServiceLink = import.meta.env.TERMS_OF_SERVICE_LINK != "" ? import.meta.env.TERMS_OF_SERVICE_LINK : ""
const privacyPolicyLink = import.meta.env.PRIVACY_POLICY_LINK != "" ? import.meta.env.PRIVACY_POLICY_LINK : ""

const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

// 3. Create modal

const web3Modal = createWeb3Modal({
    wagmiConfig, 
    projectId, 
    chains, 
    featuredWalletIds: featuredWallets,
    includeWalletIds: includedWallets,
    termsConditionsUrl: termsOfServiceLink,
    privacyPolicyUrl: privacyPolicyLink
})

// 4. Create provider

const provider = await EthereumProvider.init({
    projectId, 
    chains, 
    optionalChains, 
    showQrModal, 
    methods, 
    optionalMethods, 
    events, 
    optionalEvents, 
    rpcMap, 
    metadata, 
    qrModalOptions
});

// 5. Connect provider

const web3js = new Web3(provider)

// Use wagmi to get account

const account = getAccount({ web3js, web3Modal })
console.log(account)

// MAIN LOOP //

async function getTokenData() {

    const name = await readContract({ address: WBNB, abi: ABI_ERC20, functionName: 'name' })
    const totalSupply = await readContract({ address: WBNB, abi: ABI_ERC20, functionName: 'totalSupply' })
    const decimals = await readContract({ address: WBNB, abi: ABI_ERC20, functionName: 'decimals' })

    // 7. console log it all
    console.log('name', name)
    console.log('totalSupply', totalSupply)

    // make the element of id 'token-name' display the token name
    document.querySelector('#main-token-name').innerText = name
    document.querySelector('#main-token-supply').innerText = totalSupply
    document.querySelector('#main-token-decimals').innerText = decimals
}

await getTokenData();

// BUTTON LISTENERS //

document.querySelector('#transfer-main-btn').onclick = transferMainTx;

// Transfer MAIN //

async function transferMainTx() {
    const to = document.querySelector('#transfer-main-recipient').value
    const value = document.querySelector('#transfer-main-amount').value

    const decimals = await readContract({ abi: ABI_ERC20, address: WBNB, functionName: 'decimals' })

    const amount = value * 10 ** decimals;

    const tx = await writeContract({
        abi: ABI_ERC20, 
        address: WBNB, 
        functionName: 'transfer', 
        args: [to, amount], value: 0 })
    console.log('tx', tx)
}