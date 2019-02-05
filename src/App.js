import React, { Component } from 'react'
import { Route, Switch } from 'react-router-dom'

import Header from './components/header/Header'
import Home from './pages/Home'
import Popular from './pages/Popular'
import Destination from './pages/Destination'
import Signin from './pages/Signin'
import Signup from './pages/Signup'
import Article from './pages/Article'
import PostPhoto from './pages/PostPhoto'
import PostArticle from './pages/PostArticle'
import Footer from './components/footer/Footer'
import SavedList from './pages/SavedList'

class App extends Component {
  render() {
    return (
      <div>
        <Header />
        <Switch>
          <Route exact path="/" component={ Home }/>
          <Route path="/article/:articleId" component={ Article }/>
          <Route path="/popular" component={ Popular }/>
          <Route path="/destination" component={ Destination }/>
          <Route path="/uparticle" component={ PostArticle }/>
          <Route path="/upphoto" component={ PostPhoto }/>
          <Route path="/savedlist" component={ SavedList }/>
          <Route path="/signin" component={ Signin }/>
          <Route path="/signup" component={ Signup }/>
        </Switch>
        <Footer />
      </div>
    );
  }
}

export default App;
