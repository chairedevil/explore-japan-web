import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import style from '../assets/css/pages/Popular.module.less'
import axios from 'axios'
import config from '../config'
import { List, Avatar, Icon, Row, Col } from 'antd'
import { convertFromRaw } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html'

export class Popular extends Component {
	constructor(props) {
		super(props);
		this.state = {
			listData: []
		};
	}

	componentDidMount(){
		axios.get(`${config.SERVER_URL}/popular`)
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
				<h2>Top Articles</h2>
				<List
					itemLayout="vertical"
					size="large"
					dataSource={this.state.listData}
					renderItem={item => (
					<List.Item
						key={item.title}
					>
						<Row className={ style.articleContainer }>
							<Col xs={24} sm={24} md={10} lg={8} className={ style.imgBox }>
								<Link to={`/article/${item.articleId}`}><img alt="cover" src={`${config.SERVER_URL}/img/${item.coverPath}`} /></Link>
							</Col>
							<Col xs={24} sm={24} md={14} lg={16} className={ style.contentBox }>
								<div className={ style.title }>
									<h3>{ item.title }</h3>
									<Icon type="star-o" style={{ marginRight: 2 }} />
									{ item.count }
								</div>
								<p>
									{item.content && stateToHTML(convertFromRaw(JSON.parse(item.content))).replace(/<(?:.|\n)*?>/gm, '')}
								</p>
								<div className={ style.postUser }>
									<Avatar src={`${config.SERVER_URL}/avatar/${ item.avaPath }`} />
									<h4>{item.username}</h4>
								</div>
							</Col>
						</Row>
					</List.Item>
					)}
				/>
			</div>
		)
    }
}

export default Popular