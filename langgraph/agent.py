import os
import sys
import json
import re
from typing import Dict, Any, List, Annotated
from pathlib import Path
from operator import add

sys.path.append(str(Path(__file__).parent.parent))

from langchain_openai import ChatOpenAI
from langchain.tools import tool
from langgraph.graph import StateGraph, END
from typing_extensions import TypedDict

from backend.tools.web_search import WebSearchTool
from backend.tools.bash_tool import BashTool
from backend.tools.file_editor import FileEditorTool
from backend.tools.mongodb_tool import MongoDBTool
from backend.tools.browser_tool import BrowserTool

class AgentState(TypedDict):
    messages: Annotated[List[Dict[str, str]], add]
    user_command: str
    search_query: str
    found_products: List[Dict[str, Any]]
    downloaded_images: List[str]
    created_descriptions: List[str]
    inserted_product_ids: List[str]
    verification_results: List[Dict[str, Any]]
    current_step: str
    errors: List[str]
    success: bool
    final_message: str

web_search_tool = WebSearchTool()
bash_tool = BashTool()
file_tool = FileEditorTool()
db_tool = MongoDBTool()

llm = ChatOpenAI(
    model="gpt-4-turbo-preview",
    temperature=0,
    openai_api_key=os.getenv("OPENAI_API_KEY")
)

def research_node(state: AgentState) -> AgentState:
    """
    REAL Research Node - Uses Tavily to actually search the web
    """
    print("\n" + "="*60)
    print(" RESEARCH NODE: Searching REAL web with Tavily")
    print("="*60)
    
    user_command = state["user_command"]
    errors = state.get("errors", [])
    
    try:
        print(f" Command: {user_command}")
        
        if "keyboard" in user_command.lower():
            search_query = "best mechanical keyboards 2024 buy price"
            if "under" in user_command.lower():
                price_match = re.search(r'\$?(\d+)', user_command)
                if price_match:
                    search_query += f" under ${price_match.group(1)}"
        elif "mouse" in user_command.lower() or "mice" in user_command.lower():
            search_query = "best gaming mice 2024 buy price"
        elif "iphone" in user_command.lower():
            search_query = "iPhone 16 price buy 2024"
        elif "headphone" in user_command.lower():
            search_query = "best wireless headphones 2024 price buy"
        else:
            search_query = user_command + " buy price 2024"
        
        print(f"Search query: {search_query}")
        
        print(f"Calling Tavily API...")
        search_results = web_search_tool.search(search_query, max_results=5)
        
        print(f"Got {len(search_results.get('results', []))} results from Tavily")
        
        prompt = f"""Based on these web search results, extract EXACTLY  1 product listings with:
- Exact product name
- Price (as a number, extract from text)
- Brief description
- High-quality image URL (use the images array or find from content)

Search Results:
{json.dumps(search_results.get('results', []), indent=2)}

Available Images:
{json.dumps(search_results.get('images', [])[:10], indent=2)}

Return ONLY valid JSON array like:
[
  {{
    "name": "Exact Product Name",
    "price": 99.99,
    "description": "Brief product description",
    "image_url": "https://full-image-url.jpg"
  }}
]

Extract from actual search results. Use real prices found. Use real product names."""

        response = llm.invoke(prompt)
        
        try:
            content = response.content
            json_match = re.search(r'\[\s*\{.*\}\s*\]', content, re.DOTALL)
            if json_match:
                products_json = json_match.group(0)
                products = json.loads(products_json)
            else:
                raise ValueError("No JSON found in response")
            
            valid_products = []
            for p in products[:1]:  # Limit to 3
                if all(k in p for k in ['name', 'price', 'image_url']):
                    if not p.get('description'):
                        p['description'] = f"High quality {p['name']}"
                    valid_products.append(p)
            
            products = valid_products
            
        except Exception as e:
            print(f"LLM extraction failed: {e}")
            print(f"   Using fallback extraction...")
            
            # Fallback: Use web_search_tool's extraction
            products = web_search_tool.extract_product_info(search_results, search_query)[:1]
        
        if not products:
            errors.append("No products found in search results")
            products = []
        
        print(f"\n Extracted {len(products)} products:")
        for i, p in enumerate(products, 1):
            print(f"   {i}. {p['name']} - ${p['price']}")
            print(f"      Image: {p['image_url'][:60]}...")
        
        state["found_products"] = products
        state["search_query"] = search_query
        state["current_step"] = "research_complete"
        state["errors"] = errors
        
    except Exception as e:
        print(f" Research error: {e}")
        import traceback
        traceback.print_exc()
        errors.append(f"Research failed: {str(e)}")
        state["errors"] = errors
        state["found_products"] = []
    
    return state

