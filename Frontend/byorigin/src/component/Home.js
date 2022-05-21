import React, { useEffect } from 'react'
import Base from './Base'
import clothing from '../clothing.jpg'
import QR from '../QRHome.png'
import '../css/Home.css'


function Home() {


    return (
        <Base>
            <div className="HomeContainer">
                <div className="row mt-3 align-items-center">
                    <div className='col-6'>
                        <h1>Product's NFT for company</h1>
                        <br />
                        <p>
                            How do you know if the product is real or fake?
                            Today we must beware of fake or duplicate product
                            and make verification of them a standard practice.
                        </p>
                    </div>
                    <div className='col-6'>
                        <img
                            src={clothing} />
                    </div>
                </div>
                <div className="row mt-3 align-items-center">
                    <h1>The Problem</h1>
                    <p>
                        In this day and age, can we trust any product presented to us? How do you know if the product is real or fake? First Copy/Duplicate product is readily available and makes manipulation easy. For example, any T-shirt/Shoes we buy online,we don't know it is original or duplicate.
                    </p>
                </div>
                <div className="row mt-3 align-items-center">
                    <h1>The Solution</h1>
                    <div>
                        <p>
                            Blockchain helps us to minimize this type of fraud.
                            We are here to help you out.ByOrigin gives the unique identity of each product using NFTs and verifies its authenticity by scanning QR codes on it.

                        </p>
                        <br/>
                        <p className="fw bold">
                            Note: Current this demo is only for Physical Product verification. 
                            In future this concept will helpfull for verifying authenticity of any Digital Product or Digital Certificate.
                        </p>
                    </div>
                </div>
                <div className="row mt-3 align-items-center">
                    <h1>Steps to use ByOrigin product</h1>
                    <div>
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item">1. Register as a Company (One time registration for one company)</li>
                            <li className="list-group-item">2. ByOrigin verifies KYC and approved your request.Now you become certified company on platform (Any one can approve company request-As per demo purpose)</li>
                            <li className="list-group-item">3. Create new NFT contract for your products. Like, T-shirt/Shoes/Shirt etc</li>
                            <li className="list-group-item">4. Generate new Product's NFT as you require.Each product has uniqe identity and has uniqe QR Code on it </li>
                            <li className="list-group-item">5. Product's owner claim their product's NFT ownership by providing secret password and secret PIN (one time process by claimer)</li>
                            <li className="list-group-item">6. Any one can verify its authenticity by scanning QR code and providing secret PIN</li>
                        </ul>
                    </div>
                </div>

            </div>
        </Base>
    )
}

export default Home