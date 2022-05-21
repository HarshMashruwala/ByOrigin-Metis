import React from 'react';
import {BrowserRouter,Switch,Route} from 'react-router-dom';
import Home from './component/Home';
import Admin from  './component/Admin';
import Claim from './component/Claim';
import Issuer from './component/Issuer';
import CreateContract from './component/CreateContract';




function Routes(){
    return(
        <BrowserRouter>
            <Switch>
                <Route path='/' exact>
                    <Home/>
                </Route>
                <Route path='/admin'>
                    <Admin/>
                </Route>
                <Route path='/claim/:contractAddress/:tokenId'>
                    <Claim/>
                </Route>
                <Route path='/issuer'>
                    <Issuer/>
                </Route>
                <Route path='/createContract/:index'>
                    <CreateContract/>
                </Route>
            </Switch>
        </BrowserRouter>
    )
}

export default Routes