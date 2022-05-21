import React from 'react'

function ApprovedRow(props) {
    return (
        <tr >
            <th scope="row">{props.issuerIndex}</th>
            <td>{props.companyName}</td>
            <td>{props.companyCIN}</td>
            <td>{props.companyPAN}</td>
            <td className="text-success fw-bold">Approved</td>
        </tr>
    )
}

export default ApprovedRow