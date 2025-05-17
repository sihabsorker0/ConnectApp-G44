
import { Loader2 } from 'lucide-react';
import { Redirect, Route } from 'wouter';

export function AdNetworkProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const isAdNetworkAuthenticated = () => {
    const adNetworkAuth = sessionStorage.getItem('adNetworkAuth');
    if (!adNetworkAuth) return false;
    
    try {
      const auth = JSON.parse(adNetworkAuth);
      return auth && auth.isAdNetwork;
    } catch (e) {
      return false;
    }
  };
  
  const adNetworkAuthed = isAdNetworkAuthenticated();

  if (!adNetworkAuthed) {
    return (
      <Route path={path}>
        <Redirect to="/adnetwork/login" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
