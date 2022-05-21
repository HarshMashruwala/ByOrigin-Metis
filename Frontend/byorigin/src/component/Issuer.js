import React, { useState, useEffect } from 'react'
import Base from './Base'
import '../css/Issuer.css'
import ByOrigin from '../script/ByOrigin'
import MetaMaskOnboarding from '@metamask/onboarding';
import { create } from 'ipfs-http-client'
import { Link } from 'react-router-dom'
import web3 from '../script/web3_';


const ipfsClient = create('https://ipfs.infura.io:5001/api/v0')
const ipfsBaseURL = 'https://ipfs.infura.io/ipfs/'


function Issuer() {
    const [companyName, setCompanyName] = useState('');
    const [companyCIN, setCompanyCIN] = useState('');
    const [companyPAN, setCompanyPAN] = useState('');
    const [errorMessage,setErrorMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [registerStatus, setRegisterStatus] = useState(false)
    const [accounts, setAccounts] = useState('');
    const [issuerIndex, setIssuerIndex] = useState(0);
    const [issuerApproval, setIssuerApproval] = useState('');


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
        async function getStatus() {
            const status = await ByOrigin.methods.issuerAddress(accounts[0]).call()
            setRegisterStatus(status)

        }
        if (accounts.length > 0) {
            getStatus()
        }

    }, [accounts])

    useEffect(() => {
        if (accounts.length > 0) {
            getCompanyData()
        }

    }, [accounts])

    async function getCompanyData() {
        setErrorMessage('')
        // console.log(ByOrigin)
        try {
            var issuerRequestArray = []
            const issuerRequestCount = await ByOrigin.methods.issuerRequestCount().call()
            
            for (var i = 0; i < issuerRequestCount; i++) {
                const issuerRequestResult = await ByOrigin.methods.issuerRequest(i).call()
                const obj = {
                    issuerArray: issuerRequestResult,
                    index: i
                }
                issuerRequestArray.push(obj)
            }
            const selectedData = issuerRequestArray.filter(i => {
                return i['issuerArray'].issuerAddress.toLowerCase() === accounts[0]
            })
            if(selectedData.length > 0){
                fetch(ipfsBaseURL + selectedData[0]['issuerArray'].issuerCID).then(response => response.json()).then(metadata => {
                    setCompanyName(metadata["Company Name"])
                    setCompanyCIN(metadata["Company CIN"])
                    setCompanyPAN(metadata["Company PAN"])
                    setIssuerIndex(selectedData[0]['index'])
                    if (selectedData[0]['issuerArray'].approval) {
                        setIssuerApproval('Approved')
                    } else {
                        setIssuerApproval('Pending')
                    }
    
                })
            } else {
                setCompanyName('')
                setCompanyCIN('')
                setCompanyPAN('')
                setIssuerApproval('')
            }
            

        } catch (err) {
            // console.log(err)
            setErrorMessage(err.message)
        }
    }

    const onSubmit = async (event) => {
        event.preventDefault()
        setLoading(false)
        setErrorMessage('')
        const companyDetail = {
            'Company Name': companyName,
            'Company CIN': companyCIN,
            'Company PAN': companyPAN
        }
        try {
            const metaData = await ipfsClient.add(JSON.stringify(companyDetail))
            // console.log(metaData.path)

            const result = await ByOrigin.methods.applyForRequest(metaData.path.toString()).send({ from: accounts[0] })
            // console.log(result)
            window.location.reload()
        } catch (err) {
            setErrorMessage(err.message)
            // console.log(err)
        }
        setLoading(true)

    }


    return (
        <Base>
            <div className="IssuerContainer">
                <h3 className="card-title m-2 text-center">Company Registration Portal</h3>
                <div className="container card shadow">
                    <div className="accordion accordion-flush mt-2" id="issuerFlush">
                        <div className="accordion-item">
                            <h2 className="accordion-header" id="register-heading">
                                <button className={`accordion-button ${!registerStatus?'':'collapsed'} fw-bold`} type="button" data-bs-toggle="collapse" data-bs-target="#register-collapse" aria-expanded={!{registerStatus}} aria-controls="register-collapse">
                                    Register as an Issuer
                                </button>
                            </h2>
                            <div id="register-collapse" className={`accordion-collapse ${!registerStatus?'show':'collapse'}`} aria-labelledby="register-heading" data-bs-parent="#issuerFlush">
                                <div className="accordion-body">
                                    <p>Fill the below form and register as a Company Issuer.
                                        After completing your KYC process, Admin will approve your request.
                                        After that you will be part of our new revolution.
                                    </p>
                                    <form className="m-2" style={{ height: '100%' }} onSubmit={onSubmit}>
                                        <div className="mb-3">
                                            <label htmlFor="nameInput" className="form-label">Company Name</label>
                                            <input id="nameInput" aria-describedby="nameHelp" type='text'
                                                className="form-control"
                                                value={companyName}
                                                onChange={(event) => setCompanyName(event.target.value)}
                                                required
                                                readOnly={registerStatus}
                                            />
                                            <div id="nameHelp" className="form-text">e.g."Your company name."</div>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="CINInput" className="form-label">Company CIN</label>
                                            <input id="CINInput" aria-describedby="CINHelp" type='text'
                                                className="form-control"
                                                value={companyCIN}
                                                onChange={(event) => setCompanyCIN(event.target.value)}
                                                required
                                                readOnly={registerStatus}
                                            />
                                            <div id="CINHelp" className="form-text">e.g."Your company CIN(Certificate of incorporation)."</div>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="PANInput" className="form-label">Company PAN</label>
                                            <input id="PANInput" aria-describedby="PANHelp" type='text'
                                                className="form-control"
                                                value={companyPAN}
                                                required
                                                onChange={(event) => setCompanyPAN(event.target.value)}
                                                readOnly={registerStatus}
                                            />
                                            <div id="PANHelp" className="form-text">e.g."Your company PAN Number."</div>
                                        </div>
                                        <span className="text-danger" hidden={!errorMessage}>{errorMessage}</span>
                                        <div className="mb-3 d-flex" style={{ alignItems: 'center' }}>
                                            <button type="submit" className="btn btn-dark form-control" disabled={(!loading) || (registerStatus)}>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" hidden={loading}></span>
                                                Register</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        {/* <div className="accordion-item">
                            <h2 className="accordion-header" id="create-heading">
                                <button className="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#create-collapse" aria-expanded="false" aria-controls="create-collapse">
                                    Create New Request
                                </button>
                            </h2>
                            <div id="create-collapse" className="accordion-collapse collapse" aria-labelledby="create-heading" data-bs-parent="#issuerFlush">
                                <div className="accordion-body">Placeholder content for this accordion, which is intended to demonstrate the <code>.accordion-flush</code> className. This is the second item's accordion body. Let's imagine this being filled with some actual content.</div>
                            </div>
                        </div> */}
                        <div className="accordion-item">
                            <h2 className="accordion-header" id="pending-heading">
                                <button className={`accordion-button ${registerStatus?'':'collapsed'} fw-bold`} type="button" data-bs-toggle="collapse" data-bs-target="#pending-collapse" aria-expanded={registerStatus} aria-controls="pending-collapse">
                                    Request Status
                                </button>
                            </h2>
                            <div id="pending-collapse" className={`accordion-collapse ${registerStatus?'show':'collapse'}`} aria-labelledby="pending-heading" data-bs-parent="#issuerFlush">
                                <div className="accordion-body">
                                    <div className="row mb-3">
                                        <label htmlFor="Company" className="col-lg-4 col-form-label">Company Name</label>
                                        <div className="col-auto">
                                            <span id="Company" className="form-control fw-bold" style={{ border: "hidden" }}
                                            >{companyName}</span>
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label htmlFor="approval" className=" col-lg-4 col-form-label">Request Approval</label>
                                        <div className='col-auto'>
                                            <span id="approval"
                                                className="form-control fw-bold" style={{ border: "hidden" }} >{issuerApproval}</span>
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                    <Link to={`/createContract/${issuerIndex}`} className={(issuerApproval === "Pending") || (issuerApproval === '')?"btn btn-dark form-control disabled":"btn btn-dark form-control"} aria-disabled={issuerApproval === "Pending"?true:false}>
                                    Generate Product's NFT
                                    </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Base>
    )
}

export default Issuer