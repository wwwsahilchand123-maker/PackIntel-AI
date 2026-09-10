/**
 * End-to-end tests using Playwright or similar.
 * These would be run with: npx playwright test
 */

import { test, expect } from '@playwright/test'

test.describe('PackIntel AI E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/')
  })

  test('Home page loads with all features visible', async ({ page }) => {
    // Check hero section
    await expect(page.locator('text=PackIntel AI')).toBeVisible()
    await expect(page.locator('text=AI-powered material recommendation')).toBeVisible()

    // Check feature cards
    await expect(page.locator('text=AI Analyzer')).toBeVisible()
    await expect(page.locator('text=What-If Simulator')).toBeVisible()
    await expect(page.locator('text=Material Comparer')).toBeVisible()
    await expect(page.locator('text=Knowledge Base')).toBeVisible()

    // Check materials strip
    await expect(page.locator('text=PET')).toBeVisible()
    await expect(page.locator('text=Glass')).toBeVisible()
  })

  test('Analyzer page full workflow', async ({ page }) => {
    await page.goto('http://localhost:5173/analyzer')

    // Type food commodity
    await page.fill('input[placeholder*="e.g. Fresh"]', 'Fresh Tomatoes')
    await page.waitForTimeout(500)

    // Should show suggestion
    await expect(page.locator('text=Fresh Tomatoes')).toBeVisible()
    await page.click('text=Fresh Tomatoes')

    // Verify form fields populated
    await expect(page.locator('input[placeholder*="e.g. Fresh"]')).toHaveValue('Fresh Tomatoes')

    // Adjust a slider
    const moistureSlider = page.locator('input[type="range"]').first()
    await moistureSlider.fill('8')

    // Click Analyze
    await page.click('button:has-text("Analyze Packaging")')

    // Wait for loading
    await page.waitForTimeout(1000)

    // Verify results loaded
    await expect(page.locator('text=EXCELLENT')).toBeVisible()
    await expect(page.locator('text=Score Breakdown')).toBeVisible()
    await expect(page.locator('text=Why This Material?')).toBeVisible()
    await expect(page.locator('text=Alternatives')).toBeVisible()

    // Verify recommendation card has material name
    const materialName = await page.locator('[class*="RecommendationCard"] h2').textContent()
    expect(materialName).toBeTruthy()
  })

  test('Simulator page workflow', async ({ page }) => {
    await page.goto('http://localhost:5173/simulator')

    // Verify both panels present
    await expect(page.locator('text=Current Conditions')).toBeVisible()
    await expect(page.locator('text=Modified Conditions')).toBeVisible()

    // Change a condition in after panel
    const afterSliders = page.locator('text=Modified Conditions').locator('..')
    // (Would need specific selectors for actual implementation)

    // Click Compare
    await page.click('button:has-text("Run Comparison")')

    // Verify results
    await expect(page.locator('text=Comparison Summary')).toBeVisible()
  })

  test('Compare page workflow', async ({ page }) => {
    await page.goto('http://localhost:5173/compare')

    // Select materials
    await page.click('button:has-text("PET")')
    await page.click('button:has-text("Glass")')
    await page.click('button:has-text("Aluminum")')

    // Verify count
    await expect(page.locator('text=3/5 selected')).toBeVisible()

    // Click Compare
    await page.click('button:has-text("Compare 3")')

    // Verify results
    await page.waitForTimeout(1000)
    await expect(page.locator('text=Property Comparison')).toBeVisible()
    await expect(page.locator('text=Winners by Property')).toBeVisible()
    await expect(page.locator('text=Overall Ranking')).toBeVisible()
  })

  test('Navigation between pages', async ({ page }) => {
    const pages = [
      { url: '/', text: 'PackIntel AI' },
      { url: '/analyzer', text: 'Analyzer' },
      { url: '/simulator', text: 'Simulator' },
      { url: '/compare', text: 'Comparison Lab' },
      { url: '/knowledge-base', text: 'Knowledge Base' },
    ]

    for (const { url, text } of pages) {
      await page.goto(`http://localhost:5173${url}`)
      await expect(page.locator(`text=${text}`)).toBeVisible()
    }
  })

  test('Demo mode toggle works', async ({ page }) => {
    await page.goto('http://localhost:5173/')

    // Find demo mode pill and click
    const demoModePill = page.locator('text=DEMO MODE')
    await demoModePill.click()
    await page.waitForTimeout(500)

    // Should toggle to LIVE MODE
    await expect(page.locator('text=LIVE MODE')).toBeVisible()
  })

  test('Error handling on network error', async ({ page, context }) => {
    // Simulate network error
    await context.setOffline(true)

    await page.goto('http://localhost:5173/analyzer')
    await page.fill('input[placeholder*="e.g. Fresh"]', 'Test')
    await page.click('button:has-text("Analyze")')

    // Should show error banner
    await expect(page.locator('[role="alert"]')).toBeVisible()

    await context.setOffline(false)
  })

  test('Mobile responsiveness', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone size

    await page.goto('http://localhost:5173/analyzer')

    // Elements should still be accessible
    await expect(page.locator('input[placeholder*="e.g. Fresh"]')).toBeVisible()
    await expect(page.locator('button:has-text("Analyze")')).toBeVisible()
  })
})
