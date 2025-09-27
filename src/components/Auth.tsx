import React, { useState } from 'react';
 import { supabase } from '../lib/supabaseClient';
 import { useTheme } from '../App'; // Import useTheme
 import KolamAnimation from './KolamAnimation'; // Import KolamAnimation
 
 const Auth: React.FC = () => {
   const [loading, setLoading] = useState(false);
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [isSignUp, setIsSignUp] = useState(false);
   const { theme, toggleTheme } = useTheme(); // Use the theme context
 
   const handleLogin = async (event: React.FormEvent) => {
     event.preventDefault();
     setLoading(true);
     const { error } = await supabase.auth.signInWithPassword({ email, password });
 
     if (error) alert(error.message);
     setLoading(false);
   };
 
   const handleSignUp = async (event: React.FormEvent) => {
     event.preventDefault();
     setLoading(true);
     const { error } = await supabase.auth.signUp({ email, password });
 
     if (error) alert(error.message);
     setLoading(false);
   };
 
   const handleGoogleLogin = async () => {
     setLoading(true);
     const { error } = await supabase.auth.signInWithOAuth({
       provider: 'google',
     });
 
     if (error) alert(error.message);
     setLoading(false);
   };
 
   return (
     <div className="relative flex flex-col items-center justify-center min-h-screen bg-background p-4">
       <KolamAnimation /> {/* Add KolamAnimation as background */}
       <div className="relative z-10 w-full max-w-md bg-card shadow-lg rounded-xl p-8 border border-border">
         <h3 className="text-3xl font-bold text-center mb-6 text-foreground">
           {isSignUp ? 'Create Your Account' : 'Welcome Back'}
         </h3>
         <form onSubmit={isSignUp ? handleSignUp : handleLogin}>
           <div className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-foreground" htmlFor="email">Email Address</label>
               <input
                 type="email"
                 placeholder="you@example.com"
                 className="mt-1 block w-full px-4 py-2 border border-input rounded-md shadow-sm focus:ring-primary focus:border-primary bg-background text-foreground"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 required
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-foreground">Password</label>
               <input
                 type="password"
                 placeholder="••••••••"
                 className="mt-1 block w-full px-4 py-2 border border-input rounded-md shadow-sm focus:ring-primary focus:border-primary bg-background text-foreground"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 required
               />
             </div>
             <button
               type="submit"
               className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
               disabled={loading}
             >
               {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Log In')}
             </button>
           </div>
         </form>
         <div className="mt-4">
           <button
             onClick={handleGoogleLogin}
             className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
             disabled={loading}
           >
             <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
               <path fill="#4285F4" d="M23.44 12.292c0-.734-.064-1.44-.184-2.124H12.24v4.01h6.28c-.27 1.44-1.04 2.66-2.26 3.47v2.61h3.35c1.96-1.81 3.09-4.48 3.09-7.61z"/>
               <path fill="#34A853" d="M12.24 23.992c3.23 0 5.93-1.07 7.91-2.9l-3.35-2.61c-.93.62-2.13 1-3.71 1-2.86 0-5.29-1.93-6.16-4.52H2.77v2.69c1.96 3.87 5.93 6.54 9.47 6.54z"/>
               <path fill="#FBBC05" d="M6.08 14.092c-.22-.62-.35-1.28-.35-1.95s.13-1.33.35-1.95V8.19H2.77c-.72 1.44-1.13 3.05-1.13 4.75s.41 3.31 1.13 4.75l3.31-2.61z"/>
               <path fill="#EA4335" d="M12.24 5.852c1.76 0 3.32.61 4.55 1.78l2.97-2.97C18.17 1.992 15.47.992 12.24.992c-3.54 0-7.51 2.67-9.47 6.54l3.31 2.61c.87-2.59 3.3-4.52 6.16-4.52z"/>
             </svg>
             {loading ? 'Loading...' : 'Sign In with Google'}
           </button>
         </div>
         <div className="mt-6 text-center">
           <a
             href="#"
             onClick={() => setIsSignUp(!isSignUp)}
             className="text-sm font-medium text-primary hover:text-primary/90"
           >
             {isSignUp ? 'Already have an account? Log In' : 'Don\'t have an account? Sign Up'}
           </a>
         </div>
         <div className="mt-4 text-center absolute top-4 right-4">
           <button
             onClick={toggleTheme}
             className="text-sm font-medium text-muted-foreground hover:text-foreground focus:outline-none"
           >
             {theme === 'light' ? (
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.93 19.07l1.41-1.41"/><path d="M17.66 6.34l1.41-1.41"/></svg>
             ) : (
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
             )}
           </button>
         </div>
       </div>
     </div>
   );
 };
 
 export default Auth;