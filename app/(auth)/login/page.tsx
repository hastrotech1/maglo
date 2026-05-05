// src/app/(auth)/login/page.tsx
import { signIn } from "@/actions/auth.actions";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/Logo.png";
import Image2 from "@/public/Image.png";

export default function LoginPage() {
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
        <form action={signIn} className="space-y-4 max-w-sm">
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
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-[13px] outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-[#c5e44e] text-[#1a1a1a] font-bold text-[14px] hover:-translate-y-px hover:shadow-lg hover:shadow-lime-200 transition-all"
          >
            Sign in
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
      <div className="hidden md:flex w-[44%] bg-[#e8e8e2] items-center justify-center p-8">
        <Image
          src={Image2}
          alt="Maglo"
          width={400}
          height={500}
          className="object-contain"
        />
      </div>
    </div>
  );
}
