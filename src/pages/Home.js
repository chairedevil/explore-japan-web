import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import style from '../assets/css/pages/Home.module.less'
import { Row, Col, DatePicker, Card } from 'antd'
import SearchBar from '../components/home/SearchBar'
import WeatherCard from '../components/home/WeatherCard'
import axios from 'axios'
import config from '../config'
import { Link } from 'react-router-dom'
import { convertFromRaw } from 'draft-js'
import { stateToHTML } from 'draft-js-export-html'
import InfiniteScroll from 'react-infinite-scroll-component'
import debounce from 'lodash/debounce'

import Masonry from 'react-masonry-component'
const masonryOptions = {
  transitionDuration: 0
};

export class Home extends Component {

	state = {
		startPeriod: '',
		endPeriod: '',
		isFeedLoading: false,
		feedData: [],
		weatherData: [],
		scrollerHasMore: true
	}
	componentDidMount(){
		this.feedLoad()
	}
  	componentDidUpdate(prevProps, prevState){
		if( prevProps.searchVal !== this.props.searchVal || prevState.startPeriod !== this.state.startPeriod || prevState.endPeriod !== this.state.endPeriod ){
			this.feedLoad()
		}
	}

	feedLoad = () => {
		this.setState({
			isFeedLoading: true,
			weatherData: []
		})

		const keywords = this.props.searchVal.reduce((result, obj, idx) => {
			return (idx === 0 )? `${obj.key}` : `${result}+${obj.key}`
		}, "")

		this.props.searchVal.forEach((value)=>{
		axios.get(`${config.SERVER_URL}/getWeather?city=${value.key}`)
		.then((response) => {
				this.setState({
					weatherData: [ ...this.state.weatherData, response.data]
				})
			})
		})
    
		const fetchAmount = parseInt((this.state.feedData.length+10)/10)*10
		axios.get(`${config.SERVER_URL}/articles?search=${keywords}&start=${this.state.startPeriod}&end=${this.state.endPeriod}&idx=${fetchAmount}`)
		.then((response) => {
			if(fetchAmount > response.data.length){
				this.setState({
					scrollerHasMore: false
				})
			}
			this.setState({
				feedData: response.data,
				isFeedLoading: false
			})
			//console.log(this.state.feedData)
		})
	}

	handleDateChange = (date, dateString) => {
		this.setState({
			startPeriod: dateString[0],
			endPeriod: dateString[1]
		})
	}

	loadingCard = () => {
		if(this.state.isFeedLoading){
			return [
				<Fragment key="loading">
					<Col xs={24} sm={12} md={12} lg={8}><Card loading className={ style.feedCard } bordered={false}></Card></Col>
					<Col xs={24} sm={12} md={12} lg={8}><Card loading className={ style.feedCard } bordered={false}></Card></Col>
					<Col xs={24} sm={12} md={12} lg={8}><Card loading className={ style.feedCard } bordered={false}></Card></Col>
				</Fragment>
			]
		}
	}

	render() {
		const { feedData } = this.state
		return (
			<div>
				<div className={ style.topHeaderBgContain }>
					<div className={ style.topHeaderBg }></div>
				</div>
				<Row justify="center" className={ style.header }>
					<Col className={ style.headerInfo }>
						<h2>explore your Japan</h2>
						<h3>find destination that match with you</h3>
						<SearchBar />
						<DatePicker.RangePicker
							onChange={ this.handleDateChange } 
							size={"large"}
							className={ style.datePick }
							dropdownClassName={ style.datePickPopup }
							//popupStyle={{transform: 'translateX(-100px)'}}
						/>
					</Col>
				</Row>
				<div className={ style.feedContainer }>
					<h4>Find places you may like</h4>
					<Row gutter={16}>
						<InfiniteScroll
							style={{overflow:'hidden', paddingTop:10}}
							dataLength={this.state.feedData.length}
							next={debounce(this.feedLoad, 2000)}
							hasMore={this.state.scrollerHasMore}
							loader={<>
									<Col xs={24} sm={12} md={12} lg={8}><Card loading className={ style.feedCard } bordered={false}></Card></Col>
									<Col xs={24} sm={12} md={12} lg={8}><Card loading className={ style.feedCard } bordered={false}></Card></Col>
									<Col xs={24} sm={12} md={12} lg={8}><Card loading className={ style.feedCard } bordered={false}></Card></Col>
								</>
								}
						>
							<Masonry
								options={masonryOptions}
							>
								<WeatherCard weatherData={ this.state.weatherData } />
								{
									feedData.map((article)=>{
									const coverSrc = `${config.SERVER_URL}/img/${article.coverPath}`
									const link = `/article/${article.articleId}`
									let firstTag, cardBody, txt
									if(article.articleType === 0){
										txt = stateToHTML(convertFromRaw(JSON.parse(article.content))).replace(/<(?:.|\n)*?>/gm, '')
										firstTag = <span className={ style.t1 }>Article</span>
										cardBody = <p>{ txt.substr(0,130) }... <Link to={link}>see more</Link></p>
									}else if(article.articleType === 1){
										firstTag = <span className={ style.t2 }>Photo</span>
									}else{
										txt = stateToHTML(convertFromRaw(JSON.parse(article.content))).replace(/<(?:.|\n)*?>/gm, '')
										firstTag = <span className={ style.t3 }>Event</span>
										cardBody = <p>{ txt.substr(0,100) }... <Link to={link}>see more</Link></p>
									}
									const secondTag = <span className={ style.prefretureTag }>{ article.nameEn.charAt(0).toUpperCase() + article.nameEn.slice(1) }</span>
									return <Col key={article.articleId}  xs={24} sm={12} md={12} lg={8} className="image-element-class">
											<Card 
												className={ style.feedCard }
												bordered={false}
												cover={<Link to={link}><img alt={ article.title } src={coverSrc} /></Link>}
											>
												{ firstTag }
												{ secondTag }
												{
													article.lang && <span className={ style.langTag }>{article.lang===1? "English" : "日本語" }</span>
												}
												<Link to={link}><div className={ style.cardTitle }>{ article.title }</div></Link>
												{ cardBody }
											</Card>
											</Col>
									})
								}
							</Masonry>
						</InfiniteScroll>

						{ this.loadingCard() }
					</Row>
				</div>
			</div>
		)
	}
}

function mapStateToProps(state){
  return {
    searchVal: state.searchReducers.searchVal
  }
}

export default connect(mapStateToProps)(Home)
