"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/actions/auth.actions";
import Logo from "@/public/Logo.png";
import {
  LayoutDashboard,
  FileText,
  ArrowLeftRight,
  Wallet,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/wallets", label: "My Wallets", icon: Wallet },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[210px] flex-shrink-0 bg-[#FAFAFA] flex flex-col py-5 px-3">
      {/* Logo */}
      <div className="px-2 mb-6">
        <Image
          src={Logo}
          alt="Maglo Logo"
          width={100}
          height={32}
          className="w-auto h-8"
        />
      </div>

      {/* Main nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium
                transition-all duration-200 ease-in-out
                ${
                  isActive
                    ? "bg-[#c5e44e] text-[#1a1a1a]"
                    : "text-gray-500 hover:bg-white/[0.07] hover:text-gray-300"
                }
              `}
            >
              <Icon
                size={15}
                className={isActive ? "opacity-100" : "opacity-55"}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom nav */}
      <div className="flex flex-col gap-1 mt-4 border-t border-white/10 pt-4">
        <Link
          href="/help"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium text-gray-500 hover:bg-white/[0.07] hover:text-gray-300 transition-all duration-200"
        >
          <HelpCircle size={15} className="opacity-55" />
          Help
        </Link>

        {/* signOut is a Server Action — form submission is the
            correct way to call it from a Client Component */}
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium text-gray-500 hover:bg-white/[0.07] hover:text-gray-300 transition-all duration-200"
          >
            <LogOut size={15} className="opacity-55" />
            Logout
          </button>
        </form>
      </div>
    </aside>
  );
}
