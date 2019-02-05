import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import style from '../assets/css/pages/Home.module.less'
import { Row, Col, DatePicker, Card } from 'antd'
import SearchBar from '../components/home/SearchBar'
import WeatherCard from '../components/home/WeatherCard'
import axios from 'axios'
//import _ from 'lodash'
import config from '../config'
import { Link } from 'react-router-dom'
import { convertFromRaw } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html'

import Masonry from 'react-masonry-component'
const masonryOptions = {
  transitionDuration: 0
};
const imagesLoadedOptions = { background: '.my-bg-image-el' }

export class Home extends Component {

  state = {
    startPeriod: '',
    endPeriod: '',
    isFeedLoading: false,
    feedData: [],
    weatherData: []
  }
  componentDidMount(){
    this.feedLoad()
  }
  componentDidUpdate(prevProps, prevState){
    if( prevProps.searchVal !== this.props.searchVal || prevState.startPeriod !== this.state.startPeriod || prevState.endPeriod !== this.state.endPeriod ){
      this.feedLoad()
    }
  }

  feedLoad(){
    this.setState({
      isFeedLoading: true,
      weatherData: []
    })

    const keywords = this.props.searchVal.reduce((result, obj, idx) => {
      return (idx === 0 )? `${obj.key}` : `${result}+${obj.key}`
    }, "")

    this.props.searchVal.forEach((value)=>{
      //console.log(value.key)
      axios.get(`${config.SERVER_URL}/getWeather?city=${value.key}`)
      .then((response) => {
        this.setState({
          weatherData: [ ...this.state.weatherData, response.data]
        })
      })
    })
    

    axios.get(`${config.SERVER_URL}/articles?search=${keywords}&start=${this.state.startPeriod}&end=${this.state.endPeriod}`)
      .then((response) => {
        this.setState({
          feedData: response.data,
          isFeedLoading: false
        })
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

              <Masonry
                  options={masonryOptions} // default {}
                  disableImagesLoaded={false} // default false
                  updateOnEachImageLoad={false} // default false and works only if disableImagesLoaded is false
                  imagesLoadedOptions={imagesLoadedOptions} // default {}
              >
              <WeatherCard weatherData={ this.state.weatherData } />
              {
                feedData.map((article)=>{
                  //const text = stateToHTML(convertFromRaw(JSON.parse(article.content))).replace(/<(?:.|\n)*?>/gm, '')
                  //const txt = _.toString(article.content)
                  const coverSrc = `assets/img/${article.coverPath}`
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
                  return <Col key={article.articleId} xs={24} sm={12} md={12} lg={8} className="image-element-class">
                          <Card 
                            className={ style.feedCard }
                            bordered={false}
                            cover={<Link to={link}><img alt={ article.title } src={coverSrc} /></Link>}
                          >
                            { firstTag }
                            <Link to={link}><div className={ style.cardTitle }>{ article.title }</div></Link>
                            { cardBody }
                          </Card>
                         </Col>
                })
              }
              </Masonry>

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
