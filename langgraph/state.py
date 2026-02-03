from typing import TypedDict, List, Dict, Any, Annotated
from operator import add

class AgentState(TypedDict):
    """State of the Shop-Keep agent"""
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
