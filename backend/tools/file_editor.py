from pathlib import Path
from typing import Dict, Any

class FileEditorTool:
    def __init__(self, base_dir: str = None):
        """Initialize file editor"""
        if base_dir is None:
            self.base_dir = Path(__file__).parent.parent.parent.absolute()
        else:
            self.base_dir = Path(base_dir).absolute()
        
        print(f" FileEditor initialized: {self.base_dir}")
    
    def _get_safe_path(self, file_path: str) -> Path:
        full_path = (self.base_dir / file_path).resolve()
        
        if not str(full_path).startswith(str(self.base_dir)):
            raise ValueError(f"Access denied: path outside base directory")
        
        return full_path
    
    def write_file(self, file_path: str, content: str) -> Dict[str, Any]:
        try:
            full_path = self._get_safe_path(file_path)
            full_path.parent.mkdir(parents=True, exist_ok=True)
            
            print(f" Writing file: {file_path}")
            full_path.write_text(content, encoding='utf-8')
            
            if full_path.exists():
                file_size = full_path.stat().st_size
                print(f" File written: {file_path} ({file_size} bytes)")
                
                return {
                    "success": True,
                    "message": f"Written: {file_path}",
                    "path": file_path,
                    "size": file_size
                }
            else:
                return {
                    "success": False,
                    "message": "File not created",
                    "path": None
                }
            
        except Exception as e:
            print(f" Write error: {e}")
            return {
                "success": False,
                "message": f"Error: {str(e)}",
                "path": None
            }
    
    def read_file(self, file_path: str) -> Dict[str, Any]:
        try:
            full_path = self._get_safe_path(file_path)
            
            if not full_path.exists():
                return {
                    "success": False,
                    "message": f"File not found: {file_path}",
                    "content": None
                }
            
            content = full_path.read_text(encoding='utf-8')
            
            return {
                "success": True,
                "message": f"Read: {file_path}",
                "content": content
            }
            
        except Exception as e:
            return {
                "success": False,
                "message": f"Error: {str(e)}",
                "content": None
            }
    
    def create_product_description(self, product_name: str, description: str, price: float) -> Dict[str, Any]:
        safe_name = ''.join(c if c.isalnum() or c in ('_', '-') else '_' for c in product_name.lower().replace(' ', '_'))
        
        file_path = f"static/desc/{safe_name}.md"
        
        content = f"""# {product_name}

{description}

## Price
**${price:.2f}**

## Features
- High quality product
- Fast shipping available
- Customer satisfaction guaranteed
- 30-day return policy

## Product Details
{description}

*This product description was automatically generated.*
"""
        
        return self.write_file(file_path, content)

# LangChain tool functions
def write_file(file_path: str, content: str) -> str:
    tool = FileEditorTool()
    result = tool.write_file(file_path, content)
    
    if result["success"]:
        return f" Written: {result['path']} ({result.get('size', 0)} bytes)"
    else:
        return f" Error: {result['message']}"

def create_product_description(product_name: str, description: str, price: float) -> str:
    tool = FileEditorTool()
    result = tool.create_product_description(product_name, description, price)
    
    if result["success"]:
        return f" Created description: {result['path']}"
    else:
        return f" Error: {result['message']}"
