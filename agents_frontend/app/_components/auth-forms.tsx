"use client"

import { useState } from "react"
import LoginForm from "./login-form"
import RegisterForm from "./register-form"
import { Button } from "@/components/ui/button"

const AuthForms = () => {
    const [authType, setAuthType] = useState<"login"|"register">("login")

    const switchAuthType = (authType:"login"|"register") => {
        setAuthType(authType);
    }

    console.log({ROUTE:window.location});

  return (
    <div className="flex flex-col">
        <div className="flex w-full">
            <Button
            onClick={()=>setAuthType("login")}
            variant={authType==="login" ? "default" : "outline"}
            className="flex-grow rounded-none rounded-tl-md">Login</Button>
            <Button
            onClick={()=>setAuthType("register")}
            variant={authType==="register" ? "default" : "outline"}
            className="flex-grow rounded-none rounded-tr-md">Register</Button>
        </div>
        {authType === "login" && <LoginForm/>}
        {authType === "register" && <RegisterForm switchAuth={switchAuthType} />}
    </div>
  )
}

export default AuthForms
