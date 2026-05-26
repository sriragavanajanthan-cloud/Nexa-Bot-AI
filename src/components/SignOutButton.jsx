import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function SignOutButton() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // Redirect to the app's login page (which is at /app)
    navigate('/app');
  };

  return (
    <button onClick={handleSignOut} className="sign-out-btn">
      Sign Out
    </button>
  );
}
