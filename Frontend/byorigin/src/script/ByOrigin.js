import web3 from './web3_'
import ByOriginAbi from '../abi/ByOrigin.json'




const instance = new web3.eth.Contract(ByOriginAbi.abi,'0xB4Fa01219D84496FFd9bD1bD2555D56DDe706CeC')  
// console.log(instance)

export default instance

