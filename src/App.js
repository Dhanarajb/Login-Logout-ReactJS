import React, { useState, useEffect } from "react";
// console.log(process.env, "vmfkvmkmk");

const CLIENT_ID = "Ov23liGMseLs9d8k0Ah7";
const CLIENT_SECRET = "3953c8757de87decb65b495aa7f4fd8a5045edf6";
const REDIRECT_URI = "http://localhost:3000";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // Handle GitHub OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      exchangeCodeForToken(code);
    }
  }, []);

  const exchangeCodeForToken = async (code) => {
    try {
      // Exchange code for an access token
      const response = await fetch(
        `https://github.com/login/oauth/access_token`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code,
            redirect_uri: REDIRECT_URI,
          }),
        }
      );
      const data = await response.json();

      if (data.access_token) {
        fetchUserData(data.access_token);
      } else {
        setError("Failed to exchange code for access token.");
      }
    } catch (err) {
      console.error("Error exchanging code for token:", err);
      setError("Error during token exchange.");
    }
  };

  const fetchUserData = async (accessToken) => {
    try {
      const response = await fetch(`https://api.github.com/user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const userData = await response.json();

      setUser(userData);
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Error fetching user data.");
    }
  };

  const handleLogin = () => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=read:user`;
    window.location.href = githubAuthUrl;
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    window.history.pushState({}, document.title, "/"); // Reset URL
  };

  return (
    <div>
      <h1>GitHub OAuth Authentication</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!isAuthenticated ? (
        <button onClick={handleLogin}>Login with GitHub</button>
      ) : (
        <div>
          <h2>Welcome, {user?.login}</h2>
          <img src={user?.avatar_url} alt="User Avatar" width={100} />
          <p>{user?.bio}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
}

export default App;
