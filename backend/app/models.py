from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    files = relationship("CodeFile", back_populates="project", cascade="all, delete-orphan")
    folders = relationship("Folder", back_populates="project", cascade="all, delete-orphan")


class Folder(Base):
    __tablename__ = "folders"

    id = Column(String, primary_key=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    parent_id = Column(String, ForeignKey("folders.id"), nullable=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", back_populates="folders")
    parent = relationship("Folder", remote_side=[id], backref="subfolders")
    files = relationship("CodeFile", back_populates="folder")


class CodeFile(Base):
    __tablename__ = "code_files"

    id = Column(String, primary_key=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    folder_id = Column(String, ForeignKey("folders.id"), nullable=True)
    name = Column(String, nullable=False)
    content = Column(String, nullable=False)
    language = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", back_populates="files")
    folder = relationship("Folder", back_populates="files")
    versions = relationship("CodeFileVersion", back_populates="code_file", cascade="all, delete-orphan")


class CodeFileVersion(Base):
    __tablename__ = "code_file_versions"

    id = Column(String, primary_key=True)
    file_id = Column(String, ForeignKey("code_files.id"), nullable=False)
    content = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    code_file = relationship("CodeFile", back_populates="versions")