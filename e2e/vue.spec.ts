import { test, expect } from '@playwright/test'
import { xerneasSpecies } from '../src/__tests__/fixtures/xerneas.js'

// See here how to get started:
// https://playwright.dev/docs/intro
function cleanFlavorText(text: string): string {
  return text.replace(/[\n\f\r]+/g, ' ').replace(/\s+/g, ' ').trim()
}

test('every row has a name, dex number, and a loaded sprite', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.pokemon-row').first()).toBeVisible({ timeout: 1200000 })

  const rows = page.locator('.pokemon-row')
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
    await expect(page.locator('.pokemon-row').first()).toBeVisible({ timeout: 1200000 })

    await page.locator('.search-input').fill('bulbasaur')
    // debounce is 200ms, give it a little more room for a real browser
    await page.waitForFunction(
      () => document.querySelectorAll('.pokemon-row').length === 1,
      { timeout: 5000 },
    )

    const rows = page.locator('.pokemon-row')
    await expect(rows).toHaveCount(1)
    await expect(page.locator('.pokemon-row')).toContainText('bulbasaur')

    await page.locator('.search-input').fill('ivysaur')
    // debounce is 200ms, give it a little more room for a real browser
    await page.waitForFunction(
      () => document.querySelectorAll('.pokemon-row').length === 1,
      { timeout: 5000 },
    )

    const rows2 = page.locator('.pokemon-row')
    await expect(rows2).toHaveCount(1)
    await expect(page.locator('.pokemon-row')).toContainText('ivysaur')

    await page.locator('.search-input').fill('wetrgdffdswe')
    // debounce is 200ms, give it a little more room for a real browser
    await page.waitForFunction(
      () => document.querySelectorAll('.pokemon-row').length === 0,
      { timeout: 5000 },
    )

    const rows3 = page.locator('.pokemon-row')
    await expect(rows3).toHaveCount(0)
    
  })

test('testing the description of xerneas and that the modal opens', async ({page}) => {
  await page.goto('/')
  await expect(page.locator('.pokemon-row').first()).toBeVisible({ timeout: 1200000 })

  await page.locator('.search-input').fill('xerneas')
  // debounce is 200ms, give it a little more room for a real browser
  await page.waitForFunction(
    () => document.querySelectorAll('.pokemon-row').length === 1,
    { timeout: 5000 },
  )

  const rows = page.locator('.pokemon-row')
  await expect(rows).toHaveCount(1)
  await expect(page.locator('.pokemon-row')).toContainText('xerneas')

  await page.locator('.pokemon-row').click()
  // debounce is 200ms, give it a little more room for a real browser
  await page.waitForFunction(
    () => document.querySelectorAll('.modal-backdrop').length === 1,
    { timeout: 5000 },
  )
  const flavourText = xerneasSpecies.flavor_text_entries.find(
    (e: {language: {name:string}}) => e.language.name === 'en'
  )!.flavor_text
  const cleanedFlavourText = cleanFlavorText(flavourText)
  
  await expect(page.locator('.modal-flavor-text')).toContainText(cleanedFlavourText)
})

test('testing evolutions are right with ralts, as it is a 1 - 1 - 2', async ({page}) => {
  await page.goto('/')
  await expect(page.locator('.pokemon-row').first()).toBeVisible({ timeout: 1200000 })

  await page.locator('.search-input').fill('ralts')
  // debounce is 200ms, give it a little more room for a real browser
  await page.waitForFunction(
    () => document.querySelectorAll('.pokemon-row').length === 1,
    { timeout: 5000 },
  )

  const rows = page.locator('.pokemon-row')
  await expect(rows).toHaveCount(1)
  await expect(page.locator('.pokemon-row')).toContainText('ralts')

  await page.locator('.pokemon-row').click()
  // debounce is 200ms, give it a little more room for a real browser
  await page.waitForFunction(
    () => document.querySelectorAll('.modal-backdrop').length === 1,
    { timeout: 5000 },
  )
  await expect(page.locator('.species')).toHaveText(["ralts", "kirlia", "gardevoir", "gallade"])
})

test('testing eevee gets favorited', async ({page}) => {
  await page.goto('/')
  await expect(page.locator('.pokemon-row').first()).toBeVisible({ timeout: 1200000 })

  await page.locator('.search-input').fill('eevee')
  // debounce is 200ms, give it a little more room for a real browser
  await page.waitForFunction(
    () => document.querySelectorAll('.pokemon-row').length === 1,
    { timeout: 5000 },
  )

  const rows = page.locator('.pokemon-row')
  await expect(rows).toHaveCount(1)
  await expect(page.locator('.pokemon-row')).toContainText('eevee')

  await page.locator('.pokemon-row').click()
  // debounce is 200ms, give it a little more room for a real browser
  
  await page.locator('.favorite-btn').click()
  await page.locator('.close-btn').click()

  await page.locator('.search-input').fill('')
  await page.waitForFunction(
    () => document.querySelectorAll('.pokemon-row').length > 1,
    { timeout: 5000 },
  )
  await page.locator('.favoriteButton').click()
  await page.waitForFunction(
    () => document.querySelectorAll('.pokemon-row').length === 1,
    { timeout: 5000 },
  )
  await expect(page.locator('.pokemon-name')).toHaveText(["eevee"])

})