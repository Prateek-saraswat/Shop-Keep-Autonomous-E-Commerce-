import os
import sys
from pathlib import Path
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv
import uvicorn
import uuid
from datetime import datetime

# Add paths
sys.path.append(str(Path(__file__).parent.parent))

load_dotenv()

if not os.getenv("OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY"):
    print(" WARNING: OPENAI_API_KEY not set!")
    print("   Set it in backend/.env")

if not os.getenv("TAVILY_API_KEY") or os.getenv("TAVILY_API_KEY"):
    print("  WARNING: TAVILY_API_KEY not set!")
    print("   Get free API key from https://tavily.com")
    print("   Set it in backend/.env")

from backend.tools.mongodb_tool import MongoDBTool
from langgraph.agent import run_agent

app = FastAPI(
    title="Shop-Keep API",
    description="E-commerce",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    os.getenv("FRONTEND_URL"),
    os.getenv("FRONTEND_URL_DEV")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

static_dir = Path(__file__).parent.parent / "static"
static_dir.mkdir(exist_ok=True)
(static_dir / "images").mkdir(exist_ok=True)
(static_dir / "desc").mkdir(exist_ok=True)

app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

try:
    db_tool = MongoDBTool()
    print(" MongoDB initialized")
except Exception as e:
    print(f" MongoDB failed: {e}")
    db_tool = None

tasks: Dict[str, Dict[str, Any]] = {}

class ProductBase(BaseModel):
    name: str
    price: float
    description: str = ""
    image_path: str = "/images/placeholder.jpg"
    stock: int = 10
    category: str = "General"

class AgentCommand(BaseModel):
    command: str

class AgentTaskResponse(BaseModel):
    task_id: str
    status: str
    message: str

class AgentStatusResponse(BaseModel):
    task_id: str
    status: str
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

@app.get("/")
async def root():
    return {
        "message": "Shop-Keep API",
        "version": "2.0.0",
        "features": [
            " Real Tavily web search",
            " Real image downloads",
            " Real MongoDB storage",
            " Real browser testing"
        ],
        "docs": "/docs"
    }

@app.get("/api/health")
async def health_check():
    api_keys_set = {
        "openai": bool(os.getenv("OPENAI_API_KEY") and os.getenv("OPENAI_API_KEY") != "sk-your-openai-api-key-here"),
        "tavily": bool(os.getenv("TAVILY_API_KEY") and os.getenv("TAVILY_API_KEY") != "tvly-your-tavily-api-key-here"),
    }
    
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "connected" if db_tool and db_tool.products else "disconnected",
        "api_keys": api_keys_set,
        "warning": "Set API keys in backend/.env" if not all(api_keys_set.values()) else None
    }

@app.get("/api/products")
async def get_products():
    """Get all products from REAL MongoDB"""
    if not db_tool:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    try:
        products = db_tool.get_all_products()
        
        for product in products:
            if "_id" in product:
                product["id"] = str(product["_id"])
                del product["_id"]
        
        return products
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/products/{product_id}")
async def get_product(product_id: str):
    """Get specific product"""
    if not db_tool:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    try:
        product = db_tool.get_product(product_id)
        
        if product is None:
            raise HTTPException(status_code=404, detail="Product not found")
        
        product["id"] = str(product["_id"])
        del product["_id"]
        
        return product
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/products")
async def create_product(product: ProductBase):
    """Manually create a product"""
    if not db_tool:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    try:
        result = db_tool.insert_product({
            "name": product.name,
            "price": product.price,
            "description": product.description,
            "image_path": product.image_path,
            "stock": product.stock,
            "category": product.category
        })
        
        if result["success"]:
            return {"id": result["product_id"], "message": result["message"]}
        else:
            raise HTTPException(status_code=500, detail=result["message"])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def run_agent_task(task_id: str, command: str):
    """Run REAL agent in background"""
    try:
        tasks[task_id]["status"] = "running"
        tasks[task_id]["started_at"] = datetime.utcnow().isoformat()
        
        print(f"\n Starting REAL agent for task {task_id}")
        print(f"   Command: {command}")
        
        
        result = run_agent(command)
        
        tasks[task_id]["status"] = "completed" if result.get("success") else "failed"
        tasks[task_id]["result"] = result
        tasks[task_id]["completed_at"] = datetime.utcnow().isoformat()
        
        print(f"\n Agent completed: {task_id}")
        
    except Exception as e:
        print(f"\n Agent failed: {task_id}")
        print(f"   Error: {e}")
        import traceback
        traceback.print_exc()
        
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["error"] = str(e)
        tasks[task_id]["completed_at"] = datetime.utcnow().isoformat()

@app.post("/api/agent/stock", response_model=AgentTaskResponse)
async def stock_store(command: AgentCommand, background_tasks: BackgroundTasks):
    """
    Trigger REAL agent to stock store
    Uses Tavily for actual web search!
    """
    task_id = str(uuid.uuid4())
    
    tasks[task_id] = {
        "task_id": task_id,
        "command": command.command,
        "status": "queued",
        "created_at": datetime.utcnow().isoformat(),
        "result": None,
        "error": None
    }
    
    background_tasks.add_task(run_agent_task, task_id, command.command)
    
    return AgentTaskResponse(
        task_id=task_id,
        status="queued",
        message=f"REAL agent queued (using Tavily search). Check status at /api/agent/status/{task_id}"
    )

@app.get("/api/agent/status/{task_id}", response_model=AgentStatusResponse)
async def get_task_status(task_id: str):
    """Get agent task status"""
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = tasks[task_id]
    
    return AgentStatusResponse(
        task_id=task_id,
        status=task["status"],
        result=task.get("result"),
        error=task.get("error")
    )

@app.get("/api/agent/tasks")
async def get_all_tasks():
    """Get all agent tasks"""
    return list(tasks.values())

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    
   
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )
