import React from 'react';
import ReactDOM from 'react-dom';
//import { BrowserRouter as Router } from 'react-router-dom'
import { Router } from 'react-router-dom'
import history from './history'
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import { createStore, applyMiddleware } from 'redux'
//import logger from 'redux-logger'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import reducers from './redux/reducers'
import jwtDecode from 'jwt-decode'

const store = createStore(
    reducers,
    applyMiddleware(thunk)
    //applyMiddleware(thunk, logger)
)

const token = localStorage.getItem('token')
if(token){
    const decodeToken = jwtDecode(token)
    store.dispatch({
        type: 'AUTH_USER',
        payload: decodeToken
    })
}

//console.log(store.getState())
/*store.subscribe(() =>
    console.log(store.getState())
)*/

ReactDOM.render(
    <Provider store={store}>
        <Router history={history}>
            <App />
        </Router>
    </Provider>
, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();