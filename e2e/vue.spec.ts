import { test, expect } from '@playwright/test'

// See here how to get started:
// https://playwright.dev/docs/intro

test('every row has a name, dex number, and a loaded sprite', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.pokemon-item').first()).toBeVisible({ timeout: 1200000 })

  const rows = page.locator('.pokemon-item')
  const count = await rows.count()
  expect(count).toBeGreaterThanOrEqual(1025)

  // Spot-check a sample rather than every single row — checking naturalWidth on
  // 1025+ images sequentially would make this test very slow.
  const sampleIndices = [0, 1, Math.floor(count / 2), count - 1]

  for (const i of sampleIndices) {
    const row = rows.nth(i)
    await expect(row.locator('.pokemon-name')).not.toBeEmpty()
    await expect(row.locator('.pokemon-id')).not.toBeEmpty()

    const img = row.locator('img')
    await img.scrollIntoViewIfNeeded()
    await img.waitForFunction((el) => {
      const image = el as HTMLImageElement
      return image.complete && image.naturalWidth > 0
    })
    // naturalWidth stays 0 if the image failed to load (broken src, 404, etc.)
    const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth)
    expect(naturalWidth).toBeGreaterThan(0)
  }


  
})

test('testing the search terms, bulbasaur should make bulbasaur appear only, same as ivysaur, and none for wetrgdffdswe', async ({page}) => {
    await page.goto('/')
    await expect(page.locator('.pokemon-item').first()).toBeVisible({ timeout: 1200000 })

    await page.locator('.search-input').fill('bulbasaur')
    // debounce is 200ms, give it a little more room for a real browser
    await page.waitForFunction(
      () => document.querySelectorAll('.pokemon-item').length === 1,
      { timeout: 5000 },
    )

    const rows = page.locator('.pokemon-item')
    await expect(rows).toHaveCount(1)
    await expect(page.locator('.pokemon-item')).toContainText('bulbasaur')

    await page.locator('.search-input').fill('ivysaur')
    // debounce is 200ms, give it a little more room for a real browser
    await page.waitForFunction(
      () => document.querySelectorAll('.pokemon-item').length === 1,
      { timeout: 5000 },
    )

    const rows2 = page.locator('.pokemon-item')
    await expect(rows2).toHaveCount(1)
    await expect(page.locator('.pokemon-item')).toContainText('ivysaur')

    await page.locator('.search-input').fill('wetrgdffdswe')
    // debounce is 200ms, give it a little more room for a real browser
    await page.waitForFunction(
      () => document.querySelectorAll('.pokemon-item').length === 0,
      { timeout: 5000 },
    )

    const rows3 = page.locator('.pokemon-item')
    await expect(rows3).toHaveCount(0)
    
  })
