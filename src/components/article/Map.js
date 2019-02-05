import React, { Component } from 'react'
import GoogleMapReact from 'google-map-react'
import style from '../../assets/css/components/Map.module.less'
import config from '../../config'

const Marker = ({ text }) => <div className={ style.markerStyle }>{text}</div>;

export class Map extends Component {
  render() {
    return (
      <div className={ style.mapContainer } >
        <GoogleMapReact
          className={ style.map }
          bootstrapURLKeys={{ key: config.GOOGLE_API_TOKEN}}
          defaultCenter={{ lat: this.props.lat, lng: this.props.lng}}
          defaultZoom={5}
        >
          <Marker
            lat={ this.props.lat }
            lng={ this.props.lng }
            text={'◉'}
          />
        </GoogleMapReact>
      </div>
    )
  }
}

export default Map
