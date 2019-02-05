import React, { Component } from 'react'
import axios from 'axios'
import config from '../config'
import style from '../assets/css/pages/Article.module.less'
import { Row, Col, Card } from 'antd'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { setSearchVal } from '../redux/actions/searchActions'
import { convertFromRaw } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html'

import Map from '../components/article/Map'
import CommentBox from '../components/article/CommentBox'
import SaveBtn from '../components/article/SaveBtn'

export class Article extends Component {
	state = {
		article: null,
		relativePost: [],
		comments: [],
		saved: false
	}

	getFeed = () => {
		const articleId = this.props.match.params.articleId
		axios.get(`${config.SERVER_URL}/article?id=${articleId}`)
		.then((response)=>{
			this.setState({
				article: response.data[0]
			})
		})
		.then(()=>{

			axios.get(`${config.SERVER_URL}/articles?search=${JSON.parse(this.state.article.tags).join('+')}&rnd=1&id=${this.props.match.params.articleId}&start=&end=`)
			.then((response) => {
				this.setState({
					relativePost: response.data
				})
			})
			axios.get(`${config.SERVER_URL}/comments?id=${this.props.match.params.articleId}`)
			.then((response) => {
				this.setState({
					comments: response.data
				})
			})
			if(this.props.authenticated){
				axios.get(`${config.SERVER_URL}/save?aid=${this.props.match.params.articleId}&uid=${this.props.data.sub}`)
				.then((response) => {
					this.setState({
						saved: response.data
					})
				})
			}

		})
	}

	componentDidMount(){
		this.getFeed()
	}

	componentWillReceiveProps(nextProps){
		if(nextProps.match.params.articleId !== this.props.match.params.articleId){
			this.setState({
				article: null,
				relativePost: []
			})
		}
	}
	componentDidUpdate(prevState){
		if(prevState.match.params.articleId !== this.props.match.params.articleId){
			this.getFeed()
		}
	}

	handleClickTag(tag){
		this.props.dispatch(setSearchVal( [{key: tag.charAt(0).toUpperCase() + tag.slice(1), label: tag.charAt(0).toUpperCase() + tag.slice(1)}] ))
	}

	handleSavedChange = () => {
		this.setState({
			saved: !this.state.saved
		})
	}

	render() {
		const { article, relativePost } = this.state
		if(this.state.article === null){
			return (<div></div>)
		}else{
		const link = `../assets/img/${article.coverPath}`
		const alt = article.title
		const tags = JSON.parse(article.tags)
		let typeTag
		switch(article.articleType){
			case 0: typeTag = [
				<div key={"t1"} className={ style.t1 }>
					Article
				</div>
			];
			break;
			case 1: typeTag = [
				<div key={"t2"} className={ style.t2 }>
					Photo
				</div>
			];
			break;
			case 2: typeTag = [
				<div key={"t3"} className={ style.t3 }>
					Event
				</div>
			];
			break;
			default: typeTag = [
				<div key={"t3"} className={ style.t3 }>
					Loading
				</div>
			];
			break;
		}
		const relateDiv = [<div key="relate" className={ style.subContentContainerInner }>
			<h3 className={ style.h3 }>Relation Post</h3>
			{
				relativePost.map((post)=>{
					const coverSrc = `../assets/img/${post.coverPath}`
					const postLink = `/article/${post.articleId}`
					return [
						<div key={post.articleId}>
							<Card
								className={ style.feedCard }
								bordered={false}
								cover={<Link to={postLink}><img alt={ post.title } src={coverSrc} /></Link>}
							>
								<Link to={postLink}><div className={ style.cardTitle }>{ post.title }</div></Link>
							</Card>
						</div>
					]
				})
			}
		</div>]
		return (
			<div>
				<div className={ style.bg }></div>
				<Row className={ style.container }>
					<Col xs={24} sm={24} md={16} lg={18} className={ style.contentContainer }>
						<Card
							className={ style.contentContainerInner }
							cover={<><img alt={alt} src={link} />{ this.props.authenticated && <SaveBtn savedState={ this.state.saved } uid={this.props.data.sub} aid={ this.props.match.params.articleId } handleSavedChange={ this.handleSavedChange } /> }</>}
							bordered={false}
						>
							<h2>{article.title}</h2>
							{ article.content !== null ?  [<div key="content" dangerouslySetInnerHTML={{__html: stateToHTML(convertFromRaw(JSON.parse(article.content)))}} />] : [<div key="content" ></div>]}
						</Card>
						<CommentBox comments={ this.state.comments } articleId={ this.props.match.params.articleId }/>
					</Col>

					<Col xs={24} sm={24} md={8} lg={6} className={ style.subContentContainer }>
						<div className={ style.showTagContainer }>
							{ typeTag }
							{
								tags.map((tag)=>{
									return [
										<Link to="/" key={tag} className={ style.tag } onClick={ () => this.handleClickTag(tag) }>
											{tag.charAt(0).toUpperCase() + tag.slice(1)}
										</Link>
									]
								})
							}
						</div>
						{ article.lat? <Map key="map" lat={article.lat} lng={article.lng} /> : [<div key="map"></div>] }
						{ relativePost.length === 0 ? [<div key="relate"></div>] : relateDiv }
					</Col>
				</Row>
			</div>
		)
		}
	}
}

function mapStateToProps(state){
    return {
        authenticated: state.authReducers.authenticated,
        data: state.authReducers.data
    }
}

export default connect(mapStateToProps)(Article)