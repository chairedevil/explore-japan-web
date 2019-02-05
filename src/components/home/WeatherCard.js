import React, { Component } from 'react'
import { Col, Card } from 'antd'
import style from '../../assets/css/pages/Home.module.less'
import moment from 'moment'

export class WeatherCard extends Component {
  render() {
    return (
        <>
            {
                this.props.weatherData.map((data)=>{
                    //console.log(data)
                    const weatherIcon = '../assets/weather/' + data.list[0].weather[0].icon + '.png'
                    const weatherIcon2 = '../assets/weather/' + data.list[8].weather[0].icon + 'b.png'
                    const weatherIcon3 = '../assets/weather/' + data.list[16].weather[0].icon + 'b.png'
                    const weatherIcon4 = '../assets/weather/' + data.list[24].weather[0].icon + 'b.png'
                    const weatherIcon5 = '../assets/weather/' + data.list[32].weather[0].icon + 'b.png'
                    const temp = parseFloat((data.list[0].main.temp - 273.15).toFixed(0)) + "°"
                    const now = moment()
                    const weatherInfo = [
                        <div key={data.city.id} className={ style.weatherInfo }>
                            <div className={ style.weatherTitle }>
                                <div>
                                    {data.city.name}
                                </div>
                                <div className={ style.date }>
                                    {now.format("dddd")}<br/>
                                    {now.format("h:mm:ssa")}
                                </div>
                            </div>
                            <div className={ style.weatherBody }>
                                <div className={ style.bodyImg }>
                                    <img alt="weather icon" src={ weatherIcon } className={style.iconw}/>
                                    <div>{ temp }</div>
                                </div>
                                <div className={ style.bodyInfo }>
                                    <div>
                                        <p>{now.add(1, 'd').format("ddd")}</p>
                                        <img alt="weather icon" src={ weatherIcon2 } className={style.iconsmall} />
                                    </div>
                                    <div>
                                        <p>{now.add(1, 'd').format("ddd")}</p>
                                        <img alt="weather icon" src={ weatherIcon3 } className={style.iconsmall} />
                                    </div>
                                    <div>
                                        <p>{now.add(1, 'd').format("ddd")}</p>
                                        <img alt="weather icon" src={ weatherIcon4 } className={style.iconsmall} />
                                    </div>
                                    <div>
                                        <p>{now.add(1, 'd').format("ddd")}</p>
                                        <img alt="weather icon" src={ weatherIcon5 } className={style.iconsmall} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ]
                    return [
                        <Col key={data.city.id} xs={24} sm={12} md={12} lg={8} className="image-element-class">
                            <Card
                                key={data.city.id}
                                className={ style.weatherCard }
                                bordered={false}
                                cover={ weatherInfo }
                            >
                            </Card>
                        </Col>
                    ]
                })
            }
        </>
    )
  }
}

export default WeatherCard
