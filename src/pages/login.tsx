import { auth, provider } from "../config/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [pass, setPass] = useState<string>("");

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, provider);
    navigate("/");
  };

  const loginWithEmail = async () => {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    navigate("/");
  };

  return (
    <div>
      <div className="post">
        <p className="login-text"> Login to continue</p>
        <Link to="/signup">New user?</Link>
        <p></p>
        <label>Email</label>
        <input onChange={(e) => setEmail(e.target.value)} />
        <label>Password</label>
        <input type="password" onChange={(e) => setPass(e.target.value)} />
        <button onClick={loginWithEmail}>Login</button>
        <button onClick={loginWithGoogle}>Login with Google</button>
      </div>
    </div>
  );
};
