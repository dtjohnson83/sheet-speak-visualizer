import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [activeTab, setActiveTab] = useState('signin');
  const { signUp, signIn, resetPassword, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle URL parameters and redirect logic
  useEffect(() => {
    const confirmed = searchParams.get('confirmed');
    const reset = searchParams.get('reset');
    
    if (confirmed === 'true') {
      setMessage('Email confirmed! You can now sign in to your account.');
      setActiveTab('signin');
    }
    
    if (reset === 'true') {
      setMessage('Password reset email sent! Check your email for the reset link.');
      setActiveTab('signin');
    }
    
    if (user && !confirmed && !reset) {
      navigate('/app');
    }
  }, [user, navigate, searchParams]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    
    const { error } = await signUp(email, password, fullName);
    
    if (error) {
      if (error.message.includes('already registered')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError(error.message);
      }
    } else {
      setMessage('Check your email for the confirmation link!');
      // Don't switch tabs immediately - keep user on signup tab to see the message
    }
    
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    
    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
    } else {
      navigate('/app');
    }
    
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    
    const { error } = await resetPassword(resetEmail);
    
    if (error) {
      setError(error.message);
    } else {
      setMessage('Password reset email sent! Check your email for the reset link.');
      setActiveTab('signin');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Link to="/">
              <img 
                src="/lovable-uploads/a7a4a136-9773-4c6c-b3e7-97e3c66f0c08.png" 
                alt="Charta Logo" 
                className="h-20 w-auto md:h-24 hover:opacity-80 transition-opacity cursor-pointer"
              />
            </Link>
          </div>
          <Link to="/" className="text-sm text-blue-600 hover:text-blue-800">
            ← Back to home
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            {message && (
              <Alert className="mb-4">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                <TabsTrigger value="reset">Reset Password</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                  
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab('reset')}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Forgot your password?
                    </button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                   {error && (
                     <Alert variant="destructive">
                       <AlertDescription>{error}</AlertDescription>
                     </Alert>
                   )}
                   
                   <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="reset">
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resetEmail">Email</Label>
                    <Input
                      id="resetEmail"
                      type="email"
                      placeholder="Enter your email address"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {message && (
                    <Alert>
                      <AlertDescription>{message}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Sending reset email...' : 'Reset Password'}
                  </Button>
                  
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab('signin')}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Back to sign in
                    </button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
