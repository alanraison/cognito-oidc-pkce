import React, { useState, useEffect } from 'react';
import AWS from 'aws-sdk';
import { useAuth } from './auth/Provider';
import './Home.css';

export default function Home() {
  const { isAuthenticated, loading, loginWithRedirect, user } = useAuth();
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<string|Error>();

  useEffect(() => {
    if (!isAuthenticated && !loading && loginWithRedirect) {
      loginWithRedirect({
        
      });
    }
  })
  AWS.config.region = 'eu-west-1';
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'eu-west-1:d5446d9a-c215-487e-b605-08f110b767dc',
  });
  const sns = new AWS.SNS();
  return (
    <div className="App">
      <header className="App-header">
        <h1>Cognito Test</h1>
      </header>
      <main>
        <div>{JSON.stringify(user)}</div>
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
  );
}