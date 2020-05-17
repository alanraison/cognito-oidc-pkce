import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
// import { Security, SecureRoute } from './auth';
import AuthProvider from './auth/Provider';
import Home from './Home';

const config = ({
  domain: 'alans-test-pool.auth.eu-west-1.amazoncognito.com',
  client_id: '7b0lmsj148jkbo0b9tnbd34bee',
  redirect_uri: window.location.origin,
});

function App() {
  return (
    <AuthProvider {...config}>
      <Router>
        <Home/>
      </Router>
    </AuthProvider>
  );
}

export default App;
