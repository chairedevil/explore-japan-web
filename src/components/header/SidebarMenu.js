import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Drawer, Menu, Icon } from 'antd'
import { NavLink } from 'react-router-dom'

import style from '../../assets/css/components/SidebarMenu.module.less'

const SubMenu = Menu.SubMenu
export class SidebarMenu extends Component {

  render() {

        const renderLink = props => {
        if(this.props.authenticated)
        {
            return [
                <SubMenu key="loggedSide" title={<span><Icon type="user" style={{ display: 'inline-block', verticalAlign: 'middle' }} theme="outlined" /><span>{ this.props.data.username }</span></span>}>
                { this.props.data.isAdmin ? <Menu.Item key="meuarticle">
                        <NavLink
                            to="/uparticle"
                            onClick={ () => this.props.handleSelect('/uparticle') }
                        ><Icon type="edit" style={{ display: 'inline-block', verticalAlign: 'middle' }} theme="outlined" /> Upload Article</NavLink>
                    </Menu.Item> : '' }
                    <Menu.Item key="menuphoto">
                        <NavLink
                            to="/upphoto"
                            onClick={ () => this.props.handleSelect('/upphoto') }
                        ><Icon type="picture" style={{ display: 'inline-block', verticalAlign: 'middle' }} theme="outlined" /> Upload Photo</NavLink>
                    </Menu.Item>
                    <Menu.Item key="savedlist">
                        <NavLink
                            to="/savedlist"
                            onClick={ () => this.props.handleSelect('/savedlist') }
                        ><Icon type="star" style={{ display: 'inline-block', verticalAlign: 'middle' }} theme="outlined" /> Saved List</NavLink>
                    </Menu.Item>
                    <Menu.Item key="/signout" onClick={this.props.signout}>
                        <Icon type="api" style={{ display: 'inline-block', verticalAlign: 'middle' }} theme="outlined" />Sign Out
                    </Menu.Item>
                </SubMenu>
            ]
        }
        else
        {
            return [
                    <Menu.Item key="/signin" onClick={() => { this.props.toggleDrawer(); this.props.toggleModal() }} className={ style.menuItem }>
                        <Icon type="user" /><span>Sign In</span>
                    </Menu.Item>,
                    <Menu.Item key="/signup" className={ style.menuItem }>
                        <Icon type="user-add" />
                        <NavLink exact to="/signup" onClick={ () => this.props.handleSelect('/signup')}
                        >Sign Up</NavLink>
                    </Menu.Item>
            ]
            
        }
    }

    return (
        <Drawer
        title="Navigator"
        placement="left"
        closable={false}
        onClose={this.props.toggleDrawer}
        visible={this.props.isDrawerOpen}>
        <Menu
            style={{ width: '100%', border: 'none' }}
            mode="inline"
            selectedKeys={ this.props.selectedMenu }
        >
            <Menu.Item key="/" className={ style.menuItem }>
                <Icon type="home" />
                <NavLink exact to="/"
                    onClick={ () => this.props.handleSelect('/')}
                >Home</NavLink>
            </Menu.Item>
            <Menu.Item key="/popular" className={ style.menuItem }>
                <Icon type="star" />
                <NavLink exact to="/popular"
                    onClick={ () => this.props.handleSelect('/popular')}
                >TOP ARTICLE</NavLink>
            </Menu.Item>
            <Menu.Item key="/destination" className={ style.menuItem }>
                <Icon type="compass" />
                <NavLink exact to="/destination"
                    onClick={ () => this.props.handleSelect('/destination')}
                >TOP PHOTO</NavLink>
            </Menu.Item>
            <Menu.Divider />

            { renderLink() }
        </Menu>
    </Drawer>
    )
  }
}

function mapStateToProps(state){
    return {
        authenticated: state.authReducers.authenticated,
        data: state.authReducers.data
    }
}

export default connect(mapStateToProps)(SidebarMenu)
