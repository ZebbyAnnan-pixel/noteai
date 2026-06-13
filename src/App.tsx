import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/auth-context';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import NotebookWorkspace from './components/NotebookWorkspace';
import { supabase, Notebook } from './lib/supabase';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | 'auth' | 'dashboard' | 'notebook'>('landing');
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (user) {
        setCurrentView('dashboard');
      } else if (showAuth) {
        setCurrentView('auth');
      } else {
        setCurrentView('landing');
      }
    }
  }, [user, loading, showAuth]);

  const handleGetStarted = () => {
    if (user) {
      setCurrentView('dashboard');
    } else {
      setShowAuth(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
    setCurrentView('dashboard');
  };

  const handleOpenNotebook = (notebook: Notebook) => {
    setSelectedNotebook(notebook);
    setCurrentView('notebook');
  };

  const handleCloseNotebook = () => {
    setSelectedNotebook(null);
    setCurrentView('dashboard');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentView('landing');
    setShowAuth(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  switch (currentView) {
    case 'auth':
      return <AuthPage onSuccess={handleAuthSuccess} onBack={() => setShowAuth(false)} />;
    case 'dashboard':
      return (
        <Dashboard
          onOpenNotebook={handleOpenNotebook}
          onSignOut={handleSignOut}
        />
      );
    case 'notebook':
      return selectedNotebook ? (
        <NotebookWorkspace
          notebook={selectedNotebook}
          onBack={handleCloseNotebook}
          onSignOut={handleSignOut}
        />
      ) : null;
    default:
      return <LandingPage onGetStarted={handleGetStarted} />;
  }
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
