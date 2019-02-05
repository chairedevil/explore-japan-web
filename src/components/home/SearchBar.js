import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setSearchVal } from '../../redux/actions/searchActions'
import { Select, Spin } from 'antd'
import debounce from 'lodash/debounce'
import style from '../../assets/css/components/SearchBar.module.less'
import axios from 'axios'
import config from '../../config'

const Option = Select.Option

class SearchBar extends Component{
    constructor(props) {
        super(props);
        this.fetchSuggestion = debounce(this.fetchSuggestion, 800);
    }

    state = {
        value:[],
        data: [],
        fetching: false,
    }

    componentDidUpdate(prevProps, prevState){
        if( prevState.value !== this.state.value){
            //console.log(this.state.value)
        }
    }

    fetchSuggestion = (value) => {
        const char = value  
        
        if(char){
            this.setState({ data: [], fetching: true });
            axios.get(`${config.SERVER_URL}/autoplace`,{
                params:{
                    chr: char,
                }
            })
            .then(({data})=>{
                const place = data.map(r => ({
                    text: r,
                    value: r,
                }));
                this.setState({ data : place, fetching: false })
            })
        }else{
            this.setState({ data: [], fetching: false });
        }

    }
    
    handleChange = (value) => {
        this.props.dispatch(setSearchVal(value))
        this.setState({
            data: [],
            fetching: false,
        });
    }

    render(){
        const { fetching, data } = this.state;
        return (
            <Select
                className={ style.searchBar }
                mode="multiple"
                labelInValue
                value={this.props.searchVal}
                placeholder="Search"
                notFoundContent={fetching ? <Spin size="small" /> : null}
                filterOption={false}
                onSearch={this.fetchSuggestion}
                onChange={this.handleChange}
            >
                {data.map(d => <Option key={d.value}>{d.text}</Option>)}
            </Select>
        )
    }

}

function mapStateToProps(state){
    return {
        searchVal: state.searchReducers.searchVal
    }
}

export default connect(mapStateToProps)(SearchBar)