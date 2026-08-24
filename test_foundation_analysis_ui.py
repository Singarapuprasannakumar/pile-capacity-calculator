import pytest
import re

try:
    from playwright.sync_api import Page, expect
    HAS_PLAYWRIGHT = True
except ImportError:
    HAS_PLAYWRIGHT = False

@pytest.mark.skipif(not HAS_PLAYWRIGHT, reason="Playwright not installed")
def test_foundation_analysis_ui(page):
    # 1. Open Dashboard
    page.goto("http://localhost:5173/")
    
    # 3. Verify only one sidebar item exists for the three tools
    sidebar = page.locator("nav")
    expect(sidebar.locator("text=Foundation Analysis")).to_be_visible()
    expect(sidebar.locator("text=SPT Soil Property Estimator")).not_to_be_visible()
    expect(sidebar.locator("text=Adhesion Factor Calculator")).not_to_be_visible()
    expect(sidebar.locator("text=Nq Calculator")).not_to_be_visible()
    
    # 2. Open Foundation Analysis
    page.click("text=Foundation Analysis")
    expect(page).to_have_url(re.compile(r".*/foundation-analysis"))
    
    # 4. Verify SPT / Adhesion / Nq tabs render
    expect(page.locator("button:has-text('SPT SOIL')")).to_be_visible()
    expect(page.locator("button:has-text('ADHESION α')")).to_be_visible()
    expect(page.locator("button:has-text('IS:2911 Nq')")).to_be_visible()
    
    # 5. Verify all input fields are initially blank (SPT)
    spt_input = page.locator("input[type='number']")
    expect(spt_input).to_have_value("")
    
    # 6. Perform a Clay SPT calculation
    # Radio for Clay should be checked initially
    page.fill("input[type='number']", "10")
    page.click("button:has-text('Calculate')")
    expect(page.locator("text=CLAY SOIL ANALYSIS")).to_be_visible()
    
    # 12. Use cohesion in Adhesion Calculator
    page.click("button:has-text('Use Cohesion in Adhesion Calculator')")
    
    # verify we switched to Adhesion tab
    expect(page.locator("text=ADHESION FACTOR (α) CALCULATOR")).to_be_visible()
    adhm_input = page.locator("input[type='number']")
    expect(adhm_input).not_to_have_value("") # cohesion should be populated
    
    # 13. Verify α calculation
    page.click("button:has-text('Calculate')")
    expect(page.locator("text=ADHESION FACTOR α")).to_be_visible()
    
    # Switch back to SPT, do Sand calculation
    page.click("button:has-text('SPT SOIL')")
    page.click("input[value='sand']")
    page.fill("input[type='number']", "15")
    page.click("button:has-text('Calculate')")
    
    # 8. Verify five φ methods
    expect(page.locator("text=Peck et al")).to_be_visible()
    expect(page.locator("text=Meyerhof")).to_be_visible()
    expect(page.locator("text=Dunham")).to_be_visible()
    expect(page.locator("text=Hatanaka")).to_be_visible()
    
    # 9. Verify conservative φ
    expect(page.locator("text=USE FOR DESIGN")).to_be_visible()
    
    # 10. Use conservative φ in Nq Calculator
    page.click("button:has-text('Use Conservative φ in Nq Calculator')")
    expect(page.locator("text=IS:2911 Nq CALCULATOR")).to_be_visible()
    
    # 11. Verify Nq calculation
    nq_input = page.locator("input[type='number']")
    expect(nq_input).not_to_have_value("")
    page.click("button:has-text('Calculate')")
    expect(page.locator("text=DESIGN Nq VALUE")).to_be_visible()

    # 14. Verify validation errors by clearing and submitting
    page.fill("input[type='number']", "")
    page.click("button:has-text('Calculate')")
    expect(page.locator("text=Please enter a valid number")).to_be_visible()
