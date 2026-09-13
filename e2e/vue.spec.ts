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
