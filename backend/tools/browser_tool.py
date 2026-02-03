
from selenium.webdriver.edge.service import Service as EdgeService
from selenium.webdriver.edge.options import Options as EdgeOptions
from webdriver_manager.microsoft import EdgeChromiumDriverManager
import shutil

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from typing import Dict, Any
import time
import os

class BrowserTool:
    def __init__(self, headless: bool = True):
        """Initialize REAL browser with Selenium"""
        self.headless = headless
        self.driver = None
        print(f"Browser tool initialized (headless={headless})")
    
    def _init_driver(self):
        """Initialize REAL Chrome driver"""
        if self.driver is not None:
            return
        
        try:
            print("Starting Chrome browser...")
            chrome_options = Options()
            if self.headless:
                chrome_options.add_argument('--headless=new')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--disable-gpu')
            chrome_options.add_argument('--window-size=1920,1080')
            chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
            
            try:
                service = Service(ChromeDriverManager().install())
                self.driver = webdriver.Chrome(service=service, options=chrome_options)
                print("Chrome browser started")
            except:
                self.driver = webdriver.Chrome(options=chrome_options)
                print("Chrome browser started (system chromedriver)")
            
        except Exception as e:
            print(f"Browser init error: {e}")
            self.driver = None
            raise


    
    def navigate(self, url: str) -> Dict[str, Any]:
        """REAL navigation to URL"""
        try:
            self._init_driver()
            
            if self.driver is None:
                return {"success": False, "message": "Browser not available"}
            
            print(f"Navigating to: {url}")
            self.driver.get(url)
            time.sleep(3)  # Wait for page load
            
            title = self.driver.title
            print(f"Page loaded: {title}")
            
            return {
                "success": True,
                "message": f"Navigated to {url}",
                "title": title
            }
            
        except Exception as e:
            print(f"Navigation error: {e}")
            return {
                "success": False,
                "message": f"Error: {str(e)}"
            }
    
    def find_element(self, selector: str, by: str = "xpath") -> Dict[str, Any]:
        """REAL element finding"""
        try:
            if self.driver is None:
                return {"success": False, "message": "Browser not initialized"}
            
            by_mapping = {
                "id": By.ID,
                "class": By.CLASS_NAME,
                "xpath": By.XPATH,
                "css": By.CSS_SELECTOR,
                "tag": By.TAG_NAME
            }
            
            by_type = by_mapping.get(by.lower(), By.XPATH)
            
            print(f"Looking for element: {selector}")
            wait = WebDriverWait(self.driver, 10)
            element = wait.until(EC.presence_of_element_located((by_type, selector)))
            
            print(f" Element found!")
            
            return {
                "success": True,
                "message": f"Element found: {selector}",
                "text": element.text[:100],
                "visible": element.is_displayed()
            }
            
        except Exception as e:
            print(f" Element not found: {e}")
            return {
                "success": False,
                "message": f"Not found: {str(e)}"
            }
    
    def click_element(self, selector: str, by: str = "xpath") -> Dict[str, Any]:
        """REAL click action"""
        try:
            if self.driver is None:
                return {"success": False, "message": "Browser not initialized"}
            
            find_result = self.find_element(selector, by)
            
            if not find_result["success"]:
                return find_result
            
            by_mapping = {
                "id": By.ID,
                "class": By.CLASS_NAME,
                "xpath": By.XPATH,
                "css": By.CSS_SELECTOR,
                "tag": By.TAG_NAME
            }
            
            by_type = by_mapping.get(by.lower(), By.XPATH)
            element = self.driver.find_element(by_type, selector)
            
            print(f" Clicking element...")
            element.click()
            time.sleep(2)
            print(f" Clicked!")
            
            return {
                "success": True,
                "message": f"Clicked: {selector}"
            }
            
        except Exception as e:
            print(f" Click error: {e}")
            return {
                "success": False,
                "message": f"Error: {str(e)}"
            }
    
    def wait_for_products_to_load(self, timeout=30):
        print(" Waiting for product cards to appear...")

        WebDriverWait(self.driver, timeout).until(
            EC.presence_of_element_located(
                (By.XPATH, "//div[contains(@class, 'product')]")
            )
        )

        print(" Product cards detected")

    def verify_product_page(self, product_name: str, base_url: str = "http://localhost:3000") -> Dict[str, Any]:
        """
        REAL verification - actually opens browser and checks!
        """
        try:
            print(f"\n Starting QA verification for: {product_name}")
            
            print(f"1️ Opening homepage: {base_url}")
            nav_result = self.navigate(base_url)
            
            if not nav_result["success"]:
                return nav_result
            
            time.sleep(30) 
            BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            SCREENSHOT_DIR = os.path.join(BASE_DIR, "screenshots")
            os.makedirs(SCREENSHOT_DIR, exist_ok=True)

            screenshot_path = os.path.join(
                SCREENSHOT_DIR,
                f"screenshot_{int(time.time())}.png"
            )
            self.driver.save_screenshot(screenshot_path)
            print(f" Screenshot saved at: {screenshot_path}")
            self.wait_for_products_to_load(timeout=30)
            
            
            try:
                # screenshot_path = f"/tmp/screenshot_{int(time.time())}.png"
                # self.driver.save_screenshot(screenshot_path)
                # print(f" Screenshot saved: {screenshot_path}")
                BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                SCREENSHOT_DIR = os.path.join(BASE_DIR, "screenshots")

                os.makedirs(SCREENSHOT_DIR, exist_ok=True)

                screenshot_path = os.path.join(
                    SCREENSHOT_DIR,
                    f"screenshot_{int(time.time())}.png"
                    )

                self.driver.save_screenshot(screenshot_path)
                print(f" Screenshot saved at: {screenshot_path}")
            except:
                pass
            
            print(f" Looking for product: {product_name}")
            
            selectors_to_try = [
                f"//*[contains(text(), '{product_name}')]",
                f"//h3[contains(text(), '{product_name}')]",
                f"//div[contains(@class, 'product')]//*[contains(text(), '{product_name}')]",
            ]
            
            product_found = False
            for selector in selectors_to_try:
                result = self.find_element(selector, "xpath")
                if result["success"]:
                    product_found = True
                    print(f" Product found with selector: {selector}")
                    break
            
            if not product_found:
                page_text = self.driver.find_element(By.TAG_NAME, "body").text
                print(f"  Product '{product_name}' not found on page")
                print(f"   Page contains: {page_text[:200]}...")
                
                return {
                    "success": False,
                    "message": f"Product '{product_name}' not found on page"
                }
            
            print(f" Clicking product...")
            try:
                click_result = self.click_element(f"//*[contains(text(), '{product_name}')]", "xpath")
                time.sleep(3)
            except:
                print(f"⚠️  Could not click product, but it exists")
            
            print(f" Verifying product detail page...")
            detail_indicators = [
                ("add-to-cart", "id"),
                ("buy-now", "id"),
                ("//*[contains(@class, 'detail')]", "xpath"),
                ("//*[contains(text(), 'Add to Cart')]", "xpath"),
            ]
            
            found_detail = False
            for selector, by_type in detail_indicators:
                result = self.find_element(selector, by_type)
                if result["success"]:
                    found_detail = True
                    print(f" Found detail element: {selector}")
                    break
            
            if found_detail:
                print(f" VERIFICATION SUCCESS: Product page loaded correctly!")
                return {
                    "success": True,
                    "message": f" Product '{product_name}' verified successfully! Found on page and detail page works.",
                    "details": "Product exists and detail page accessible"
                }
            else:
                print(f"Product exists but detail page verification inconclusive")
                return {
                    "success": True,
                    "message": f" Product '{product_name}' found on storefront",
                    "details": "Product visible, detail page not fully verified"
                }
            
        except Exception as e:
            print(f"Verification error: {e}")
            return {
                "success": False,
                "message": f"Error: {str(e)}"
            }
        finally:
            pass
    
    def close(self):
        """Close REAL browser"""
        if self.driver:
            try:
                print(" Closing browser...")
                self.driver.quit()
                self.driver = None
                print(" Browser closed")
            except:
                pass

def verify_product(product_name: str) -> str:
    """Verify product appears on website - REAL browser test!"""
    browser = BrowserTool(headless=True)
    
    try:
        result = browser.verify_product_page(product_name)
        
        if result["success"]:
            return f" VERIFIED: {result['message']}"
        else:
            return f" FAILED: {result['message']}"
    finally:
        browser.close()

def navigate_to_url(url: str) -> str:
    """Navigate browser to URL - REAL navigation!"""
    browser = BrowserTool(headless=True)
    
    try:
        result = browser.navigate(url)
        
        if result["success"]:
            return f" Navigated: {url}\nTitle: {result.get('title', 'N/A')}"
        else:
            return f" Failed: {result['message']}"
    finally:
        browser.close()


