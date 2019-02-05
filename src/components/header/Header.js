import React, { Component } from 'react'
import { connect } from 'react-redux'
import { signout } from '../../redux/actions/authActions'
import MediaQuery from 'react-responsive'
import classNames from 'classnames'
import { NavLink } from 'react-router-dom'
import history from '../../history'
import { Row, Col, Menu, Icon, Avatar, Dropdown } from 'antd'

import SigninForm from './SigninForm'
import SidebarMenu from './SidebarMenu'

import style from '../../assets/css/components/Header.module.less'
import logo from '../../assets/img/logo_color.png'

class HeaderContainer extends Component {

    state = {
        isDrawerOpen: false,
        isModalOpen: false,
        selectedMenu: ['/']
    }
    componentWillMount(){
        this.setState({
            selectedMenu: [ history.location.pathname ]
        })
    }

    toggleDrawer = () => {
        this.setState((prevState) => {
            return { isDrawerOpen : !prevState.isDrawerOpen }
        })
    }

    toggleModal = () => {
        this.setState((prevState) => {
            return { isModalOpen: !prevState.isModalOpen }
        })
    }

    handleSelect = (menuKey) => {
        this.setState({
            selectedMenu: [ menuKey ]
        })
    }

    signout = () => {
        this.props.dispatch(signout())
        history.push('/')
    }

    renderLink = () => {
        if(this.props.authenticated)
        {
            const loggedinMenu = (
                <Menu>
                    { this.props.data.isAdmin ? <Menu.Item key="0">
                        <NavLink
                            to="/uparticle"
                            onClick={ () => this.handleSelect('/uparticle') }
                        ><Icon type="edit" style={{ display: 'inline-block', verticalAlign: 'middle' }} theme="outlined" /> Upload Article</NavLink>
                    </Menu.Item> : '' }
                    <Menu.Item key="1">
                        <NavLink
                            to="/upphoto"
                            onClick={ () => this.handleSelect('/upphoto') }
                        ><Icon type="picture" style={{ display: 'inline-block', verticalAlign: 'middle' }} theme="outlined" /> Upload Photo</NavLink>
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item key="1">
                        <NavLink
                            to="/savedlist"
                            onClick={ () => this.handleSelect('/savedlist') }
                        ><Icon type="star" style={{ display: 'inline-block', verticalAlign: 'middle' }} theme="outlined" /> Saved List</NavLink>
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item key="3" onClick={this.signout}>
                        <Icon type="api" style={{ display: 'inline-block', verticalAlign: 'middle' }} theme="outlined" />Sign Out
                    </Menu.Item>
                </Menu>
            )
            const avaImg = `assets/avatar/${ this.props.data.avaPath }`
            return [
                <li key="menu">
                    <Dropdown overlay={ loggedinMenu } trigger={['click']}>
                        <Avatar src={avaImg} size={45}/>
                    </Dropdown>
                </li>
            ]
        }
        else
        {
            return [
                <li key="signin" className={ style.link }>
                    <span onClick={this.toggleModal}>SIGN IN</span>
                </li>,
                <li key="signup">
                    <NavLink
                        to="/signup"
                        onClick={ () => this.handleSelect('/signup') }
                    >#SIGN UP</NavLink>
                </li>
            ]
        }
    }

    render() {
        return (
            <div className={style.navBar}>
                <Row type="flex" justify="space-between">
                    <Col>
                        <h1><img src={logo} className={ style.logo } alt="explore Japan" /></h1>
                    </Col>
                    
                    <MediaQuery minWidth={768}>
                        <Col className={ style.menuContainer }>
                            <ul className={ style.menu }>
                                <li className={ style.link }>
                                    <NavLink
                                        exact to="/"
                                        activeClassName={ style.active }
                                        onClick={ () => this.handleSelect('/') }
                                    >#HOME</NavLink>
                                </li>
                                <li className={ style.link }>
                                    <NavLink
                                        to="/popular"
                                        activeClassName={ style.active }
                                        onClick={ () => this.handleSelect('/popular') }
                                    >#TOP ARTICLE</NavLink>
                                </li>
                                <li className={ style.link }>
                                    <NavLink
                                        to="/destination"
                                        activeClassName={ style.active }
                                        onClick={ () => this.handleSelect('/destination') }
                                    >#TOP PHOTO</NavLink>
                                </li>
                                { this.renderLink() }
                            </ul>
                        </Col>
                    </MediaQuery>

                    <MediaQuery maxWidth={767}>
                        <Col className={ style.menuContainer }>
                            <div
                                onClick= { this.toggleDrawer }
                                className={ classNames(style.navTrigger, { [`${style.active}`] : this.state.isDrawerOpen }) }
                            >
                                <i></i><i></i><i></i>
                            </div>
                        </Col>
                    </MediaQuery>
                </Row>
                
                <SidebarMenu
                    handleSelect={ this.handleSelect }
                    toggleDrawer={ this.toggleDrawer }
                    toggleModal={ this.toggleModal }
                    isDrawerOpen={ this.state.isDrawerOpen }
                    selectedMenu={ this.state.selectedMenu }
                    signout={ this.signout}
                />
                <SigninForm
                    handleClose={this.toggleModal}
                    isModalOpen={this.state.isModalOpen}
                />
            </div>
        );
    }
}


function mapStateToProps(state){
    return {
        authenticated: state.authReducers.authenticated,
        data: state.authReducers.data
    }
}

export default connect(mapStateToProps, null, null, {
    pure: false
  })(HeaderContainer)