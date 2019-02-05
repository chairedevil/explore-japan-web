export const setSearchVal = (val) => {
    return {
        type:'SET_SEARCH_VALUE',
        payload: val
    }
}

export const resetSearchVal = () => {
    return {
        type:'RESET_SEARCH_VALUE'
    }
}