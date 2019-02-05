import { combineReducers } from 'redux'

import authReducers from './authReducers'
import searchReducers from './searchReducers'

const rootReducers = combineReducers({
    authReducers,
    searchReducers
})

export default rootReducers