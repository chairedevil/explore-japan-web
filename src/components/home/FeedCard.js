import React, { Component } from 'react'
import config from '../../config'
import { Link } from 'react-router-dom'
import { convertFromRaw } from 'draft-js'
import { stateToHTML } from 'draft-js-export-html'
import { Col, Card } from 'antd'
import style from '../../assets/css/pages/Home.module.less'

export class FeedCard extends Component {
	render() {
		return (
			<>
				{
					this.props.feedData.map((article)=>{
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
			</>
		)
	}
}

export default FeedCard