from pymongo import MongoClient
from typing import Dict, Any, List, Optional
from datetime import datetime
import os
from bson import ObjectId

class MongoDBTool:
    def __init__(self, connection_string: str = None):
        """Initialize REAL MongoDB connection"""
        if connection_string is None:
            connection_string = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/shopkeep')
        
        try:
            print(f" Connecting to MongoDB...")
            self.client = MongoClient(connection_string, serverSelectionTimeoutMS=5000)
            
            # Test connection
            self.client.server_info()
            
            # Get database and collection
            db_name = connection_string.split('/')[-1].split('?')[0] if '/' in connection_string else 'shopkeep'
            self.db = self.client[db_name]
            self.products = self.db.products
            
            print(f" MongoDB connected: {db_name}")
            print(f"   Current products: {self.products.count_documents({})}")
            
        except Exception as e:
            print(f" MongoDB connection failed: {e}")
            print(f"   Make sure MongoDB is running!")
            raise
    
    def insert_product(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        REAL insert into MongoDB - actually stores data!
        """
        try:
            product = {
                "name": product_data.get("name"),
                "price": product_data.get("price"),
                "image_path": product_data.get("image_path"),
                "description": product_data.get("description", ""),
                "stock": product_data.get("stock", 10),
                "category": product_data.get("category", "General"),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "active": True
            }
            
            print(f" Inserting product: {product['name']}")
            result = self.products.insert_one(product)
            
            product_id = str(result.inserted_id)
            print(f" Product inserted: ID = {product_id}")
            
            return {
                "success": True,
                "message": f"Product '{product['name']}' inserted",
                "product_id": product_id
            }
            
        except Exception as e:
            print(f" Insert failed: {e}")
            return {
                "success": False,
                "message": f"Error: {str(e)}",
                "product_id": None
            }
    
    def get_product(self, product_id: str) -> Optional[Dict[str, Any]]:
        """Get a product by ID - REAL query"""
        try:
            product = self.products.find_one({"_id": ObjectId(product_id)})
            if product:
                product["_id"] = str(product["_id"])
            return product
        except Exception as e:
            print(f" Get product error: {e}")
            return None
    
    def get_all_products(self) -> List[Dict[str, Any]]:
        """Get all products - REAL query from MongoDB"""
        try:
            products = list(self.products.find({"active": True}))
            for product in products:
                product["_id"] = str(product["_id"])
            
            print(f" Retrieved {len(products)} products from database")
            return products
            
        except Exception as e:
            print(f" Query error: {e}")
            return []
    
    def update_product(self, product_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update a product - REAL update"""
        try:
            updates["updated_at"] = datetime.utcnow()
            result = self.products.update_one(
                {"_id": ObjectId(product_id)},
                {"$set": updates}
            )
            
            return {
                "success": result.modified_count > 0,
                "message": "Updated" if result.modified_count > 0 else "No changes"
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error: {str(e)}"
            }
    
    def delete_product(self, product_id: str) -> Dict[str, Any]:
        """Soft delete - REAL update"""
        try:
            result = self.products.update_one(
                {"_id": ObjectId(product_id)},
                {"$set": {"active": False, "updated_at": datetime.utcnow()}}
            )
            
            return {
                "success": result.modified_count > 0,
                "message": "Deleted" if result.modified_count > 0 else "Not found"
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error: {str(e)}"
            }

# LangChain tool functions
def insert_product(name: str, price: float, image_path: str, description: str = "", stock: int = 10) -> str:
    """Insert a product into MongoDB - REAL insert!"""
    tool = MongoDBTool()
    result = tool.insert_product({
        "name": name,
        "price": price,
        "image_path": image_path,
        "description": description,
        "stock": stock
    })
    
    if result["success"]:
        return f" Product inserted: ID = {result['product_id']}"
    else:
        return f" Failed: {result['message']}"

def get_all_products() -> str:
    """Get all products from MongoDB"""
    tool = MongoDBTool()
    products = tool.get_all_products()
    
    if products:
        return f"Found {len(products)} products:\n" + "\n".join([f"- {p['name']}: ${p['price']}" for p in products])
    else:
        return "No products in database"
