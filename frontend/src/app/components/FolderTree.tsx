import * as React from 'react';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { Folder as FolderIcon } from '@mui/icons-material';
import { FolderOpen as FolderOpenIcon } from '@mui/icons-material';
import { InsertDriveFile as InsertDriveFileIcon } from '@mui/icons-material';
import { CreateNewFolder as CreateNewFolderIcon } from '@mui/icons-material';
import { AddCircleOutline as AddFileIcon } from '@mui/icons-material';
import { IconButton, Menu, MenuItem, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

interface FolderTreeProps {
  folders: Folder[];
  files: CodeFile[];
  onFileSelect: (file: CodeFile) => void;
  onFolderSelect: (folder: Folder) => void;
  onCreateFolder: (name: string, parentId: string | null) => void;
  onMoveFile: (fileId: string, targetFolderId: string) => void;
  selectedFileId?: string;
}

const FolderTree: React.FC<FolderTreeProps> = ({
  folders,
  files,
  onFileSelect,
  onFolderSelect,
  onCreateFolder,
  onMoveFile,
  selectedFileId
}) => {
  const [expanded, setExpanded] = React.useState<string[]>([]);
  const [contextMenu, setContextMenu] = React.useState<{
    mouseX: number;
    mouseY: number;
    folderId: string | null;
    fileId?: string;
  } | null>(null);

  const [newFolderDialog, setNewFolderDialog] = React.useState(false);
  const [newFolderName, setNewFolderName] = React.useState('');
  const [currentFolderId, setCurrentFolderId] = React.useState<string | null>(null);

  // Convert folders and files into items structure
  const convertToItems = (folders: Folder[], parentFiles: CodeFile[]) => {
    return [
      ...folders.map(folder => ({
        id: folder.id,
        label: folder.name,
        children: [
          ...folder.files.map(file => ({
            id: `file-${file.id}`,
            label: file.name,
            icon: <InsertDriveFileIcon fontSize="small" style={{ marginRight: 8 }} />
          })),
          ...convertToItems(folder.subfolders, [])
        ],
        icon: <FolderIcon />,
        expandIcon: <FolderIcon />,
        collapseIcon: <FolderOpenIcon />,
        actions: (
          <div style={{ display: 'flex' }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentFolderId(folder.id);
                setNewFolderDialog(true);
              }}
            >
              <CreateNewFolderIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                // Handle file creation
              }}
            >
              <AddFileIcon fontSize="small" />
            </IconButton>
          </div>
        )
      })),
      ...parentFiles.map(file => ({
        id: `root-file-${file.id}`,
        label: file.name,
        icon: <InsertDriveFileIcon fontSize="small" style={{ marginRight: 8 }} />
      }))
    ];
  };

  const items = convertToItems(folders, files.filter(file => !file.folder_id));

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <RichTreeView
        items={items}
        expanded={expanded}
        onNodeExpansionChange={(nodeIds: string[]) => setExpanded(nodeIds)}
      />

      <Dialog open={newFolderDialog} onClose={() => setNewFolderDialog(false)}>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewFolderDialog(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (newFolderName.trim()) {
                onCreateFolder(newFolderName, currentFolderId);
                setNewFolderName('');
                setNewFolderDialog(false);
              }
            }}
            variant="contained"
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FolderTree;
