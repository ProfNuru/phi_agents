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
import { login } from "@/actions/auth"
import { useState, useTransition } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCheck } from "lucide-react"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  email: z.string().min(1, {
    message: "E-mail is required.",
  }),
  password:z.string().min(1, {
    message: "Password is required.",
  })
})


const LoginForm = () => {
    const [isPending, startTransition] = useTransition();
    const [formError, setFormError] = useState("");
    const [formSuccess, setFormSuccess] = useState("");
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          email: "",
          password:""
        },
      });

      const router = useRouter();

      function onSubmit(values: z.infer<typeof formSchema>) {
        setFormError("")
        setFormSuccess("")
        startTransition(()=>{
            login(values).then((response)=>{
                if(response.error){
                    setFormError(response.error)
                }else if(response.success){
                    setFormSuccess(response.success)
                    router.push("/dashboard")
                }
            })
        })
      }

  return (
    <div className="sm:w-[480px] bg-white p-4 shadow-md rounded-md">
        <div className="w-full flex flex-col items-center justify-center my-2">
            <h1 className="text-center text-xl font-bold">🔐 Login</h1>
            <h4 className="text-center text-sm">Login and start creating your own agents</h4>
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
                            <Input disabled={isPending} placeholder="example@mail.com" {...field} />
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
                <Button
                disabled={isPending}
                className="w-full"
                type="submit">
                    {isPending ? "Logging in..." : "Login"}
                </Button>
            </form>
        </Form>
    </div>
  )
}

export default LoginForm
