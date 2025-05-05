import FolderItem from "@/components/drive/folder-item";
import FileItem from "@/components/drive/file-item";

interface ContentListingProps {
  folders: any[];
  files: any[];
  isLoading: boolean;
  error: any;
  onFolderClick: (folderId: string) => void;
  onFolderDelete: (folderId: string) => void;
  onFolderRename: (folderId: string, newName: string) => void;
  onFileDelete?: (fileId: string) => void;
  onFileRename?: (fileId: string, newName: string) => void;
}

export default function ContentListing({
  folders = [],
  files = [],
  isLoading,
  error,
  onFolderClick,
  onFolderDelete,
  onFolderRename,
  onFileDelete,
  onFileRename,
}: ContentListingProps) {
  const errorMessage = error instanceof Error ? error.message : "Failed to fetch data";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-red-500">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Folders section */}
      {folders && folders.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Folders</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {folders.map((folder: any) => (
              <FolderItem 
                key={folder.id} 
                folder={folder} 
                onClick={() => onFolderClick(folder.id)} 
                onDelete={onFolderDelete}
                onRename={onFolderRename}
              />
            ))}
          </div>
        </div>
      )}

      {/* Files section */}
      {files && files.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">Files</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((file: any) => (
              <FileItem 
                key={file.id} 
                file={file} 
                onDelete={onFileDelete}
                onRename={onFileRename}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {(!folders || folders.length === 0) && (!files || files.length === 0) && (
        <div className="flex flex-col items-center justify-center h-40">
          <p className="text-gray-500 mb-2">This folder is empty</p>
          <p className="text-gray-400 text-sm">Upload files or create folders to get started</p>
        </div>
      )}
    </div>
  );
}