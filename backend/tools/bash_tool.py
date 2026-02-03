"""
REAL Bash Tool - Actually executes bash commands
Security: Sandboxed to project directory
"""

import subprocess
import os
from pathlib import Path
from typing import Dict, Any
import requests

class BashTool:
    def __init__(self, sandbox_dir: str = None):
        """Initialize bash tool with sandbox directory"""
        if sandbox_dir is None:
            self.sandbox_dir = Path(__file__).parent.parent.parent.absolute()
        else:
            self.sandbox_dir = Path(sandbox_dir).absolute()
        
        self.sandbox_dir.mkdir(parents=True, exist_ok=True)
        print(f"BashTool initialized: {self.sandbox_dir}")
    
    def _is_safe_command(self, command: str) -> bool:
        """Check if command is safe"""
        dangerous = [
            'rm -rf /', 'mkfs', 'dd if=', ':(){:|:&};:', 
            'chmod 777', 'sudo', 'su ', 'shutdown',
            'reboot', 'halt', 'poweroff', '> /dev/', 'mkfs',
            'fdisk', 'parted', 'wipefs'
        ]
        
        cmd_lower = command.lower()
        return not any(d in cmd_lower for d in dangerous)
    
    def execute(self, command: str) -> Dict[str, Any]:
        """Execute a bash command REAL - not mocked"""
        if not self._is_safe_command(command):
            return {
                "success": False,
                "stdout": "",
                "stderr": "Command blocked for security",
                "returncode": -1
            }
        
        try:
            print(f"🔧 Executing: {command}")
            result = subprocess.run(
                command,
                shell=True,
                cwd=str(self.sandbox_dir),
                capture_output=True,
                text=True,
                timeout=60
            )
            
            print(f"{'' if result.returncode == 0 else ''} Return code: {result.returncode}")
            
            return {
                "success": result.returncode == 0,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "returncode": result.returncode
            }
            
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "stdout": "",
                "stderr": "Command timed out",
                "returncode": -1
            }
        except Exception as e:
            return {
                "success": False,
                "stdout": "",
                "stderr": f"Error: {str(e)}",
                "returncode": -1
            }
    
    def download_image(self, url: str, output_filename: str) -> Dict[str, Any]:
        """
        REAL image download from internet using requests
        NO MOCK DATA - actually downloads the image!
        """
        try:
            print(f"Downloading image from: {url}")
            
            
            output_path = self.sandbox_dir / "static" / "images" / output_filename
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            response = requests.get(url, headers=headers, timeout=30, stream=True)
            response.raise_for_status()
            
            
            with open(output_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            
            if output_path.exists() and output_path.stat().st_size > 0:
                file_size = output_path.stat().st_size
                print(f"Image downloaded: {output_filename} ({file_size} bytes)")
                
                return {
                    "success": True,
                    "message": f"Downloaded {output_filename}",
                    "path": f"static/images/{output_filename}",
                    "size": file_size
                }
            else:
                return {
                    "success": False,
                    "message": "File not created or empty",
                    "path": None
                }
            
        except requests.exceptions.RequestException as e:
            print(f"Download failed: {e}")
            return {
                "success": False,
                "message": f"Download error: {str(e)}",
                "path": None
            }
        except Exception as e:
            print(f" Error: {e}")
            return {
                "success": False,
                "message": f"Error: {str(e)}",
                "path": None
            }


def bash_execute(command: str) -> str:
    """Execute a bash command"""
    tool = BashTool()
    result = tool.execute(command)
    
    if result["success"]:
        return f" Success:\n{result['stdout']}"
    else:
        return f" Error:\n{result['stderr']}"

def download_image(url: str, filename: str) -> str:
    """Download an image from URL - REAL download, not mock!"""
    tool = BashTool()
    result = tool.download_image(url, filename)
    
    if result["success"]:
        return f" Downloaded: {result['path']} ({result.get('size', 0)} bytes)"
    else:
        return f" Failed: {result['message']}"
