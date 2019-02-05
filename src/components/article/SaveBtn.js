import React, { Component } from 'react'
import { Icon } from 'antd'
import style from '../../assets/css/components/SaveBtn.module.less'
import classNames from 'classnames'
import axios from 'axios'
import config from '../../config'

export class SaveBtn extends Component {

    handleClick = () => {
        if(this.props.savedState){
            axios.delete(`${config.SERVER_URL}/save?aid=${this.props.aid}&uid=${this.props.uid}`)
			.then((response) => {
				if(response.data.affectedRows === 1){
                    this.props.handleSavedChange()
                }
			})
        }else{
            axios.post(`${config.SERVER_URL}/save?aid=${this.props.aid}&uid=${this.props.uid}`)
			.then((response) => {
				if(response.data.affectedRows === 1){
                    this.props.handleSavedChange()
                }
			})
        }
    }

    render() {
        const { savedState } = this.props
        const btnClass = classNames( style.saveBtn, { [style.active] : savedState } )
        return (
            <div className={ btnClass } onClick={ this.handleClick }>
                {savedState ? <>Saved&nbsp;<Icon type="star" theme="filled" /></> : <>Save&nbsp;<Icon type="star" /></> }
            </div>
        )
    }
}

export default SaveBtn
