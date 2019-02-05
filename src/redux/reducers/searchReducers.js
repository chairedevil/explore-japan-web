export default( state={searchVal: []}, action ) => {
    switch(action.type){
        case 'SET_SEARCH_VALUE':
            return { searchVal: action.payload }
        case 'RESET_SEARCH_VALUE':
            return { searchVal: [] }
        default:
            return { searchVal: [] }
    }
}