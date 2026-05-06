"use client";

import { signIn } from "@/actions/auth.actions";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/Logo.png";
import Image2 from "@/public/Image.png";
import toast from "react-hot-toast";
import { useTransition, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Trim inputs
    const email = (formData.get("email") as string)?.trim();
    const password = (formData.get("password") as string)?.trim();

    // Client-side validation
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    startTransition(async () => {
      // Update FormData with trimmed values
      const cleanFormData = new FormData();
      cleanFormData.set("email", email);
      cleanFormData.set("password", password);

      const result = await signIn(cleanFormData);
      // If result is undefined it means redirect() was called (success)
      if (result && !result.success) {
        toast.error(result.error);
      }
    });
  }
  return (
    <div className="min-h-screen flex">
      {/* Form side */}
      <div className="flex-1 flex flex-col justify-center px-10 py-12 bg-white">
        <div className="mb-12">
          <Image src={Logo} alt="Maglo Logo" width={120} height={40} priority />
        </div>

        <h1 className="text-[26px] font-bold tracking-tight mb-1">
          Welcome back
        </h1>
        <p className="text-[13px] text-gray-500 mb-8">
          Welcome back! Please enter your details
        </p>

        {/* form action calls the Server Action directly */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="space-y-4 max-w-sm"
        >
          {" "}
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="Enter your email"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-[13px] outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-[13px] outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 rounded-lg bg-[#c5e44e] text-[#1a1a1a] font-bold text-[14px] hover:-translate-y-px hover:shadow-lg hover:shadow-lime-200 transition-all"
          >
            {isPending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-[13px] text-gray-500 mt-5">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-gray-900 underline underline-offset-2"
          >
            Sign up for free
          </Link>
        </p>
      </div>

      {/* Visual side */}
      <div className="hidden md:flex flex-1 bg-[#e8e8e2] items-center justify-center relative overflow-hidden">
        <Image src={Image2} alt="Maglo" fill className="object-contain" />
      </div>
    </div>
  );
}
