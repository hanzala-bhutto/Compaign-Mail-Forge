import { test, expect } from '@playwright/test'

test.describe('Analytics', () => {
  test('shows analytics stats for a campaign', async ({ page }) => {
    await page.goto('/analytics/camp-1')

    await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible()
    await expect(page.getByText('Delivered')).toBeVisible()
    await expect(page.getByText('100')).toBeVisible()
    await expect(page.getByText('42')).toBeVisible()
  })

  test('back link returns to the campaign detail page', async ({ page }) => {
    await page.goto('/analytics/camp-1')
    await page.getByRole('link', { name: 'Back to Campaign' }).click()
    await expect(page).toHaveURL(/\/campaigns\/camp-1$/)
  })
})
