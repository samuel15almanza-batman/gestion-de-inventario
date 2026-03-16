from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        # Increase timeout and maybe slow down operations
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Set default timeout to 60 seconds
        page.set_default_timeout(60000)
        
        print("1. Loading Home Page...")
        try:
            page.goto("http://localhost:3000", wait_until="domcontentloaded")
            # Wait a bit more for client side hydration
            page.wait_for_timeout(2000) 
        except Exception as e:
            print(f"Error loading home page: {e}")
            browser.close()
            return

        # Verify title or content
        content = page.content()
        if "Panel de Control" in content:
             print("✅ Home Page Loaded")
        else:
             print("❌ Home Page Content Missing")
             print(f"Content snippet: {content[:200]}")

        print("2. Navigating to Products...")
        try:
            page.goto("http://localhost:3000/products", wait_until="domcontentloaded")
            page.wait_for_timeout(1000)
        except Exception as e:
             print(f"Error loading products: {e}")

        
        # Verify Product Page
        if "Gestión de Productos" in page.content():
            print("✅ Product Page Loaded")
        else:
             print("❌ Product Page Content Missing")
        
        # Check if Add Button exists
        if page.locator("text=Agregar Producto").is_visible():
            print("✅ Add Product Button Visible")
        else:
             print("❌ Add Product Button Missing")

        print("3. Navigating to Agent...")
        try:
            page.goto("http://localhost:3000/agent", wait_until="domcontentloaded")
            page.wait_for_timeout(1000)
        except Exception as e:
             print(f"Error loading agent: {e}")
        
        if "Agente de Inteligencia Artificial" in page.content():
            print("✅ Agent Page Loaded")
        else:
             print("❌ Agent Page Content Missing")

        browser.close()

if __name__ == "__main__":
    run()
