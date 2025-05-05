import { auth } from "@/auth";
import { Sidebar } from "@/components/sidebar/sidebar";

interface LayoutProps {
  params: Promise<{
    folderId: string;
  }>;
  children: React.ReactNode;
}

export default async function Layout({ children }: LayoutProps) {
  const session = await auth();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar session={session} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
    </div>
  );
}
