import { createSessionClient } from "@/lib/appwrite-server";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/ui/layout/DashboardShell";

export const dynamic = "force-dynamic";

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
    <DashboardShell user={{ name: user.name, email: user.email }}>
      {children}
    </DashboardShell>
  );
}
