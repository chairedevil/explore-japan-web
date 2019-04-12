import React, { Component } from 'react'
import { connect } from 'react-redux'
import { signout } from '../../redux/actions/authActions'
import MediaQuery from 'react-responsive'
import classNames from 'classnames'
import { NavLink } from 'react-router-dom'
import history from '../../history'
import { Row, Col, Menu, Icon, Avatar, Dropdown, Modal } from 'antd'
import config from '../../config'

import SigninForm from './SigninForm'
import SidebarMenu from './SidebarMenu'

import style from '../../assets/css/components/Header.module.less'
import logo from '../../assets/img/logo_color.png'

import img1 from '../../assets/help/1.jpg'
import img2 from '../../assets/help/2.jpg'
import img3 from '../../assets/help/3.jpg'
import img4 from '../../assets/help/4.jpg'
import img5 from '../../assets/help/5.jpg'
import img6 from '../../assets/help/6.jpg'
import img7 from '../../assets/help/7.jpg'

class HeaderContainer extends Component {

    state = {
        isDrawerOpen: false,
        isModalOpen: false,
        selectedMenu: ['/'],
        helpModalVisible: true
    }
    componentWillMount(){
        this.setState({
            selectedMenu: [ history.location.pathname ]
        })
    }

    setHelpModalVisible(helpModalVisible) {
        this.setState({ helpModalVisible });
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
            //const avaImg = `assets/avatar/${ this.props.data.avaPath }`
            const avaImg = `${config.SERVER_URL}/avatar/${ this.props.data.avaPath }`
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
                                <li className={ style.link }>
                                    <div 
                                        onClick={() => this.setHelpModalVisible(true)}
                                        className={ style.helpBtn }
                                    >HELP/使い方</div>
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

                <Modal
                    title="プロジェクトの説明・使い方"
                    className={ style.helpModal }
                    style={{ top: 20 }}
                    visible={this.state.helpModalVisible}
                    footer={null}
                    onOk={() => this.setHelpModalVisible(false)}
                    onCancel={() => this.setHelpModalVisible(false)}
                    centered={true}
                    width={ 850 }
                >
                    <p>日本に旅行することには時期や季節が違ったら、景色や感じの差別があります。それで、日本に旅行することには期間がとても大切だと思います。</p>
                    <p>このサイトは「explore Japan」というサイトです。複数のキーワードと期間で日本の観光地と行っているイベントと写真を探すサイトです。</p>
                    <p>このサイトはreactで制作しましたので、Single-Page Applicationになります。</p>
                    <p className={ style.bold }>テスト用のメンバー<br/>username : admin01<br/>password : 1234</p>
                    <p className={ style.bold }>特徴１：キーワード推薦</p>
                    <img src={ img1 } alt="searchbar2" width="100%" />
                    <p>一部分のテキストを入力すると、キーワード（場所の名前）が出てきて、場所の名前を推薦してもらいます。</p>
                    <img src={ img2 } alt="searchbar" width="100%" />
                    <p>テスト用のキーワードは「sakura」と「tokyo」で、テスト用の期間は4/1から4/31までです。試してみてください。</p>
                    <p className={ style.bold }>結果詳細</p>
                    <img src={ img3 } alt="detail" width="100%" />
                    <p>結果を選択して見れば、こんな感じで表示します。</p>
                    <p>保存ボタン：後で見るだけではなく、このボタンが押された回数を数えて、ランキングを見ることができます。（「TOP ARTICLES」メニューと「TOP PHOTOS」メニュー）</p>
                    <p>マップ：もし位置情報が持っている場合はマップも表示します。</p>
                    <p>関連記事：選択した結果と関連に関するものが並んで、簡単に選べます。</p>
                    <img src={ img4 } alt="comment" width="100%" />
                    <p>コメントもできます。</p>
                    <p className={ style.bold }>特徴２：自動に位置情報を入力すること</p>
                    <img src={ img5 } alt="uploadphoto" width="100%" />
                    <p>もし選択した画像のメタデータに位置情報がある場合は、位置情報を入力してくれて、その位置情報で都道府県の名前も判断して、入力してくれます。撮った日付も入力してもらいます。ユーザーはタイトルを入力してもらったら、投稿することができます。</p>
                    <img src={ img6 } alt="uploadart" width="100%" />
                    <p>記事とイベントを投稿する場合は、詳細の部分があり、Rich Text Editorというものを準備しています。動的に画像を挿入したり、テキストの厚さを変えたり、斜めにしたり、することができます。</p>
                    <p className={ style.bold }>特徴３：記事の言語判断</p>
                    <p>このサイトは日本人でも外国人でも対応したいと思いましたから、テキストボックスに入力した文字に言語を判断して、データベースに保存して、トップページに表示します。</p>
                    <img src={ img7 } alt="lang" width="100%" />
                    <p>この以外でも様々なことをこだわっていました。例えば、無限スクロール、パスワード暗号化、デザインなどです。</p>
                    <p>ご観覧いただき、ありがとうございます。</p>
                </Modal>
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