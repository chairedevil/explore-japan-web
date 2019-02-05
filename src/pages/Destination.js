import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import style from '../assets/css/pages/Destination.module.less'
import axios from 'axios'
import config from '../config'
import { Icon, Row, Col, Card } from 'antd'

import Masonry from 'react-masonry-component'
const masonryOptions = {
  transitionDuration: 0
};
const imagesLoadedOptions = { background: '.my-bg-image-el' }

export class Destination extends Component {
  constructor(props) {
		super(props);
		this.state = {
			listData: []
		};
	}

	componentDidMount(){
		axios.get(`${config.SERVER_URL}/popular2`)
		.then((response)=>{
			console.log(response.data)
			this.setState({
				listData: response.data
			})
		})
  }
  
  render() {
    return (
		<div className={ style.contentContainer }>
				<h2>Top Photos</h2>
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
										<div className={ style.starDiv }>
											<Icon type="star-o" style={{ marginRight: 2 }} />
											{ data.count } people like this!
										</div>
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

export default Destination