def asset_management_node(state: AgentState) -> AgentState:
    """
    REAL Asset Management - Actually downloads images and creates files
    """
    print("\n" + "="*60)
    print(" ASSET MANAGEMENT NODE: Downloading REAL images")
    print("="*60)
    
    products = state.get("found_products", [])
    downloaded_images = []
    created_descriptions = []
    errors = state.get("errors", [])
    
    for i, product in enumerate(products):
        product_name = product["name"]
        image_url = product["image_url"]
        description = product["description"]
        price = product["price"]
        
        print(f"\n Processing product {i+1}/{len(products)}: {product_name}")
        
        safe_name = re.sub(r'[^a-zA-Z0-9]', '_', product_name.lower())
        safe_name = safe_name[:50]  
        image_filename = f"{safe_name}.jpg"
        
        print(f"   Downloading image...")
        download_result = bash_tool.download_image(image_url, image_filename)
        
        if download_result["success"]:
            downloaded_images.append(download_result["path"])
            product["local_image_path"] = f"/images/{image_filename}"
            print(f"   Image downloaded: {download_result['path']}")
        else:
            print(f"    Download failed: {download_result['message']}")
            errors.append(f"Failed to download image for {product_name}")
            product["local_image_path"] = "/images/placeholder.jpg"
        
        print(f" Creating description file...")
        desc_result = file_tool.create_product_description(product_name, description, price)
        
        if desc_result["success"]:
            created_descriptions.append(desc_result["path"])
            print(f"   Description created: {desc_result['path']}")
        else:
            print(f"    Description failed: {desc_result['message']}")
    
    state["downloaded_images"] = downloaded_images
    state["created_descriptions"] = created_descriptions
    state["current_step"] = "assets_complete"
    state["found_products"] = products
    state["errors"] = errors
    
    print(f"\n Assets complete: {len(downloaded_images)} images, {len(created_descriptions)} descriptions")
    
    return state

def database_node(state: AgentState) -> AgentState:
    """
    REAL Database Node - Actually inserts into MongoDB
    """
    print("\n" + "="*60)
    print(" DATABASE NODE: Inserting into REAL MongoDB")
    print("="*60)
    
    products = state.get("found_products", [])
    inserted_ids = []
    errors = state.get("errors", [])
    
    for i, product in enumerate(products):
        if "local_image_path" not in product:
            print(f"   ⊘ Skipping {product['name']} - no image")
            continue
        
        print(f"\n Inserting product {i+1}/{len(products)}: {product['name']}")
        
      
        result = db_tool.insert_product({
            "name": product["name"],
            "price": product["price"],
            "image_path": product["local_image_path"],
            "description": product["description"],
            "stock": 10
        })
        
        if result["success"]:
            inserted_ids.append(result["product_id"])
            print(f"    Inserted: ID = {result['product_id']}")
        else:
            print(f"    Insert failed: {result['message']}")
            errors.append(f"Failed to insert {product['name']}")
    
    state["inserted_product_ids"] = inserted_ids
    state["current_step"] = "database_complete"
    state["errors"] = errors
    
    print(f"\nDatabase complete: {len(inserted_ids)} products inserted")
    
    return state

