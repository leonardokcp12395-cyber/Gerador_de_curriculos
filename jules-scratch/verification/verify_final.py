import os
from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Get the absolute path to the index.html file
        file_path = os.path.abspath('index.html')

        # Go to the local HTML file
        page.goto(f'file://{file_path}')

        # Wait for the page to load completely
        page.wait_for_load_state('networkidle')

        # --- Interact with the form ---

        # Fill in personal info
        page.locator('#nome').fill('Jules Verne')
        page.locator('#email').fill('jules.verne@example.com')
        page.locator('#telefone').fill('(88) 98888-7777')
        page.locator('#resumo').fill('Um engenheiro de software apaixonado por criar aplicações web robustas e intuitivas.')

        # Add an experience
        page.locator('#experiencias-container .experiencia-entry:first-child input:nth-child(1)').fill('Engenheiro de Software Sênior')
        page.locator('#experiencias-container .experiencia-entry:first-child input:nth-child(2)').fill('Stark Industries')
        page.locator('#experiencias-container .experiencia-entry:first-child textarea').fill('Desenvolvimento e manutenção do sistema de armaduras do Iron Man.')

        # Add a skill
        page.locator('#habilidades-container .habilidade-entry:first-child input').fill('Playwright Testing')

        # Switch to Moderno Template to check its rendering
        page.locator('#template-select').select_option('moderno')

        # Wait for preview to update - a bit of a hack, wait for a specific element to appear
        expect(page.locator('#preview .moderno-sidebar')).to_be_visible()

        # Take a screenshot
        page.screenshot(path='jules-scratch/verification/final_screenshot.png')

        browser.close()

if __name__ == '__main__':
    run()
