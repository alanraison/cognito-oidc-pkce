import React, { useState } from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import { Security, SecureRoute, LoginCallback } from '@okta/okta-react';
import AWS from 'aws-sdk';
import './App.css';

const config = {
  client_id: '7b0lmsj148jkbo0b9tnbd34bee',
  issuer: 'https://alans-test-pool.auth.eu-west-1.amazoncognito.com',
  redirectUri: 'http://localhost:3000',
  scopes: ['openid','profile','email'],
  pkce: true,
}

function App() {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<string|Error>();
  AWS.config.region = 'eu-west-1';
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'eu-west-1:d5446d9a-c215-487e-b605-08f110b767dc',
  });
  const sns = new AWS.SNS();
  return (
    <Router>
      <Security {...config}>
      <Route exact path='/' component={LoginCallback}/>
      <SecureRoute path='/'/>
      <Route exact path='/'>
          <div className="App">
            <header className="App-header">
              <h1>Cognito Test</h1>
            </header>
            <main>
              <label htmlFor="input">Message</label>
              <input id="input" type="text" value={message} onChange={e => setMessage(e.target.value)}></input>
              <button onClick={() => sns.publish({
                Message: message,
                TopicArn: 'arn:aws:sns:eu-west-1:998973235548:test'
              }).promise().then(r => setResult(r.MessageId)).catch((e: Error) => setResult(`Error: ${e.message}`))}>
                Send
              </button>
              <div>{result}</div>
            </main>
          </div>
        </Route>
      </Security>
    </Router>
  );
}

export default App;
