export const signupContext = `
<style>
    @media (min-width: 480px) and (max-width: 980px) {
    .Form-div {
        padding: 1.5rem;
    }
    .signup-Form-div{
        padding: 1.5rem;
    }
    .Form-div {
        height: 100%;
    }

    label {
        font-size: 1.2rem;
    }
}

</style>
    <div class="Form-div">
        <form class="loggin siggnup" id="signUpForm" >
            <label>Signup</label><br>
            <input type="text" name="username" class="input" placeholder="Username" required><br>
            <input type="text" name="firstName" class="input" placeholder="First Name" required><br>
            <input type="text" name="lastName" class="input" placeholder="Last Name" required><br>
                <select name="gender" class="input" required>
                    <option value="" disabled selected>Gender (Male/Female/Other)</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select><br>
            <input type="number" name="age" class="input" placeholder="Age" min=1 required><br>
            <input type="email" name="email" class="input" placeholder="email-address" required><br>
            <input type="password" name="password" class="input" placeholder="password" required><br>
            <input type="password" name="password2" class="input" placeholder="Confirm password" required><br>
            <input type="submit" value="Sign-up">
        </form>
      <p>Have an account? <button id="loginBtn">login</button> </p> 
    </div>
`