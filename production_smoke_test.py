import pytest
import re
import os

try:
    from playwright.sync_api import Page, expect
    HAS_PLAYWRIGHT = True
except ImportError:
    HAS_PLAYWRIGHT = False

TARGET_URL = os.environ.get("TARGET_URL", "https://pile-capacity-calculator-eight.vercel.app/")

@pytest.mark.skipif(not HAS_PLAYWRIGHT, reason="Playwright not installed")
def test_production_smoke_suite(page):
    print(f"Testing URL: {TARGET_URL}")
    page.goto(TARGET_URL)
    
    # 2. Verify Foundation Analysis sidebar item exactly once
    sidebar = page.locator("nav")
    expect(sidebar.locator("text=Foundation Analysis")).to_be_visible()
    expect(sidebar.locator("text=SPT Soil Property Estimator")).not_to_be_visible()
    expect(sidebar.locator("text=Adhesion Factor Calculator")).not_to_be_visible()
    expect(sidebar.locator("text=Nq Calculator")).not_to_be_visible()
    
    # 3. Open /foundation-analysis
    page.click("text=Foundation Analysis")
    expect(page).to_have_url(re.compile(r".*/foundation-analysis"))
    
    # 4. Verify three tabs exist
    expect(page.locator("button:has-text('SPT SOIL')")).to_be_visible()
    expect(page.locator("button:has-text('ADHESION α')")).to_be_visible()
    expect(page.locator("button:has-text('IS:2911 Nq')")).to_be_visible()
    
    # 5. Verify fields blank
    spt_input = page.locator("input[type='number']").first
    expect(spt_input).to_have_value("")
    
    # 6. Execute Clay calculation
    spt_input.fill("10")
    page.click("button:has-text('Calculate')")
    expect(page.locator("text=CLAY SOIL ANALYSIS")).to_be_visible()
    
    # 7. Execute Sand calculation 
    page.click("input[value='sand']")
    spt_input.fill("15")
    page.click("button:has-text('Calculate')")
    expect(page.locator("text=USE FOR DESIGN")).to_be_visible()
    
    # 8. Transfer Conservative Phi
    page.click("button:has-text('Use Conservative φ in Nq Calculator')")
    expect(page.locator("text=IS:2911 Nq CALCULATOR")).to_be_visible()
    
    # Check that N-value transfer populated the field
    nq_input = page.locator("input[type='number']").first
    expect(nq_input).not_to_have_value("")
    
    # 9. Verify Nq Calculation
    page.click("button:has-text('Calculate')")
    expect(page.locator("text=DESIGN Nq VALUE")).to_be_visible()
    
    # 11. Test invalid inputs (clear fields)
    nq_input.fill("")
    page.click("button:has-text('Calculate')")
    expect(page.locator("text=φ must be positive. Please enter a valid number.")).to_be_visible()

    # 14. Verify other modules load
    page.click("text=Pile Capacity Calculator")
    expect(page).to_have_url(re.compile(r".*/pile-capacity"))
    expect(page.locator("h1")).to_contain_text("Pile Capacity Calculator")
