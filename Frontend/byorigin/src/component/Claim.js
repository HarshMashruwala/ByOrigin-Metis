import React, { useState, useEffect } from 'react'
import Base from './Base'
import { useParams } from 'react-router-dom'
import '../css/Claim.css'
import getInstance from '../script/PhysicalProduct'
import web3 from '../script/web3_'
import MetaMaskOnboarding from '@metamask/onboarding';


function Claim() {
    let { contractAddress, tokenId } = useParams()
    const [claimStatus, setClaimStatus] = useState(true)
    const [secretPassword, setSecretPasword] = useState('')
    const [secretPIN, setSecretPIN] = useState('')
    const [loading, setLoading] = useState(true)
    const [instance, setInstance] = useState(null)
    const [accounts, setAccounts] = useState('')
    const [productname, setproductname] = useState('')
    const [countryOfOrigin, setcountryOfOrigin] = useState('')
    const [color, setcolor] = useState('')
    const [companyName, setCompanyName] = useState('')
    const [modelno, setmodelno] = useState('')
    const [verificationStatus,setVerificationStatus] = useState(false)
    const [errorMessage,setErrorMessage] = useState('')
    const [imageUrl,setImageUrl] = useState('')
    const [email,setEmail] = useState('')

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
        setInstance(getInstance(contractAddress))
    }, [])

    useEffect(() => {
        if (instance !== null) {
            getClaimStatus()
        }

    }, [instance])

    const getClaimStatus = async () => {
        setClaimStatus(await instance.methods.getClaimStatus(tokenId).call())
        // console.log()
    }

    const claimProduct = async (event) => {

        event.preventDefault()
        setErrorMessage('')
        setLoading(false)
        const password = web3.utils.sha3(secretPassword)
        const pin = web3.utils.sha3(secretPIN.toString())
        // console.log('password', password)
        // console.log('pin', pin)
        try {
            const result = await instance.methods.claimProduct(tokenId, password, pin,email).send({
                from: accounts[0]
            })
            // console.log(result)
            window.location.reload()
        } catch (err) {
            setErrorMessage(err.message)
            // console.log(err)

        }
        setLoading(true)

    }

    const checkAuthenticity = async (event) => {
        event.preventDefault()
        setLoading(false)
        const pin = web3.utils.sha3(secretPIN)
        setErrorMessage('')
        try {
            const result = await instance.methods.checkAuthenticity(tokenId, pin).call()
            fetch(result).then(response => response.json()).then(metadata => {
                setCompanyName(metadata.CompanyName)
                setproductname(metadata.productName)
                setmodelno(metadata.modelno)
                setcountryOfOrigin(metadata.countryOfOrigin)
                setmodelno(metadata.modelNo)
                setcolor(metadata.color)
                setImageUrl(metadata.productImage)
            })
            setVerificationStatus(true)
            // console.log(await instance.methods.ownerOf(tokenId).call())
        } catch (err) {
            setErrorMessage(err.message)
            // console.log(err.message)
            
        }
        setLoading(true)

    }
    return (
        <Base>
            <div className="ClaimContainer">
                <h3 className="card-title m-2 text-center">Product Claim/View Portal</h3>
                <div className="container card shadow mb-5">
                    <div className="accordion accordion-flush mt-2" id="issuerFlush">
                        <div className="accordion-item" /*hidden={claimStatus}*/>
                            <h2 className="accordion-header" id="register-heading">
                                <button className="accordion-button fw-bold collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#register-collapse" aria-expanded="true" aria-controls="register-collapse">
                                    Claim your product
                                </button>
                            </h2>
                            <div id="register-collapse" className="accordion-collapse collapse" aria-labelledby="register-heading" data-bs-parent="#issuerFlush">
                                <div className="accordion-body">
                                    <form className="m-2" style={{ height: '100%' }} onSubmit={claimProduct}>
                                        <div className="mb-3">
                                            <label htmlFor="passwordInput" className="form-label">Secret Password</label>
                                            <input id="passwordInput" aria-describedby="passwordInputHelp" type='text'
                                                className="form-control"
                                                value={secretPassword}
                                                onChange={(event) => setSecretPasword(event.target.value)}
                                                required
                                            />
                                            <div id="passwordInputHelp" className="form-text">Last 4 Digit of your Serial Number
                                                e.g"Your Serial Number is "ABHV4859AAE" Your secret password is "9AAE" "</div>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="PINInput" className="form-label">Secret PIN</label>
                                            <input id="PINInput" aria-describedby="PINInputHelp" type='text'
                                                className="form-control"
                                                value={secretPIN}
                                                onChange={(event) => setSecretPIN(event.target.value)}
                                                required
                                            />
                                            <div id="PINInputHelp" className="form-text">Enter PIN shown in Product's QRCode </div>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="emailInput" className="form-label">Email</label>
                                            <input id="emailInput" aria-describedby="emailInputHelp" type='text'
                                                className="form-control"
                                                value={email}
                                                onChange={(event) => setEmail(event.target.value)}
                                                required
                                            />
                                            <div id="emailInputHelp" className="form-text">Enter your email </div>
                                        </div>
                                        <span className="text-danger" hidden={!errorMessage}>{errorMessage}</span>
                                        <div className="mb-3 d-flex" style={{ alignItems: 'center' }}>
                                            <button type="submit" className="btn btn-dark form-control" disabled={(!loading)}>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" hidden={loading}></span>
                                                Claim Product's NFT</button>
                                        </div>
                                        <div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div className="accordion-item mb-2" /*hidden={!claimStatus}*/>
                            <h2 className="accordion-header" id="create-heading">
                                <button className="accordion-button fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#create-collapse" aria-expanded="true" aria-controls="create-collapse">
                                    Check Authenticity Of Product
                                </button>
                            </h2>
                            <div id="create-collapse" className="accordion-collapse show mb-2" aria-labelledby="create-heading" data-bs-parent="#issuerFlush">
                                <div className="accordion-body">
                                    <form className="m-2" style={{ height: '100%' }} onSubmit={checkAuthenticity} hidden={verificationStatus}>
                                        <div className="mb-3">
                                            <label htmlFor="PINInput" className="form-label">Secrect PIN</label>
                                            <input id="PINInput" aria-describedby="PINInputHelp" type='text'
                                                className="form-control"
                                                value={secretPIN}
                                                onChange={(event) => setSecretPIN(event.target.value)}
                                                required
                                            />
                                            <div id="PINInputHelp" className="form-text">Enter PIN shown in Product's QRCode</div>
                                        </div>
                                        <span className="text-danger" hidden={!errorMessage}>{errorMessage}</span>
                                        <div className="mb-3 d-flex" style={{ alignItems: 'center' }}>
                                            <button type="submit" className="btn btn-dark form-control" disabled={(!loading)}>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" hidden={loading}></span>
                                                Check Authenticity</button>
                                        </div>
                                        <div>
                                        </div>
                                    </form>
                                    <div hidden={!verificationStatus}>
                                        <hr className="bg-danger border-2 border-top border-danger mb-3"></hr>
                                        <div className="row mb-3">
                                            <label htmlFor="productImage" className="form-label col-lg-4 fw-bold">Product Image</label>
                                            <div className="col-lg-6 col-sm-4">
                                                <span id="productImage" aria-describedby="productImageHelp" type='text' className="text-success fw-bold">
                                                    <img src={imageUrl} className='previewImage'/>
                                                    
                                                </span>
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label htmlFor="productname" className="form-label col-lg-4 fw-bold">Product Name</label>
                                            <div className="col-lg-6 col-sm-4">
                                                <span id="productname" aria-describedby="productnameHelp" type='text' >
                                                    {productname}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label htmlFor="modelno" className="form-label col-lg-4 fw-bold">Model Number</label>
                                            <div className="col-lg-6 col-sm-4">
                                                <span id="modelno" aria-describedby="modelnoHelp" type='text'>
                                                    {modelno}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label htmlFor="color" className="form-label col-lg-4 fw-bold">Colour</label>
                                            <div className="col-lg-6 col-sm-4">
                                                <span id="color" aria-describedby="colorHelp" type='text'>
                                                    {color}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label htmlFor="countryOfOrigin" className="form-label col-lg-4 fw-bold">Country Of Origin</label>
                                            <div className="col-lg-6 col-sm-4">
                                                <span id="countryOfOrigin" aria-describedby="countryOfOriginHelp" type='text'>
                                                    {countryOfOrigin}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label htmlFor="companyName" className="form-label col-lg-4 fw-bold">Company Name</label>
                                            <div className="col-lg-6 col-sm-4">
                                                <span id="companyName" aria-describedby="companyNameHelp" type='text'>
                                                    {companyName}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label htmlFor="issuerStatus" className="form-label col-lg-4 fw-bold">Authenticity</label>
                                            <div className="col-lg-6 col-sm-4">
                                                <span id="issuerStatus" aria-describedby="issuerStatusHelp" type='text' className="text-success fw-bold">
                                                    Verifyed by Product By Origin
                                                </span>
                                            </div>
                                        </div>
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

export default Claim