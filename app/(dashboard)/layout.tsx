import { createSessionClient } from "@/lib/appwrite-server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/ui/layout/Sidebar";
import Topbar from "@/components/ui/layout/Topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Double-check session server-side (middleware is the first gate,
  // this is the second — defence in depth)
  let user;
  try {
    const { account } = await createSessionClient();
    user = await account.get();
  } catch {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar user={{ name: user.name, email: user.email }} />
        <main className="flex-1 overflow-y-auto p-6 bg-[#FFFFFF]">
          {children}
        </main>
      </div>
    </div>
  );
}
