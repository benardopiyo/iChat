// File: frontend/static/js/pageContext/login.js

export const signinContext = `
    <div class="Form-div">
        <form class="loggin siggnup" id="loginForm">
            <label>Welcome Back</label>
            <input type="text" class="input" placeholder="Email or Username" name="email" required>
            <input type="password" class="input" placeholder="Password" name="password" required>
            <input type="submit" value="Sign In" id="form-loginBtn">
        </form>
        <p>Don't have an account? <button id="signUpBtn">Create one</button></p> 
    </div>
`;