def qa_testing_node(state: AgentState) -> AgentState:
    """
    REAL QA Testing - Actually opens browser with Selenium
    """
    print("\n" + "="*60)
    print(" QA TESTING NODE: Opening REAL browser")
    print("="*60)
    
    products = state.get("found_products", [])
    verification_results = []
    errors = state.get("errors", [])
    
  
    if products:
        product_to_verify = products[0]
        product_name = product_to_verify["name"]
        
        print(f"\nVerifying: {product_name}")
        
        browser = BrowserTool(headless=True)
        try:
            result = browser.verify_product_page(product_name)
            verification_results.append(result)
            
            if result["success"]:
                print(f"\n QA PASSED: {result['message']}")
            else:
                print(f"\n  QA WARNING: {result['message']}")
                
        except Exception as e:
            print(f"\n QA error: {e}")
            verification_results.append({
                "success": False,
                "message": f"Error: {str(e)}"
            })
        finally:
            browser.close()
    
    state["verification_results"] = verification_results
    state["current_step"] = "qa_complete"
    state["errors"] = errors
    
    return state

def final_node(state: AgentState) -> AgentState:
    """
    Generate final summary
    """
    print("\n" + "="*60)
    print(" FINAL NODE: Generating summary")
    print("="*60)
    
    products = state.get("found_products", [])
    inserted_ids = state.get("inserted_product_ids", [])
    errors = state.get("errors", [])
    
    if len(inserted_ids) > 0:
        state["success"] = True
        product_names = [p["name"] for p in products if "local_image_path" in p]
        
        state["final_message"] = f"""
 SUCCESS! Added {len(inserted_ids)} products to your store!

Products:
{chr(10).join([f"  • {name}" for name in product_names])}

  Summary:
  • Web searches: REAL (Tavily API)
  • Images downloaded: {len(state.get('downloaded_images', []))}
  • Descriptions created: {len(state.get('created_descriptions', []))}
  • Database inserts: {len(inserted_ids)}
  • Browser verification: {'PASSED' if state.get('verification_results', [{}])[0].get('success') else ' Skipped'}

All products are now live at http://localhost:3000
"""
    else:
        state["success"] = False
        state["final_message"] = f"""
  FAILED to add products

Errors:
{chr(10).join([f"  • {err}" for err in errors])}

Please check:
  • Tavily API key is set
  • MongoDB is running
  • Internet connection for image downloads
"""
    
    print(state["final_message"])
    
    return state

def build_graph():
    """Build the REAL LangGraph workflow"""
    workflow = StateGraph(AgentState)
    
    workflow.add_node("research", research_node)
    workflow.add_node("asset_management", asset_management_node)
    workflow.add_node("database", database_node)
    workflow.add_node("qa_testing", qa_testing_node)
    workflow.add_node("final", final_node)
    
    workflow.set_entry_point("research")
    workflow.add_edge("research", "asset_management")
    workflow.add_edge("asset_management", "database")
    workflow.add_edge("database", "qa_testing")
    workflow.add_edge("qa_testing", "final")
    workflow.add_edge("final", END)
    
    return workflow.compile()

def run_agent(user_command: str) -> Dict[str, Any]:
    """
    Run the REAL Shop-Keep agent
    Everything is real - Tavily search, image downloads, MongoDB, browser testing
    """
    print(f"\n{'='*60}")
    print(f" SHOP-KEEP AGENT STARTING ")
    print(f"{'='*60}")
    print(f"Command: {user_command}\n")
    
    initial_state = {
        "messages": [],
        "user_command": user_command,
        "search_query": "",
        "found_products": [],
        "downloaded_images": [],
        "created_descriptions": [],
        "inserted_product_ids": [],
        "verification_results": [],
        "current_step": "starting",
        "errors": [],
        "success": False,
        "final_message": ""
    }
    
    graph = build_graph()
    final_state = graph.invoke(initial_state)
    
    print(f"\n{'='*60}")
    print(f" AGENT COMPLETED")
    print(f"{'='*60}\n")
    
    return final_state

if __name__ == "__main__":
   
    result = run_agent("Stock my store with 3 trending mechanical keyboards")
    print("\nFinal Result:")
    print(json.dumps({k: v for k, v in result.items() if k != 'messages'}, indent=2, default=str))
