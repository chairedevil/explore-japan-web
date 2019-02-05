import React, { Component } from 'react'
import style from '../../assets/css/components/Footer.module.less'

export class Footer extends Component {
  render() {
    return (
      <div>
          <p className={ style.footerText }>Copyright © 2019 Wattayakorn Inc. All rights reserved.</p>
      </div>
    )
  }
}

export default Footer
