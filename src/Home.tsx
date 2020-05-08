import React, { useState } from 'react';
import AWS from 'aws-sdk';
import { useOktaAuth } from '@okta/okta-react';

export default function Home() {
  const { authState, authService } = useOktaAuth();
  if (!authState.isPending && !authState.isAuthenticated) {
    console.log(`pending: ${authState.isPending}`);
    console.log(`authenticated: ${authState.isAuthenticated}`)
    debugger;
    authService.login('/');
  }
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<string|Error>();
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