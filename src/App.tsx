import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
// import { Security, SecureRoute } from './auth';
import AuthProvider from './auth/Provider';
import Home from './Home';

const config = ({
  domain: 'alans-test-pool.auth.eu-west-1.amazoncognito.com',
  client_id: '2540262ik83c14svam9ud511i0',
  redirect_uri: window.location.origin + '/implicit/callback',
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
