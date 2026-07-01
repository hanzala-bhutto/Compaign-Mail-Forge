import { test, expect } from '@playwright/test'

test.describe('Campaigns list', () => {
  test('redirects from / to /campaigns and shows the campaign list', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/campaigns$/)
    await expect(page.getByRole('heading', { name: 'Campaigns' })).toBeVisible()
    await expect(page.getByText('Launch')).toBeVisible()
    await expect(page.getByText('draft')).toBeVisible()
  })

  test('navigates to campaign detail when a card is clicked', async ({ page }) => {
    await page.goto('/campaigns')
    await page.getByText('Launch').click()
    await expect(page).toHaveURL(/\/campaigns\/camp-1$/)
    await expect(page.getByRole('heading', { name: 'Launch' })).toBeVisible()
  })

  test('highlights the Campaigns nav link as active', async ({ page }) => {
    await page.goto('/campaigns')
    const navLink = page.getByRole('link', { name: 'Campaigns' })
    await expect(navLink).toHaveClass(/text-primary/)
  })
})
