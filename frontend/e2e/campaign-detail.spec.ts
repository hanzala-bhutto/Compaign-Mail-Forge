import { test, expect } from '@playwright/test'

test.describe('Campaign detail', () => {
  test('shows campaign details and can send a draft campaign', async ({ page }) => {
    await page.goto('/campaigns/camp-1')

    await expect(page.getByRole('heading', { name: 'Launch' })).toBeVisible()
    await expect(page.getByText('aud-1')).toBeVisible()
    await expect(page.getByText('Hello there')).toBeVisible()

    const sendButton = page.getByRole('button', { name: 'Send Campaign' })
    await expect(sendButton).toBeVisible()
    await sendButton.click()
  })

  test('navigates to analytics from the detail page', async ({ page }) => {
    await page.goto('/campaigns/camp-1')
    await page.getByRole('link', { name: 'View Analytics' }).click()
    await expect(page).toHaveURL(/\/analytics\/camp-1$/)
    await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible()
  })

  test('shows a not-found message for an unknown campaign', async ({ page }) => {
    await page.goto('/campaigns/does-not-exist')
    await expect(page.getByText('Campaign not found.')).toBeVisible()
  })

  test('back link returns to the campaign list', async ({ page }) => {
    await page.goto('/campaigns/camp-1')
    await page.getByRole('link', { name: 'Back' }).click()
    await expect(page).toHaveURL(/\/campaigns$/)
  })
})
