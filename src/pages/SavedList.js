import React, { Component } from 'react'
import { connect } from 'react-redux'
import style from '../assets/css/pages/SavedList.module.less'
import { Link } from 'react-router-dom'
import axios from 'axios'
import config from '../config'
import { Row, Col, Card } from 'antd'

import Masonry from 'react-masonry-component'
const masonryOptions = {
  transitionDuration: 0
};
const imagesLoadedOptions = { background: '.my-bg-image-el' }

export class SavedList extends Component {
    constructor(props) {
		super(props);
		this.state = {
			listData: []
		};
	}

	componentDidMount(){
		axios.get(`${config.SERVER_URL}/savedlist?uid=${this.props.data.sub}`)
		.then((response)=>{
			//console.log(response.data)
			this.setState({
				listData: response.data
			})
		})
    }
    
    render() {
        return (
            <div className={ style.contentContainer }>
				<h2>My Destination</h2>
				<Row gutter={16}>
					<Masonry
					options={masonryOptions} // default {}
					disableImagesLoaded={false} // default false
					updateOnEachImageLoad={false} // default false and works only if disableImagesLoaded is false
					imagesLoadedOptions={imagesLoadedOptions} // default {}
				>
					{
						this.state.listData.map((data)=>{
							const link = `/article/${data.articleId}`
							const coverSrc = `assets/img/${data.coverPath}`
							return [
								<Col key={data.articleId} xs={24} sm={12} md={12} lg={8} className="image-element-class">
									<Card 
									className={ style.feedCard }
									bordered={false}
									cover={<Link to={link}><img alt={ data.title } src={coverSrc} /></Link>}
									>
										<Link to={link}><div className={ style.cardTitle }>{ data.title }</div></Link>
									</Card>
								</Col>
							]
						})
					}
					</Masonry>
				</Row>
		    </div>
        )
    }
}

function mapStateToProps(state){
    return {
        data: state.authReducers.data
    }
}

export default connect(mapStateToProps)(SavedList)
