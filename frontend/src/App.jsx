import { useState } from 'react';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); 
  const [message, setMessage] = useState({ text: '', type: '' });

  const BACKEND_URL = "http://localhost:8000/api/v1/users";

  // --- HELPER FOR MESSAGES ---
  const showMessage = (text, type = 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000); // Clear after 5s
  };

  // --- REGISTER ---
  const handleRegister = async (e) => {
    e.preventDefault();
    showMessage("Registering...", "success");
    
    const form = e.target;
    const formData = new FormData(form);

    try {
      const response = await fetch(`${BACKEND_URL}/register`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (response.ok) {
        showMessage("Registration Successful! Please Login.", "success");
        setView('login');
        form.reset();
      } else {
        showMessage(result.message || "Registration failed");
      }
    } catch (error) {
      showMessage("Network Error: Is the backend running?");
    }
  };

  // --- LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    showMessage("Logging in...", "success");
    
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const response = await fetch(`${BACKEND_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", 
      });
      const result = await response.json();

      if (response.ok) {
        setMessage({ text: '', type: '' }); // Clear loading msg
        setUser(result.data.user);
      } else {
        showMessage(result.message || "Login failed");
      }
    } catch (error) {
      showMessage("Network Error: Is the backend running?");
    }
  };

  // --- LOGOUT ---
  const handleLogout = async () => {
    try {
      await fetch(`${BACKEND_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      setView('login');
      showMessage("Logged out successfully", "success");
    } catch (error) {
      console.log(error);
    }
  };

  // --- PROFILE VIEW ---
  if (user) {
    return (
      <div className="container profile-card">
        <h1>Welcome, {user.fullname}</h1>
        <img src={user.avatar} alt="Avatar" />
        <p>@{user.username}</p>
        <p>{user.email}</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  // --- AUTH FORMS ---
  return (
    <div className="container">
      <h1>{view === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {view === 'register' ? (
        <form onSubmit={handleRegister} encType="multipart/form-data">
          <input type="text" name="fullname" placeholder="Full Name" required />
          <input type="text" name="username" placeholder="Username" required />
          <input type="email" name="email" placeholder="Email Address" required />
          <input type="password" name="password" placeholder="Password" required />
          
          <label>Avatar (Required)</label>
          <input type="file" name="avatar" required accept="image/*" />
          
          <label>Cover Image (Optional)</label>
          <input type="file" name="coverImage" accept="image/*" />
          
          <button type="submit">Sign Up</button>
          <p className="toggle-link" onClick={() => setView('login')}>
            Already have an account? Login
          </p>
        </form>
      ) : (
        <form onSubmit={handleLogin}>
          <input type="text" name="email" placeholder="Email or Username" required />
          <input type="password" name="password" placeholder="Password" required />
          
          <button type="submit">Log In</button>
          <p className="toggle-link" onClick={() => setView('register')}>
            Don't have an account? Sign Up
          </p>
        </form>
      )}
    </div>
  );
}

export default App;