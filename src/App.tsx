import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Security, SecureRoute, LoginCallback } from '@okta/okta-react';
import Home from './Home';
import './App.css';

const oktaConfig = {
  clientId: '0oarctzexf8mJlhv50h7',
  issuer: 'https://dev-369184.oktapreview.com/oauth2/default',
  redirectUri: `${window.location.origin}/implicit/callback`,
  scopes: ['openid','email'],
  pkce: true,
}

function App() {
  return (
    <Router>
      <Security {...oktaConfig}>
        <Route path="/implicit/callback" component={LoginCallback}/>
        <SecureRoute exact path="/" component={Home}/>
      </Security>
    </Router>
  );
}

export default App;
