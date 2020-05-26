import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { CognitoAuthProvider } from './cognitoAuth/context';
import { ICognitoConfig } from './cognitoAuth/CognitoAuthClient';

const config: ICognitoConfig = {
  domain: 'https://alans-test-pool.auth.eu-west-1.amazoncognito.com',
  clientId: '7b0lmsj148jkbo0b9tnbd34bee',
  redirectUri: window.location.origin,
  scopes: ['openid', 'profile', 'email']
}

ReactDOM.render(
  <React.StrictMode>
    <CognitoAuthProvider {...config}>
      <App />
    </CognitoAuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
