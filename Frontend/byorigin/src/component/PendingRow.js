import React,{useState} from 'react'
import ByOrigin from '../script/ByOrigin'

function PendingRow(props){
    const [loading, setLoading] = useState(true)

    async function approveRequest() {
        setLoading(false)
        try{
            const result = await ByOrigin.methods.approveRequest(props.issuerIndex).send({
                from:props.accounts
            })
            console.log(result)
        }catch(err){
            console.log(err)
        }
        setLoading(true)
        window.location.reload();
        
    }

    return(
                <tr>
                    <th scope="row">{props.id}</th>
                    <td>{props.companyName}</td>
                    <td>{props.companyCIN}</td>
                    <td>{props.companyPAN}</td>
                    <td className="text-danger fw-bold">Pending</td>
                    <td>
                    <button className="btn btn-dark form-control"  disabled={(!loading)} onClick={approveRequest}>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" hidden={loading}></span>
                    Approve</button>
                    </td>
                </tr>
    )

}

export default PendingRow