from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import subprocess
import tempfile
import os
from typing import Optional, Dict, Any, List
import json
from datetime import datetime
import uuid
from sqlalchemy.orm import Session
from .models import Project, CodeFile, Folder  # Add Folder to imports
from . import schemas, database

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# In-memory storage (replace with database in production)
projects: Dict[str, Project] = {}

class CodeExecutionRequest(BaseModel):
    code: str
    language: str
    input_data: Optional[Dict[str, Any]] = None

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

class CodeFileCreate(BaseModel):
    name: str
    content: str
    language: str

async def execute_python(code: str, input_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    import httpx
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                'http://code-runner:8001/execute',
                json={
                    'code': code,
                    'language': 'python',
                    'input_data': input_data
                },
                timeout=15.0
            )
            
            if response.status_code != 200:
                error_detail = response.json().get('detail', 'Code execution failed')
                raise HTTPException(status_code=response.status_code, detail=error_detail)
                
            return response.json()
    except httpx.TimeoutException:
        raise HTTPException(status_code=408, detail="Code execution timed out")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/execute")
async def execute_code(request: CodeExecutionRequest):
    if not request.code or not request.language:
        raise HTTPException(status_code=400, detail="Code and language are required")

    try:
        if request.language.lower() == 'python':
            result = await execute_python(request.code, request.input_data)
            return {
                'output': result.get('output', ''),
                'error': result.get('error', '')
            }
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported language: {request.language}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Project endpoints
@app.get("/projects", response_model=List[schemas.Project])
def get_projects(db: Session = Depends(get_db)):
    return db.query(Project).all()

@app.post("/projects", response_model=schemas.Project)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    db_project = Project(
        id=str(uuid.uuid4()),
        name=project.name,
        description=project.description,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.get("/projects/{project_id}", response_model=schemas.Project)
def get_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@app.delete("/projects/{project_id}")
def delete_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Delete all files associated with the project
    db.query(CodeFile).filter(CodeFile.project_id == project_id).delete()
    
    # Delete the project
    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}

# File endpoints
@app.get("/projects/{project_id}/files", response_model=List[schemas.CodeFile])
def get_project_files(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return db.query(CodeFile).filter(CodeFile.project_id == project_id).all()

@app.post("/projects/{project_id}/files", response_model=schemas.CodeFile)
def create_file(project_id: str, file: schemas.CodeFileCreate, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db_file = CodeFile(
        id=str(uuid.uuid4()),
        project_id=project_id,
        name=file.name,
        content=file.content,
        language=file.language,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    return db_file

@app.put("/projects/{project_id}/files/{file_id}", response_model=schemas.CodeFile)
def update_file(
    project_id: str,
    file_id: str,
    file_update: schemas.CodeFileUpdate,
    db: Session = Depends(get_db)
):
    db_file = db.query(CodeFile).filter(
        CodeFile.id == file_id,
        CodeFile.project_id == project_id
    ).first()
    
    if db_file is None:
        raise HTTPException(status_code=404, detail="File not found")
    
    for field, value in file_update.dict(exclude_unset=True).items():
        setattr(db_file, field, value)
    
    db_file.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_file)
    return db_file

@app.delete("/projects/{project_id}/files/{file_id}")
def delete_file(project_id: str, file_id: str, db: Session = Depends(get_db)):
    db_file = db.query(CodeFile).filter(
        CodeFile.id == file_id,
        CodeFile.project_id == project_id
    ).first()
    
    if db_file is None:
        raise HTTPException(status_code=404, detail="File not found")
    
    db.delete(db_file)
    db.commit()
    return {"message": "File deleted successfully"}

@app.get("/projects/{project_id}/folders", response_model=List[schemas.Folder])
def get_project_folders(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return db.query(Folder).filter(Folder.project_id == project_id).all()

@app.delete("/projects/{project_id}/folders/{folder_id}")
def delete_folder(project_id: str, folder_id: str, db: Session = Depends(get_db)):
    folder = db.query(Folder).filter(
        Folder.id == folder_id,
        Folder.project_id == project_id
    ).first()
    if folder is None:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    db.delete(folder)
    db.commit()
    return {"message": "Folder deleted successfully"}

@app.post("/projects/{project_id}/folders", response_model=schemas.Folder)
async def create_folder(project_id: str, folder: schemas.FolderCreate, db: Session = Depends(get_db)):
    print(f"Creating folder with params: project_id={project_id}, folder={folder}")
    
    # Check if project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
 
    
    # If parentId is provided, check if parent folder exists
    if folder.parentId:
        print(f"Checking parent folder: {folder.parentId}")
        parent_folder = db.query(Folder).filter(
            Folder.id == folder.parentId,
            Folder.project_id == project_id
        ).first()
        if not parent_folder:
            print(f"Parent folder not found: {folder.parentId}")
            raise HTTPException(status_code=404, detail="Parent folder not found")
        print(f"Found parent folder: {parent_folder.id} - {parent_folder.name}")
    
    try:
        # Create new folder
        db_folder = Folder(
            id=str(uuid.uuid4()),
            project_id=project_id,
            parent_id=folder.parentId,
            name=folder.name
        )
        print(f"Creating folder object: {db_folder.id} - {db_folder.name}")
        
        db.add(db_folder)
        db.commit()
        db.refresh(db_folder)
        print(f"Folder created successfully: {db_folder.id}")
        return db_folder
    except Exception as e:
        print(f"Error creating folder: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create folder: {str(e)}")

@app.put("/projects/{project_id}/files/{file_id}/move", response_model=schemas.CodeFile)
def move_file(project_id: str, file_id: str, folder_id: Optional[str] = None, db: Session = Depends(get_db)):
    # Check if file exists and belongs to the project
    file = db.query(CodeFile).filter(
        CodeFile.id == file_id,
        CodeFile.project_id == project_id
    ).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    # If folder_id is provided, check if folder exists and belongs to the project
    if folder_id:
        folder = db.query(Folder).filter(
            Folder.id == folder_id,
            Folder.project_id == project_id
        ).first()
        if not folder:
            raise HTTPException(status_code=404, detail="Destination folder not found")
    
    # Update file's folder
    file.folder_id = folder_id
    db.commit()
    db.refresh(file)
    return file

@app.get("/health")
async def health_check():
    return {"status": "healthy"}