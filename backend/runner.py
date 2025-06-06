import os
import sys
import json
import subprocess
import tempfile
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from contextlib import contextmanager
import resource
import signal

app = FastAPI()

class CodeExecutionRequest(BaseModel):
    code: str
    language: str
    input_data: Optional[Dict[str, Any]] = None

def set_resource_limits():
    """Set resource limits for the code execution"""
    # 128MB memory limit
    memory_limit = 128 * 1024 * 1024
    resource.setrlimit(resource.RLIMIT_AS, (memory_limit, memory_limit))
    # 5 seconds CPU time limit
    resource.setrlimit(resource.RLIMIT_CPU, (5, 5))
    # 1MB file size limit
    resource.setrlimit(resource.RLIMIT_FSIZE, (1024 * 1024, 1024 * 1024))

@contextmanager
def sandbox_environment():
    """Create a sandboxed environment for code execution"""
    original_dir = os.getcwd()
    with tempfile.TemporaryDirectory(dir='/app/temp') as temp_dir:
        os.chdir(temp_dir)
        try:
            yield temp_dir
        finally:
            os.chdir(original_dir)

def execute_python_code(code: str, input_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Execute Python code in a sandboxed environment with resource limits"""
    with sandbox_environment() as temp_dir:
        script_path = os.path.join(temp_dir, 'script.py')
        
        # Write code to temporary file
        with open(script_path, 'w') as f:
            if input_data:
                f.write(f"input_data = {json.dumps(input_data)}\n")
            f.write(code)
        
        try:
            # Create a new Python process with resource limits
            process = subprocess.Popen(
                [sys.executable, script_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                preexec_fn=set_resource_limits,
                text=True
            )
            
            try:
                stdout, stderr = process.communicate(timeout=5)
                return {
                    'output': stdout,
                    'error': stderr,
                    'returncode': process.returncode
                }
            except subprocess.TimeoutExpired:
                process.kill()
                raise HTTPException(status_code=408, detail="Code execution timed out")
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.post("/execute")
async def execute_code(request: CodeExecutionRequest):
    """Execute code in the specified language"""
    if request.language.lower() != 'python':
        raise HTTPException(status_code=400, detail="Only Python execution is supported")
    
    try:
        result = execute_python_code(request.code, request.input_data)
        if result['returncode'] != 0:
            return {
                'error': result['error'] or 'Execution failed',
                'output': result['output']
            }
        return {
            'output': result['output'],
            'error': result['error']
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8001)