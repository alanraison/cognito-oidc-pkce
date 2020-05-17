import React, { useEffect } from 'react';
import { Route, RouteProps } from 'react-router-dom';
import { useAuth } from './Provider';

export function SecureRoute({ children, ...props }: RouteProps) {
  const { isAuthenticated, loading, loginWithRedirect } = useAuth();
  useEffect(() => {
    (async () => {
      if (!isAuthenticated && loginWithRedirect) {
        await loginWithRedirect({});
      }
    })();
  }, [isAuthenticated, loginWithRedirect]);
  if (!isAuthenticated && !loading) {
    return (
      <Route {...props}>{children}</Route>
    );
  }
  return null;
}
