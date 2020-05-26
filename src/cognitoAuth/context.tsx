import React, { createContext, useContext, useState, useEffect } from 'react';
import CognitoAuthClient, { AuthState, ICognitoConfig } from './CognitoAuthClient';

interface ICognitoAuthContext {
  authState: AuthState,
  authClient?: CognitoAuthClient,
}

const Context = createContext<ICognitoAuthContext>({
  authState: new AuthState(false, false),
});

export function useCognitoAuth() {
  return useContext(Context);
}

interface ICongnitoAuthProviderProps extends ICognitoConfig {
  children: React.ReactNode;
}

export function CognitoAuthProvider({
  children,
  ...config
}: ICongnitoAuthProviderProps) {
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<CognitoAuthClient|undefined>(undefined);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<any>();
  const refSafeConfig = JSON.stringify(config);

  useEffect(() => {
    const client = new CognitoAuthClient(JSON.parse(refSafeConfig));
    setClient(client);

    if (
      window.location.search.includes('code=')
      && window.location.search.includes('state=')
    ) {
      const res = client.handleAuthorizeCallback();
      if (res instanceof Error) {

      } else {
        
      }
    }

    const isAuthenticated = client.isAuthenticated();

    setAuthenticated(isAuthenticated)

    if (isAuthenticated) {
      setUser(client.getUser());
    }

    setLoading(false);
  }, [refSafeConfig]);

  return (
    <Context.Provider
      value={{
        authState: new AuthState(authenticated, false),
        authClient: client,
      }}
    >
      <React.Fragment>
        {children}
      </React.Fragment>
    </Context.Provider>
  )
}