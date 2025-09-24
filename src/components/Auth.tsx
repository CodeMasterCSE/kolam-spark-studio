import React, { useState } from 'react';
 import { supabase } from '../lib/supabaseClient';
 import { useTheme } from '../App'; // Import useTheme
 
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
 
   return (
     <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
       <div className="w-full max-w-md bg-card shadow-lg rounded-xl p-8 border border-border">
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
         <div className="mt-6 text-center">
           <a
             href="#"
             onClick={() => setIsSignUp(!isSignUp)}
             className="text-sm font-medium text-primary hover:text-primary/90"
           >
             {isSignUp ? 'Already have an account? Log In' : 'Don\'t have an account? Sign Up'}
           </a>
         </div>
         <div className="mt-4 text-center">
           <button
             onClick={toggleTheme}
             className="text-sm font-medium text-muted-foreground hover:text-foreground focus:outline-none"
           >
             Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
           </button>
         </div>
       </div>
     </div>
   );
 };
 
 export default Auth;