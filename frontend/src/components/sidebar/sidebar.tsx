"use client";

import { Session } from "next-auth";
import Image from "next/image";
import { LogoutButton } from "@/components/buttons/logout.button";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateFolderModal } from "@/components/modals/create-folder.modal";
import { UploadFileModal } from "@/components/modals/upload-file.modal";
import { useParams } from "next/navigation";

interface SidebarProps {
  session: Session | null;
}

export const Sidebar = ({ session }: SidebarProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

  const { folderId } = useParams<{ folderId: string }>();

  return (
    <div className="w-64 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-black dark:text-white">Google Drive Clone</h1>
      </div>

      <div className="p-4">
        <div className="relative">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md w-full flex items-center justify-center" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <span className="mr-1">New</span>+
          </Button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  setIsDropdownOpen(false);
                  setIsUploadModalOpen(true);
                }}
              >
                Upload file
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  setIsDropdownOpen(false);
                  setIsFolderModalOpen(true);
                }}
              >
                Create folder
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1"></div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 ">
        <div className="flex items-start flex-col justify-between gap-3">
          <div className="flex items-center">
            {session?.user?.image ? (
              <div className="h-8 w-8 rounded-full overflow-hidden mr-2">
                <Image src={session.user.image} alt={session.user.name || "User"} width={32} height={32} />
              </div>
            ) : (
              <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mr-2">
                <span className="text-sm font-medium">{session?.user?.name?.charAt(0) || "U"}</span>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{session?.user?.name || "Guest"}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{session?.user?.email || ""}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </div>

      {/* Modals */}
      <UploadFileModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} parentId={folderId} />
      <CreateFolderModal isOpen={isFolderModalOpen} onClose={() => setIsFolderModalOpen(false)} parentId={folderId} />
    </div>
  );
};
