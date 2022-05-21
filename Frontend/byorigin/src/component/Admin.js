import React, { useState, useEffect } from 'react'
import Base from './Base'
import '../css/Admin.css'
import ByOrigin from '../script/ByOrigin'
import MetaMaskOnboarding from '@metamask/onboarding';
import { create } from 'ipfs-http-client'
import { Link } from 'react-router-dom'
import PendingRow from './PendingRow';
import ApprovedRow  from './ApprovedRow';



const ipfsClient = create('https://ipfs.infura.io:5001/api/v0')
const ipfsBaseURL = 'https://ipfs.infura.io/ipfs/'



function Admin() {
    const [accounts, setAccounts] = useState('');
    const [approvedArray, setApprovedArray] = useState([]);
    const [pendingArray, setPendingArray] = useState([])
    const [array,setArray] = useState([])
    const [appArray,setAppArray] = useState([])
    const [errorMessage,setErrorMessage] = useState('')
    

    useEffect(async () => {
        function handleNewAccounts(newAccounts) {
            setAccounts(newAccounts);
        }
        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            await window.ethereum
                .request({ method: 'eth_requestAccounts' })
                .then(handleNewAccounts);
            await window.ethereum.on('accountsChanged', handleNewAccounts);
            return async () => {
                await window.ethereum.off('accountsChanged', handleNewAccounts);
            };
        }
    }, []);



    useEffect(() => {
        async function getarray() {
            var issuerRequestArray = []
            // console.log(await ByOrigin.methods.issuerRequestCount().call())
            const issuerRequestCount = await ByOrigin.methods.issuerRequestCount().call();
            for (var i = 0; i < issuerRequestCount; i++) {
                const issuerRequestResult = await ByOrigin.methods.issuerRequest(i).call();
                const obj = {
                    issuerArray: issuerRequestResult,
                    index: i
                }
                issuerRequestArray.push(obj)
            }
            const getAppovedRequest = issuerRequestArray.filter(i => {
                return i['issuerArray'].approval === true
            })
            setApprovedArray(getAppovedRequest)
        }
        getarray()
    }, [])

    useEffect(()=>{
        pendingArray.forEach(i => {
            fetch(ipfsBaseURL+i['issuerArray'].issuerCID).then(response => response.json()).then(metadata => {
                
                setArray(prevstate=>[
                    ...prevstate,
                    {
                        issuerIndex:i["index"],
                        companyName : metadata["Company Name"],
                        companyCIN : metadata["Company CIN"],
                        companyPAN : metadata["Company PAN"]
                    }
                ])
            })
        });
    },[pendingArray])

    useEffect(()=>{
        approvedArray.forEach(i => {
            fetch(ipfsBaseURL+i['issuerArray'].issuerCID).then(response => response.json()).then(metadata => {
                
                setAppArray(prevstate=>[
                    ...prevstate,
                    {
                        issuerIndex:i["index"],
                        companyName : metadata["Company Name"],
                        companyCIN : metadata["Company CIN"],
                        companyPAN : metadata["Company PAN"]
                    }
                ])
            })
        });
    },[approvedArray])

    useEffect(() => {
        async function getarray() {
            var issuerRequestArray = []
            const issuerRequestCount = await ByOrigin.methods.issuerRequestCount().call()
            for (var i = 0; i < issuerRequestCount; i++) {
                const issuerRequestResult = await ByOrigin.methods.issuerRequest(i).call()
                let obj = {
                    issuerArray: issuerRequestResult,
                    index: i
                }
                issuerRequestArray.push(obj)
            }
            const getPendingRequest = issuerRequestArray.filter(i => {
                return i['issuerArray'].approval === false
            })
            if (getPendingRequest.length > 0) {

                setPendingArray(getPendingRequest)
            }

            
        }
        getarray()
        
    }, [])

    function Approv() {

        // console.log(approvedArray)

        if (approvedArray.length > 0) {
            return (
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">Id</th>
                            <th scope="col">Company Name</th>
                            <th scope="col">Company CIN</th>
                            <th scope="col">Company PAN</th>
                            <th scope="col">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <RenderApprovedRow/>
                    </tbody>
                </table>
            )
        } else {
            return (
                <div>
                    <span className="text-danger fw-bold">Opps!!!! Didn't find any approved request.</span>
                </div>
            )
        }


    }

    function RenderApprovedRow(){
        return (appArray.map((i, index) => {
            return (
               <ApprovedRow
                    key = {index} 
                    id = {i["issuerIndex"]+1}
                    issuerIndex = {i["issuerIndex"]}
                    companyName = {i["companyName"]}
                    companyCIN = {i["companyCIN"]}
                    companyPAN = {i["companyPAN"]}
               /> 
            )
            }))
    }




    function RenderPendingRow(){
        return (array.map((i, index) => {
            return (
               <PendingRow
                    key = {index} 
                    id = {i["issuerIndex"]+1}
                    issuerIndex = {i["issuerIndex"]}
                    companyName = {i["companyName"]}
                    companyCIN = {i["companyCIN"]}
                    companyPAN = {i["companyPAN"]}
                    accounts = {accounts[0]}
               /> 
            )
            }))
    }
    
    function Pending(){
        if (pendingArray.length > 0) {
            return (
                <table className="table">
                <thead>
                    <tr>
                        <th scope="col">Id</th>
                        <th scope="col">Company Name</th>
                        <th scope="col">Company CIN</th>
                        <th scope="col">Company PAN</th>
                        <th scope="col">Status</th>
                        <th scope="col">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <RenderPendingRow />
                </tbody>
            </table>
            )

        }else{
            return (
                <div>
                    <span className="text-danger fw-bold">Opps!!!! Didn't find any Pending request.</span>
                </div>
            )
        }
    }


    return (
        <Base>
            <div className="AdminContainer">
                <h3 className="card-title m-2 text-center">Admin Portal</h3>
                <div className="container card shadow">
                    <div className="accordion accordion-flush mt-2" id="adminFlush">
                        <div className="accordion-item">
                            <h2 className="accordion-header" id="pending-heading">
                                <button className={`accordion-button  fw-bold`} type="button" data-bs-toggle="collapse" data-bs-target="#pending-collapse" aria-expanded="true" aria-controls="pending-collapse">
                                    Pending Request
                                </button>
                            </h2>
                            <div id="pending-collapse" className={`accordion-collapse show`} aria-labelledby="pending-heading" data-bs-parent="#adminFlush">
                                <div className="accordion-body">
                                    <Pending />
                                </div>
                            </div>
                        </div>
                        <div className="accordion-item">
                            <h2 className="accordion-header" id="approve-heading">
                                <button className={`accordion-button collapsed fw-bold`} type="button" data-bs-toggle="collapse" data-bs-target="#approve-collapse" aria-expanded="false" aria-controls="approve-collapse">
                                    Approved Request
                                </button>
                            </h2>
                            <div id="approve-collapse" className={`accordion-collapse collapse`} aria-labelledby="approve-heading" data-bs-parent="#adminFlush">
                                <div className="accordion-body">
                                    <Approv />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </Base>
    )
}

export default Admin