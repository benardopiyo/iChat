// File: frontend/static/js/pageContext/signup.js

export const signupContext = `
    <div class="Form-div">
        <form class="loggin siggnup" id="signUpForm">
            <label>Join RealForum</label>
            <input type="text" name="username" class="input" placeholder="Username" required>
            <input type="text" name="firstName" class="input" placeholder="First Name" required>
            <input type="text" name="lastName" class="input" placeholder="Last Name" required>
            <select name="gender" class="input" required>
                <option value="" disabled selected>Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
            </select>
            <input type="number" name="age" class="input" placeholder="Age" min="13" max="120" required>
            <input type="email" name="email" class="input" placeholder="Email Address" required>
            <input type="password" name="password" class="input" placeholder="Password (min. 8 characters)" required>
            <input type="password" name="password2" class="input" placeholder="Confirm Password" required>
            <input type="submit" value="Create Account">
        </form>
        <p>Already have an account? <button id="loginBtn">Sign in</button></p> 
    </div>
`;