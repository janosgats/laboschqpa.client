import React, {FC} from "react";
import RegisterForm from "~/components/join/RegisterForm";
import LoginForm from "~/components/join/LoginForm";


//TODO: Replace with MUI
const LoginWall: FC = () => {
    return (
        <div>
            <h2>Log In</h2>
            <LoginForm/>
            <h2>Register</h2>
            <RegisterForm/>
        </div>
    )
};

export default LoginWall;
