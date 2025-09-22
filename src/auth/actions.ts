"use client";

import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { LoginSchema, RegisterSchema } from "./schemas";
import * as z from "zod";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  try {
    const validatedFields = LoginSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }

    const { email, password } = validatedFields.data;

    await signInWithEmailAndPassword(auth, email, password);
    return { success: "Logged in!" };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong!" };
  }
};

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    return { success: "Logged in!" };
  } catch (error: any) {
    console.error(error);
    if (error.code === 'auth/popup-closed-by-user') {
      return { error: "Ventana cerrada por el usuario" };
    }
    return { error: "Something went wrong!" };
  }
};

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  try {
    const validatedFields = RegisterSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Campos inválidos!" };
    }

    const { name, email, password } = validatedFields.data;

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, {
      displayName: name
    });
    
    return { success: "¡Cuenta creada exitosamente!" };
  } catch (error: any) {
    console.error(error);
    
    if (error.code === 'auth/email-already-in-use') {
      return { error: "Este email ya está registrado" };
    }
    if (error.code === 'auth/weak-password') {
      return { error: "La contraseña es muy débil. Debe tener al menos 6 caracteres" };
    }
    if (error.code === 'auth/invalid-email') {
      return { error: "El formato del email no es válido" };
    }
    if (error.code === 'auth/operation-not-allowed') {
      return { error: "El registro con email/contraseña no está habilitado" };
    }
    
    if (error.code === 'auth/network-request-failed') {
      return { error: "Error de conexión. Verifica tu conexión a internet" };
    }
    if (error.code === 'auth/timeout') {
      return { error: "La operación ha expirado. Inténtalo de nuevo" };
    }
    
    if (error.code === 'auth/too-many-requests') {
      return { error: "Demasiados intentos. Inténtalo más tarde" };
    }
    
    if (error.code === 'auth/internal-error') {
      return { error: "Error interno del servidor. Inténtalo más tarde" };
    }
    
    return { error: "Error al crear la cuenta. Inténtalo de nuevo" };
  }
};