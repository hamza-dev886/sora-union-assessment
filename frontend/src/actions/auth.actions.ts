"use server";

import { signIn } from "@/auth";
import { env } from "@/lib/env";
import { AuthError } from "next-auth";

export async function registerUser(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const response = await fetch(`${env.apiUrl}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Registration failed. Please try again.",
    };  
  }
}

export async function login(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    console.log("Login attempt for email:", email);
    
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    console.log("SignIn result:", result);

    if (result?.error) {
      throw new AuthError(result.error);
    }

    return { success: true };
  } catch (error) {
    console.error("Login action error:", error);
    
    if (error instanceof AuthError) {
      switch (error.name) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid email or password" };
        default:
          return { success: false, error: `Authentication error: ${error.message}` };
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Login failed. Please try again.",
    };
  }
}
