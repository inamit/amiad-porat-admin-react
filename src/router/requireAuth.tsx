import { auth } from '../firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const RequireAuth = ({ children }) => {
  const [user, loading, error] = useAuthState(auth);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      // Redirect them to the /login page, but save the current location they were
      // trying to go to when they were redirected. This allows us to send them
      // along to that page after they login, which is a nicer user experience
      // than dropping them off on the home page.
      return navigate('/login', { replace: true, state: { from: location } });
      // return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }, []);

  return children;
};

export default RequireAuth;
