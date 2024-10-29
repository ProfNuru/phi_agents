"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState, useTransition } from "react"
import { register } from "@/actions/auth"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCheck } from "lucide-react"

const formSchema = z.object({
  email: z.string().min(1, {
    message: "E-mail is required.",
  }),
  password:z.string().min(1, {
    message: "Password is required.",
  }),
  password2:z.string().min(1, {
    message: "Password is required.",
  })
})

interface RegisterFormProps {
    switchAuth:(authType:"login"|"register")=>void;
}

const RegisterForm:React.FC<RegisterFormProps> = ({switchAuth}) => {
    const [isPending, startTransition] = useTransition();
    const [formError, setFormError] = useState("");
    const [formSuccess, setFormSuccess] = useState("");
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          email: "",
          password:"",
          password2:"",
        },
      });

      function onSubmit(values: z.infer<typeof formSchema>) {
        setFormError("")
        setFormSuccess("")
        if(values.password!==values.password2){
            setFormError("Password mismatch")
            return;
        }
        startTransition(()=>{
            register(values).then((response)=>{
                if(response.error){
                    setFormError(response.error)
                }else if(response.success){
                    setFormSuccess(response.success)
                    switchAuth("login");
                }
            })
        })
      }

  return (
    <div className="sm:w-[480px] bg-white p-4 shadow-md rounded-md">
        <div className="w-full flex flex-col items-center justify-center my-2">
            <h1 className="text-center text-xl font-bold">🔐 Register</h1>
            <h4 className="text-center text-sm">Create an account and start creating agents</h4>
        </div>
        {formError && formError.trim().length && <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
                {formError}
            </AlertDescription>
        </Alert>}

        {formSuccess && formSuccess.trim().length && <Alert variant="default">
            <CheckCheck className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
                {formSuccess}
            </AlertDescription>
        </Alert>}

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                            <Input disabled={isPending} type="email" placeholder="example@mail.com" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                            <Input disabled={isPending} type="password" placeholder="********" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="password2"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Confirm password</FormLabel>
                        <FormControl>
                            <Input disabled={isPending} type="password" placeholder="********" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />
                <Button disabled={isPending} className="w-full" type="submit">
                    {isPending ? "Registering..." : "Register"}
                </Button>
            </form>
        </Form>
    </div>
  )
}

export default RegisterForm
