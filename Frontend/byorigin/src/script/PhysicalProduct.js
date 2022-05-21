import web3 from './web3_'
import physicalProductAbi from '../abi/physicalProduct.json'

function getInstance(address) {
    const instance = new web3.eth.Contract(physicalProductAbi.abi,address)
    return instance
}

   


export default getInstance