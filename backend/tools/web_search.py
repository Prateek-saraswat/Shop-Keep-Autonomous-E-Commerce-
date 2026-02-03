import os
from typing import Dict, Any, List
from tavily import TavilyClient
import requests
from bs4 import BeautifulSoup
import re

class WebSearchTool:
    def __init__(self):
        """Initialize with Tavily API key"""
        self.api_key = os.getenv('TAVILY_API_KEY')
        if not self.api_key or self.api_key == 'tvly-your-tavily-api-key-here':
            print("⚠️  WARNING: TAVILY_API_KEY not set. Web search will not work!")
            self.client = None
        else:
            self.client = TavilyClient(api_key=self.api_key)
            print(" Tavily Web Search initialized")
    
    def search(self, query: str, max_results: int = 1) -> List[Dict[str, Any]]:
        """
        Search the web using Tavily
        
        Args:
            query: Search query
            max_results: Number of results to return
            
        Returns:
            List of search results with title, url, content
        """
        if not self.client:
            raise ValueError("Tavily API key not configured. Set TAVILY_API_KEY in .env")
        
        try:
            response = self.client.search(
                query=query,
                max_results=max_results,
                search_depth="advanced",
                include_images=True,
                include_answer=True
            )
            
            results = []
            for result in response.get('results', []):
                results.append({
                    'title': result.get('title', ''),
                    'url': result.get('url', ''),
                    'content': result.get('content', ''),
                    'score': result.get('score', 0)
                })
            
            images = response.get('images', [])
            
            return {
                'results': results,
                'images': images[:10],  # Top 10 images
                'answer': response.get('answer', '')
            }
            
        except Exception as e:
            print(f" Tavily search error: {e}")
            raise
    
    def fetch_page(self, url: str) -> Dict[str, Any]:
        """
        Fetch and parse a web page
        
        Args:
            url: URL to fetch
            
        Returns:
            Dict with title, content, images
        """
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            title = soup.find('title')
            title = title.get_text().strip() if title else ''
            
            for script in soup(['script', 'style', 'nav', 'footer', 'header']):
                script.decompose()
            
            content = soup.get_text()
            content = ' '.join(content.split())  
            
            images = []
            for img in soup.find_all('img', src=True):
                img_url = img['src']
                if img_url.startswith('//'):
                    img_url = 'https:' + img_url
                elif img_url.startswith('/'):
                    from urllib.parse import urljoin
                    img_url = urljoin(url, img_url)
                
                if img_url.startswith('http'):
                    images.append(img_url)
            
            return {
                'success': True,
                'title': title,
                'content': content[:2000],  
                'images': images[:5],  
                'url': url
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'url': url
            }
    
    def extract_product_info(self, search_results: Dict[str, Any], query: str) -> List[Dict[str, Any]]:
        """
        Extract product information from search results
        Uses AI to parse and structure the data
        
        Args:
            search_results: Results from search()
            query: Original query to understand context
            
        Returns:
            List of structured product data
        """
        products = []
        
        for i, result in enumerate(search_results.get('results', [])[:3]):
            content = result.get('content', '')
            title = result.get('title', '')
            
            price_match = re.search(r'\$(\d+(?:,\d+)?(?:\.\d{2})?)', content + ' ' + title)
            price = float(price_match.group(1).replace(',', '')) if price_match else 99.99
            
            product_name = title.split('|')[0].split('-')[0].strip()
            if not product_name or len(product_name) < 3:
                product_name = f"Product {i+1} from search"
            
            image_url = None
            if search_results.get('images') and i < len(search_results['images']):
                image_url = search_results['images'][i]
            else:
                page_data = self.fetch_page(result.get('url', ''))
                if page_data.get('success') and page_data.get('images'):
                    image_url = page_data['images'][0]
            
            if not image_url:
                image_url = f"https://via.placeholder.com/400x400.png?text={product_name.replace(' ', '+')}"
            
            description = content[:200] + "..." if len(content) > 200 else content
            
            products.append({
                'name': product_name,
                'price': price,
                'description': description,
                'image_url': image_url,
                'source_url': result.get('url', '')
            })
        
        return products

def search_web(query: str) -> str:
    """Search the web for product information using Tavily"""
    tool = WebSearchTool()
    
    try:
        results = tool.search(query, max_results=5)
        
        formatted = f"Search results for: {query}\n\n"
        
        if results.get('answer'):
            formatted += f"Quick Answer: {results['answer']}\n\n"
        
        formatted += "Top Results:\n"
        for i, result in enumerate(results.get('results', []), 1):
            formatted += f"\n{i}. {result['title']}\n"
            formatted += f"   URL: {result['url']}\n"
            formatted += f"   {result['content'][:200]}...\n"
        
        if results.get('images'):
            formatted += f"\n\nFound {len(results['images'])} product images\n"
        
        return formatted
        
    except Exception as e:
        return f"Error searching web: {str(e)}"

def fetch_product_details(url: str) -> str:
    """Fetch detailed product information from a URL"""
    tool = WebSearchTool()
    
    try:
        page_data = tool.fetch_page(url)
        
        if page_data.get('success'):
            return f"""
Product Page: {page_data['title']}
URL: {page_data['url']}

Content: {page_data['content'][:500]}...

Images found: {len(page_data.get('images', []))}
"""
        else:
            return f"Error fetching page: {page_data.get('error')}"
            
    except Exception as e:
        return f"Error: {str(e)}"

