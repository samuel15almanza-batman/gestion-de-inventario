from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        print("1. Loading Home Page...")
        page.goto("http://localhost:3000")
        page.wait_for_load_state("networkidle")
        
        # Verify title or content
        assert "Panel de Control" in page.content()
        print("✅ Home Page Loaded")

        print("2. Navigating to Products...")
        page.goto("http://localhost:3000/products")
        page.wait_for_load_state("networkidle")
        
        # Verify Product Page
        assert "Gestión de Productos" in page.content()
        print("✅ Product Page Loaded")
        
        # Check if Add Button exists
        assert page.locator("text=Agregar Producto").is_visible()
        print("✅ Add Product Button Visible")

        print("3. Navigating to Agent...")
        page.goto("http://localhost:3000/agent")
        page.wait_for_load_state("networkidle")
        
        assert "Agente de Inteligencia Artificial" in page.content()
        print("✅ Agent Page Loaded")

        browser.close()

if __name__ == "__main__":
    run()
