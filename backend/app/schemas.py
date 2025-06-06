from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class CodeExecution(BaseModel):
    code: str
    language: str


class CodeFileBase(BaseModel):
    name: str
    content: str
    language: str


class CodeFileCreate(CodeFileBase):
    pass


class CodeFileUpdate(BaseModel):
    name: Optional[str] = None
    content: Optional[str] = None
    language: Optional[str] = None


class CodeFile(CodeFileBase):
    id: str
    project_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class FolderBase(BaseModel):
    name: str
    parentId: Optional[str] = None  # Changed from parent_id to parentId


class FolderCreate(FolderBase):
    pass


class Folder(FolderBase):
    id: str
    project_id: str
    files: List[CodeFile] = []
    subfolders: List['Folder'] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Project(ProjectBase):
    id: str
    files: List[CodeFile] = []
    folders: List[Folder] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True