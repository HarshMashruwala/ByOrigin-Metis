import React, { useEffect, useState, createRef, useRef } from "react";
import Base from "./Base";
import { useParams } from 'react-router-dom'
import ByOrigin from '../script/ByOrigin'
import MetaMaskOnboarding from '@metamask/onboarding';
import '../css/CreateContract.css'
import getInstance from '../script/PhysicalProduct'
import web3 from "../script/web3_";
import { create } from 'ipfs-http-client'
import QRCode from 'qrcode'
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib'

const ipfsClient = create('https://ipfs.infura.io:5001/api/v0')
const ipfsBaseURL = 'https://ipfs.infura.io/ipfs/'


function CreateContract() {
    let { index } = useParams()
    const [contractStatus, setContractStatus] = useState(false);
    const [accounts, setAccounts] = useState('')
    const [productType, setproductType] = useState('Physical');
    const [loading, setLoading] = useState(true)
    const [contractName, setContractName] = useState('')
    const [contractList, setContractList] = useState([])
    const [selectedContract, setSelectedContract] = useState('')
    const [productname, setproductname] = useState('')
    const [modelno, setmodelno] = useState('')
    const [uniqID, setUniqID] = useState('')
    const [uniqPassword, setUniqPassword] = useState('')
    const [pin, setPin] = useState('')
    const [countryOfOrigin,setcountryOfOrigin] = useState('')
    const [color,setcolor] = useState('')
    const uploadImage = createRef();
    const [formVisibility, setFormVisibility] = useState(true)
    const [pdfData, setPdfData] = useState(null)
    const [companyName, setCompanyName] = useState('');
    const [companyCIN, setCompanyCIN] = useState('');
    const [companyPAN, setCompanyPAN] = useState('');
    const [fee, setFee] = useState(0.02)
    const [fileName, setFileName] = useState('');
    const [uploadStatus, setUploadStatus] = useState(true)
    const [errorMessage,setErrorMessage] = useState('')
    const [imageUrl,setimageUrl] = useState('')
    const canvas_ = useRef(null);
    const contextRef = useRef(null);




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

        async function getOwnerContractStatus() {
            // console.log(accounts[0])
            const result = await ByOrigin.methods.getOwnerContract(accounts[0]).call()
            if (result.length > 0) {
                setContractStatus(true)
                result.forEach(i => {
                    setContractList(prevstate => [
                        ...prevstate,
                        {
                            contractName: i.contractName,
                            contractType: i.contractType,
                            contractaddress: i.contractaddress,
                            requestIndex: i.requestIndex
                        }
                    ])
                })

            }

        }
        if (accounts.length > 0) {
            getOwnerContractStatus()
        }

    }, [accounts])

    useEffect(() => {
        // console.log(contractList)
    }, [contractList])

    function Options(props) {
        return (
            <option value={props.value}>{props.name}</option>
        )
    }

    function SelectOption() {
        return (contractList.map((i, index) => {
            return (
                <Options
                    key={index}
                    value={i.contractaddress}
                    name={i.contractName + '-' + i.contractaddress}
                />
            )
        }))

    }

    const selectionOnChange = async (event) => {
        event.preventDefault()
        setSelectedContract(event.target.value)
        if (event.target.value !== "Select Contract") {
            const address = event.target.value
            const instance = getInstance(address)
            setFormVisibility(false)
            // console.log(await instance.methods.getSecretPin().call())
        } else {
            setFormVisibility(true)
        }

    }

    const onSubmit = async (event) => {
        setErrorMessage('')
        event.preventDefault()
        setLoading(false)
        try {
            const result = await ByOrigin.methods.createNewContract(index, productType, contractName).send({
                from: accounts[0]
            })
            // console.log(result)

        } catch (err) {
            // console.log(err)
            setErrorMessage(err.message)
        }
        setLoading(true)
        window.location.reload()
    }

    useEffect(() => {
        if (accounts.length > 0) {
            getCompanyData()
        }

    }, [accounts])

    async function getCompanyData() {
        setErrorMessage('')
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
            if (selectedData.length > 0) {
                fetch(ipfsBaseURL + selectedData[0]['issuerArray'].issuerCID).then(response => response.json()).then(metadata => {
                    setCompanyName(metadata["Company Name"])
                    setCompanyCIN(metadata["Company CIN"])
                    setCompanyPAN(metadata["Company PAN"])

                })
            } else {
                setCompanyName('')
                setCompanyCIN('')
                setCompanyPAN('')
            }


        } catch (err) {
            // console.log(err)
            setErrorMessage(err.message)
        }
    }


    const onClickUpload = async (event) => {
        event.preventDefault()
        try {
            const added = await ipfsClient.add(uploadImage.current.files[0])
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            // console.log(url)
            setimageUrl(url)
            setFileName(productname+"-"+uniqID)
            
            setUploadStatus(false)
          } catch (error) {
            console.log('Error uploading file: ', error)
          }
        
    }
    const createSecretPass = () => {
        const last4Digit = uniqID.substring((uniqID.length) - 4, uniqID.length)
        const password = last4Digit
        setUniqPassword(web3.utils.sha3(password))
        // console.log(password)
        
        // console.log(web3.utils.sha3(password))
        return web3.utils.sha3(password)
    }

    const createSecrectPin = async (randomNum) => {
        // const instance = getInstance(selectedContract)
        // let randomNum = await instance.methods.getSecretPin().call()
        // console.log(randomNum)
        randomNum = (randomNum).toString()
        if (randomNum.length === 1) {
            randomNum = '000' + randomNum
        } else if (randomNum.length === 2) {
            randomNum = '00' + randomNum
        } else if (randomNum.length === 3) {
            randomNum = '0' + randomNum
        }
        // console.log('random', randomNum)
        setPin(randomNum)
        return randomNum
    }

    const uploadDataToIPFS = async () => {
        setErrorMessage('')
        const productDetails = {
            'productImage':imageUrl,
            'productName': productname,
            'modelNo': modelno,
            'serialNo': uniqID,
            'color': color,
            'countryOfOrigin':countryOfOrigin,
            'CompanyName': companyName,
            'CompanyCIN': companyCIN,
            'CompanyPAN': companyPAN
        }
        try {
            const metaData = await ipfsClient.add(JSON.stringify(productDetails))
            // console.log(metaData.path)
            return (metaData.path)
        } catch (err) {
            // console.log(err)
            setErrorMessage(err.message)
            return ('')
        }
    }

    const onSubmitGenerate = async (event) => {
        setErrorMessage('')
        event.preventDefault()
        setLoading(false)
        const secretPasswordHash = createSecretPass()
        const instance = getInstance(selectedContract)
        const randNum = await createSecrectPin(Math.floor((Math.random() * 10000) + 1))
        const secretPinHash = web3.utils.sha3(randNum.toString())
        const metaDataCID = await uploadDataToIPFS()
        const tokenURI = ipfsBaseURL + metaDataCID
        const feeWei = web3.utils.toWei(fee.toString(), 'ether')
        // console.log(feeWei)
        try {
            const tokenID = await instance.methods.mint(secretPasswordHash, secretPinHash, tokenURI).send({
                value: feeWei,
                from: accounts[0]
            })
            
            const Id =tokenID.events.Transfer.returnValues.tokenId
            const hostName = window.location.host
            const claimURL = 'https://' + hostName + '/claim/' + selectedContract + '/' + Id
            // console.log(claimURL)
            QRCode.toCanvas(canvas_.current,claimURL,function(err){
                if (err) console.error(err)
                // console.log('success!');
                const canvas = canvas_.current
                const context = canvas.getContext('2d')
                contextRef.current = context
                context.font = "14pt Calibri";
                context.fillStyle = "black";
                context.textAlign = "center"
                context.fillText("PIN - "+randNum+"",canvas.width/2,canvas.height);
                let a = document.createElement('a');
                a.href = canvas.toDataURL();
                a.download = fileName;
                a.click();
                
            })
            setUploadStatus(true)

        } catch (err) {
            // console.log(err)
            setErrorMessage(err.message)
        }



        setLoading(true)
        

    }

    return (
        <Base>
            <div className="CreateContractContainer">
                <h3 className="card-title m-2 text-center">Product's NFT Generator Portal</h3>
                <div className="container card shadow">
                    <div className="accordion accordion-flush mt-2" id="issuerFlush">
                        <div className="accordion-item">
                            <h2 className="accordion-header" id="register-heading">
                                <button className={`accordion-button ${!contractStatus ? '' : 'collapsed'} fw-bold`} type="button" data-bs-toggle="collapse" data-bs-target="#register-collapse" aria-expanded={!{ contractStatus }} aria-controls="register-collapse">
                                    Create Product's NFT Contract
                                </button>
                            </h2>
                            <div id="register-collapse" className={`accordion-collapse ${!contractStatus ? 'show' : 'collapse'}`} aria-labelledby="register-heading" data-bs-parent="#issuerFlush">
                                <div className="accordion-body">
                                    <p>Fill the below form and create new product contract(Basically NFT Contract).
                                    </p>
                                    <form className="m-2" style={{ height: '100%' }} onSubmit={onSubmit}>
                                        <div className="mb-3">
                                            <label htmlFor="issuerAddress" className="form-label">Company Address</label>
                                            <span id="issuerAddress" aria-describedby="issuerAddressHelp" type='text'
                                                className="form-control" style={{ background: "#e9ecef" }}
                                            >{accounts[0]} </span>
                                            <div id="issuerAddressHelp" className="form-text">e.g."Company address."</div>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="requestIndexInput" className="form-label">Request Index</label>
                                            <span id="requestIndexInput" aria-describedby="requestIndexInputHelp" type='text'
                                                className="form-control" style={{ background: "#e9ecef" }}

                                            >{index}</span>
                                            <div id="requestIndexInputHelp" className="form-text">e.g."Company's request index. "</div>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="NameInput" className="form-label">Contract Name</label>
                                            <input id="NameInput" aria-describedby="NameInputHelp" type='text'
                                                className="form-control"
                                                value={contractName}
                                                onChange={(event) => setContractName(event.target.value)}
                                                required

                                            />
                                            <div id="NameInputHelp" className="form-text">"Enter your contract name" e.g Nike Shoes or Nike Men's Jacket</div>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="productType" className="form-label">Product Type</label>
                                            <select id="productType" className="form-select" aria-describedby="productTypeHelp"
                                                value={productType}
                                                onChange={(event) => setproductType(event.target.value)}>
                                                <option value="Physical">Physical</option>
                                                {/* <option value="Digital">Digital</option> */}
                                            </select>
                                            <div id="productTypeHelp" className="form-text">e.g."Which type of product you want to generate.e.g Physical or Digital"</div>
                                        </div>
                                        <span className="text-danger" hidden={!errorMessage}>{errorMessage}</span>
                                        <div className="mb-3 d-flex" style={{ alignItems: 'center' }}>
                                            <button type="submit" className="btn btn-dark form-control" disabled={(!loading)}>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" hidden={loading}></span>
                                                Create Contract</button>
                                        </div>
                                        <div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div className="accordion-item">
                            <h2 className="accordion-header" id="create-heading">
                                <button className={`accordion-button ${contractStatus ? '' : 'collapsed'} fw-bold`} type="button" data-bs-toggle="collapse" data-bs-target="#create-collapse" aria-expanded={{ contractStatus }} aria-controls="create-collapse">
                                    Generate New Product's NFT
                                </button>
                            </h2>
                            <div id="create-collapse" className={`accordion-collapse ${contractStatus ? 'show' : 'collapse'}`} aria-labelledby="create-heading" data-bs-parent="#issuerFlush">
                                <div className="accordion-body">
                                    <div className="row mb-3">
                                        <div className="col-lg-4 mt-2">
                                            <label htmlFor="productType" className="form-label ">Select Product Contract</label>
                                        </div>

                                        <div className="col-auto mt-2">
                                            <select className="form-select"
                                                value={selectedContract}
                                                onChange={selectionOnChange}>
                                                <option value="Select Contract"> Select Contract </option>
                                                <SelectOption />
                                            </select>
                                        </div>
                                    </div>
                                    <hr className="bg-danger border-2 border-top border-danger mb-3"></hr>
                                    <form className="m-2" style={{ height: '100%' }} onSubmit={onSubmitGenerate} hidden={formVisibility}>
                                        <div className="row mb-3">
                                            <label htmlFor="productname" className="form-label col-lg-4">Product Name</label>
                                            <div className="col-lg-6">
                                                <input id="productname" aria-describedby="productnameHelp" type='text'
                                                    className="form-control"
                                                    value={productname}
                                                    onChange={(event) => setproductname(event.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label htmlFor="modelno" className="form-label col-lg-4">Model Number</label>
                                            <div className="col-lg-6">
                                                <input id="modelno" aria-describedby="modelnoHelp" type='text'
                                                    className="form-control"
                                                    value={modelno}
                                                    onChange={(event) => setmodelno(event.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label htmlFor="color" className="form-label col-lg-4">Colour</label>
                                            <div className="col-lg-6">
                                                <input id="color" aria-describedby="colorHelp" type='text'
                                                    className="form-control"
                                                    value={color}
                                                    onChange={(event) => setcolor(event.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label htmlFor="serialno" className="form-label col-lg-4">Barcode/SerialNo</label>
                                            <div className="col-lg-6">
                                                <input id="serialno" aria-describedby="serialnoHelp" type='text'
                                                    className="form-control"
                                                    value={uniqID}
                                                    onChange={(event) => setUniqID(event.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label htmlFor="countryOfOrigin" className="form-label col-lg-4">Country Of Origin</label>
                                            <div className="col-lg-6">
                                                <input id="countryOfOrigin" aria-describedby="countryOfOriginHelp" type='text'
                                                    className="form-control"
                                                    value={countryOfOrigin}
                                                    onChange={(event) => setcountryOfOrigin(event.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        {/* <div className="row mb-3">
                                        <label htmlFor="uniqPass" className="form-label col-lg-4">Password</label>
                                        <div className="col-lg-6">
                                            <input id="uniqPass" aria-describedby="uniqPassHelp" type='text'
                                                className="form-control"
                                                value={uniqPassword}
                                                onChange={(event) => setUniqPassword(event.target.value)}
                                                required
                                            />
                                            <div id="uniqPassHelp" className="form-text">First Name 4 letter & Enrolment Id last 4 digit e.g."FIRS4526"</div>
                                        </div>
                                    </div> */}
                                        <div className="row mb-3">
                                            <label htmlFor="mintPrice" className="form-label col-lg-4">Minting Fee</label>
                                            <div className="col-lg-6">
                                                <input id="mintPrice" aria-describedby="mintPriceHelp" type='text' readOnly
                                                    className="form-control"
                                                    value={fee}
                                                />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label htmlFor="fileInput" className="form-label col-lg-4">Upload Product Image</label>
                                            <div className="col-lg-6">
                                                <input type="file" className="form-control" ref={uploadImage}
                                                    required
                                                />
                                            </div>

                                            <div className="col-lg-2">
                                                <button className="btn btn-dark form-control" onClick={onClickUpload}>
                                                    Upload
                                                </button>
                                            </div>
                                        </div>
                                        <span className="text-danger" hidden={!errorMessage}>{errorMessage}</span>
                                        <div className="mb-3" >
                                            <button type="submit" className="btn btn-dark form-control" disabled={(!loading) || uploadStatus}>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" hidden={loading}></span>
                                                Generate Product's NFT</button>
                                        </div>
                                        <canvas ref={canvas_} height={50} width={50} hidden={true}>
                                        </canvas>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container card shadow" hidden={!contractStatus}>
                </div>
            </div>
        </Base>
    )
}

export default CreateContract