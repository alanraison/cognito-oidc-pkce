import React, { createContext, useContext, useEffect, useState } from 'react';
import createAuthClient, { Auth0Client, Auth0ClientOptions, PopupLoginOptions, GetIdTokenClaimsOptions, RedirectLoginOptions, GetTokenSilentlyOptions, GetTokenWithPopupOptions, LogoutOptions, IdToken } from '@auth0/auth0-spa-js';

const DEFAULT_REDIRECT_CALLBACK = () =>
  window.history.replaceState({}, document.title, window.location.pathname);

interface IAuthProviderContext {
  isAuthenticated: boolean;
  user?: any;
  loading: boolean;
  popupOpen: boolean;
  loginWithPopup?: (options: PopupLoginOptions) => Promise<void>,
  handleRedirectCallback?: () => Promise<void>,
  getIdTokenClaims?: (options: GetIdTokenClaimsOptions) => Promise<IdToken>,
  loginWithRedirect?: (options: RedirectLoginOptions) => Promise<void>,
  getTokenSilently?: (options: GetTokenSilentlyOptions) => Promise<any>,
  getTokenWithPopup?: (options: GetTokenWithPopupOptions) => Promise<string>,
  logout?: (options: LogoutOptions) => void,
}

const initialContext: IAuthProviderContext = {
  isAuthenticated: false,
  loading: false,
  popupOpen: false,
}

const AuthContext = createContext<IAuthProviderContext>(initialContext);
export const useAuth = () => useContext(AuthContext);

interface IProviderProps extends Auth0ClientOptions {
  children: React.ReactNode;
  onRedirectCallback?: (state: any) => void;
}

export default function AuthProvider({
  children,
  onRedirectCallback = DEFAULT_REDIRECT_CALLBACK,
  ...initOptions
}: IProviderProps) {
  const referenceSafeOptions = JSON.stringify(initOptions);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>();
  const [authClient, setAuthClient] = useState<Auth0Client>();
  const [loading, setLoading] = useState(true);
  const [popupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    async function init() {
      const client = await createAuthClient(JSON.parse(referenceSafeOptions));
      setAuthClient(client);

      if (window.location.search.includes("code=") &&
          window.location.search.includes("state=")) {
        const { appState } = await client.handleRedirectCallback();
        onRedirectCallback(appState);
      }

      const isAuthenticated = await client.isAuthenticated();
      setIsAuthenticated(isAuthenticated);

      if (isAuthenticated) {
        const user = await client.getUser();
        setUser(user);
      }

      setLoading(false);
    }
    init();
  }, [referenceSafeOptions, onRedirectCallback]);

  const loginWithPopup = async (options: PopupLoginOptions = {}) => {
    if (authClient) {
      setPopupOpen(true);
      try {
        await authClient.loginWithPopup(options);
      } catch (error) {
        console.error(error);
      } finally {
        setPopupOpen(false);
      }
      const user = await authClient.getUser();
      setUser(user);
      setIsAuthenticated(true);
    }
  }
  
  const handleRedirectCallback = async () => {
    if (authClient) {
      setLoading(true);
      await authClient.handleRedirectCallback();
      const user = await authClient.getUser();
      setLoading(false);
      setIsAuthenticated(true);
      setUser(user);
    }
  };

  return (
    <AuthContext.Provider
      value={authClient ? {
        isAuthenticated,
        user,
        loading,
        popupOpen,
        loginWithPopup,
        handleRedirectCallback,
        getIdTokenClaims: (options: GetIdTokenClaimsOptions) => authClient.getIdTokenClaims(options),
        loginWithRedirect: (options: RedirectLoginOptions) => authClient.loginWithRedirect(options),
        getTokenSilently: (options: GetTokenSilentlyOptions) => authClient.getTokenSilently(options),
        getTokenWithPopup: (options: GetTokenWithPopupOptions) => authClient.getTokenWithPopup(options),
        logout: (options: LogoutOptions) => authClient.logout(options),
      } : {
        isAuthenticated,
        user,
        loading,
        popupOpen,
        loginWithPopup,
        handleRedirectCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useMandatoryAuth = () => {
  useEffect(() => {

  });
}