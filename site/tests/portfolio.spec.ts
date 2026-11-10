import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { readFileSync } from 'node:fs'

async function canvasSignature(page: Page) {
  return page.locator('canvas').evaluate((canvas: HTMLCanvasElement) => {
    const sample = document.createElement('canvas')
    sample.width = canvas.width
    sample.height = canvas.height
    const context = sample.getContext('2d')!
    context.drawImage(canvas, 0, 0)
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
    let painted = 0
    let portraitPixels = 0
    let signature = 0
    for (let index = 0; index < pixels.length; index += 4) {
      if (pixels[index + 3] > 0) painted++
      if (pixels[index + 3] > 200 && pixels[index] > 100 && pixels[index + 1] > 55 && pixels[index] > pixels[index + 1] * 1.12 && pixels[index + 1] > pixels[index + 2] * 1.12) portraitPixels++
      signature = (signature + pixels[index] * (index + 1) + pixels[index + 1]) % 2147483647
    }
    return { painted, portraitPixels, signature }
  })
}

test('responsive content, real assets, and nonblank spatial canvas', async ({ page }, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Krishnanandh N', exact: true })).toBeVisible()
  await expect(page.locator('.project-card')).toHaveCount(3)
  await expect(page.locator('canvas')).toBeVisible()
  await expect.poll(async () => (await canvasSignature(page)).painted).toBeGreaterThan(1000)
  await expect(page.getByRole('img', { name: 'Interactive photo portrait of Krishnanandh N with 3D depth' })).toBeVisible()
  await expect.poll(async () => (await canvasSignature(page)).portraitPixels).toBeGreaterThan(100)
  const portraitAsset = await page.evaluate(async () => {
    const image = new Image()
    image.src = '/media/portrait.png'
    await image.decode()
    const sample = document.createElement('canvas')
    sample.width = image.naturalWidth
    sample.height = image.naturalHeight
    const context = sample.getContext('2d')!
    context.drawImage(image, 0, 0)
    const pixels = context.getImageData(0, 0, sample.width, sample.height).data
    let transparent = 0
    for (let index = 3; index < pixels.length; index += 4) if (pixels[index] < 10) transparent++
    return { width: sample.width, height: sample.height, transparent: transparent / (sample.width * sample.height) }
  })
  expect(portraitAsset.width).toBe(617)
  expect(portraitAsset.height).toBe(669)
  expect(portraitAsset.transparent).toBeGreaterThan(0.3)
  const stillPortrait = (await canvasSignature(page)).signature
  await page.locator('.portrait-stage').dispatchEvent('pointermove', { clientX: 40, clientY: 40, pointerType: 'mouse' })
  expect((await canvasSignature(page)).signature).toBe(stillPortrait)
  await expect(page.getByRole('button', { name: 'Pause 3D animation', exact: true })).toBeDisabled()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  expect(overflow).toBe(false)
  const clipped = await page.locator('h1, h2, h3, .button').evaluateAll(elements => elements.filter(element => element.scrollWidth > element.clientWidth + 2).map(element => element.textContent))
  expect(clipped).toEqual([])
  await page.screenshot({ path: testInfo.outputPath('hero.png') })
  for (const section of ['#work', '#about', '#toolkit', '#journey', '#contact']) await page.locator(section).scrollIntoViewIfNeeded()
  await expect.poll(() => page.locator('.project-media img').evaluateAll(images => images.every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: testInfo.outputPath('full-page.png'), fullPage: true })
  expect(errors).toEqual([])
})

test('project and skill filters are independent and accurate', async ({ page }) => {
  await page.goto('/')
  const work = page.getByRole('group', { name: 'Filter projects' })
  await work.getByRole('button', { name: 'AR / XR', exact: true }).click()
  await expect(page.locator('.project-card')).toHaveCount(1)
  await expect(page.getByRole('heading', { name: 'AR, beyond the screen.' })).toBeVisible()
  await work.getByRole('button', { name: 'Native mobile', exact: true }).click()
  await expect(page.locator('.project-card')).toHaveCount(1)
  await work.getByRole('button', { name: 'Game development', exact: true }).click()
  await expect(page.locator('.project-card')).toHaveCount(2)
  await expect(page.locator('.project-featured')).toHaveCount(0)
  const skills = page.getByRole('group', { name: 'Filter skills' })
  await skills.getByRole('button', { name: 'Native mobile', exact: true }).click()
  await expect(page.locator('.skill-group')).toHaveCount(1)
  await expect(page.getByRole('heading', { name: 'Native mobile integration', exact: true })).toBeVisible()
  await expect(page.locator('.skill-group')).not.toContainText('Bluetooth peripherals')
  await expect(page.locator('.project-card')).toHaveCount(2)
  await work.getByRole('button', { name: 'All work', exact: true }).click()
  await expect(page.locator('.project-card')).toHaveCount(3)
})

test('light theme persists and both themes meet core accessibility checks', async ({ page }, testInfo) => {
  await page.goto('/')
  for (const theme of ['dark', 'light']) {
    if (theme === 'light') await page.getByRole('button', { name: 'Switch to light theme' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme)
    await expect.poll(() => page.locator('main [style*="opacity"]').evaluateAll(elements => elements.filter(element => {
      const bounds = element.getBoundingClientRect()
      return bounds.top < innerHeight && bounds.bottom > 0
    }).every(element => getComputedStyle(element).opacity === '1'))).toBe(true)
    const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    expect(audit.violations).toEqual([])
  }
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(page.locator('.hero-copy')).toHaveCSS('opacity', '1')
  await expect(page.locator('canvas')).toBeVisible()
  await expect.poll(async () => (await canvasSignature(page)).painted).toBeGreaterThan(1000)
  await page.screenshot({ path: testInfo.outputPath('light-theme.png') })
})

test('timeline exposes and hides the matching experience details', async ({ page }) => {
  await page.goto('/')
  const job = page.getByRole('button', { name: /Sep 2021 - Present Software Engineer/ })
  await expect(job).toHaveAttribute('aria-expanded', 'true')
  await job.click()
  await expect(page.locator('#experience-trenser')).toBeHidden()
  const education = page.getByRole('button', { name: /May 2021 Diploma/ })
  await education.click()
  await expect(education).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator('#experience-education')).toBeVisible()
})

test('both gameplay recordings load and modal closes with Escape', async ({ page }) => {
  await page.goto('/')
  for (const title of ['Zombie World', 'Flappy Bird']) {
    await page.getByRole('button', { name: `Watch ${title} gameplay`, exact: true }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('heading', { name: title, exact: true }).last()).toBeVisible()
    await expect.poll(() => page.locator('video').evaluate((video: HTMLVideoElement) => video.readyState), { timeout: 15000 }).toBeGreaterThanOrEqual(2)
    await expect.poll(() => page.locator('video').evaluate((video: HTMLVideoElement) => video.videoWidth)).toBeGreaterThan(0)
    await page.locator('video').evaluate((video: HTMLVideoElement) => video.pause())
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(page.locator('video')).toHaveCount(0)
  }
})

test('copy contact and original resume download work while phone stays off the webpage', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/')
  await page.getByRole('button', { name: 'Copy email address', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Email copied', exact: true })).toBeVisible()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('krishnanandhn33@gmail.com')
  const downloadEvent = page.waitForEvent('download')
  await page.getByRole('link', { name: 'Resume', exact: true }).click()
  const download = await downloadEvent
  expect(download.suggestedFilename()).toBe('Krishnanandh-N-Resume.pdf')
  const downloadedPath = await download.path()
  expect(downloadedPath).not.toBeNull()
  expect(readFileSync(downloadedPath!)).toEqual(readFileSync(new URL('../public/media/Krishnanandh-N-Resume.pdf', import.meta.url)))
  await expect(page.locator('body')).not.toContainText(/8129275281|fujifilm|instax|mini link|expected ctc/i)
})

test('3D animation moves, responds to pointer, and exposes pause and reset controls', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  await expect(page.locator('canvas')).toBeVisible()
  await expect.poll(async () => (await canvasSignature(page)).painted).toBeGreaterThan(1000)
  const first = (await canvasSignature(page)).signature
  await expect.poll(async () => (await canvasSignature(page)).signature).not.toBe(first)
  await page.getByRole('button', { name: 'Pause 3D animation', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Play 3D animation', exact: true })).toHaveAttribute('aria-pressed', 'true')
  const box = await page.locator('canvas').boundingBox()
  const beforePointer = (await canvasSignature(page)).signature
  if (box) await page.mouse.move(box.x + box.width * .8, box.y + box.height * .25)
  await expect.poll(async () => (await canvasSignature(page)).signature).not.toBe(beforePointer)
  const beforeTouch = (await canvasSignature(page)).signature
  if (box) {
    await page.locator('.portrait-stage').dispatchEvent('pointerdown', { clientX: box.x + box.width * .2, clientY: box.y + box.height * .75, pointerType: 'touch' })
    await expect.poll(async () => (await canvasSignature(page)).signature).not.toBe(beforeTouch)
    await page.locator('.portrait-stage').dispatchEvent('pointercancel', { pointerType: 'touch' })
  }
  await page.getByRole('button', { name: 'Reset 3D view', exact: true }).click()
  await expect.poll(async () => (await canvasSignature(page)).painted).toBeGreaterThan(1000)
})

test('portrait photo remains visible when WebGL is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = new Proxy(original, {
      apply(target, receiver, argumentsList) {
        if (['webgl', 'webgl2', 'experimental-webgl'].includes(argumentsList[0])) return null
        return Reflect.apply(target, receiver, argumentsList)
      },
    })
  })
  await page.goto('/')
  const portrait = page.locator('.scene-fallback img')
  await expect(portrait).toBeVisible()
  await expect.poll(() => portrait.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth === 617)).toBe(true)
  await expect(page.getByRole('link', { name: 'Explore my work' })).toBeVisible()
})

test('contact validates input and uses an honest email-draft fallback', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Open email draft' }).click()
  expect(await page.locator('input[name="name"]').evaluate(input => (input as HTMLInputElement).validity.valueMissing)).toBe(true)
  await page.getByRole('textbox', { name: 'Your name' }).fill('Test Recruiter')
  await page.getByRole('textbox', { name: 'Email address', exact: true }).fill('recruiter@example.com')
  await page.getByRole('textbox', { name: 'What do you have in mind?' }).fill('I would like to discuss a Unity AR engineering opportunity.')
  await page.getByRole('button', { name: 'Open email draft' }).click()
  await expect(page.locator('.form-status')).toContainText('Email draft requested')
})

test('mobile navigation opens, navigates, and closes with Escape', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile navigation only')
  await page.goto('/')
  await page.getByRole('button', { name: 'Open navigation' }).click()
  await expect(page.getByRole('navigation')).toBeVisible()
  await page.getByRole('navigation').getByRole('link', { name: 'Work', exact: true }).click()
  await expect(page.getByRole('navigation')).toBeHidden()
  await expect(page).toHaveURL(/#work$/)
  await page.getByRole('button', { name: 'Open navigation' }).click()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused()
})

test('compact and wide screens have no horizontal or heading overflow', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Additional desktop viewport sweep')
  for (const width of [320, 560, 640, 1024, 1920]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/')
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false)
    expect(await page.locator('h1, h2, h3').evaluateAll(elements => elements.some(element => element.scrollWidth > element.clientWidth + 2))).toBe(false)
  }
})

test.describe('configured Formspree transport', () => {
  test('shows success only after successful delivery', async ({ page }) => {
    await page.route('https://formspree.io/f/testportfolio', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }))
    await page.goto('http://127.0.0.1:5175')
    await page.getByRole('textbox', { name: 'Your name' }).fill('Test Recruiter')
    await page.getByRole('textbox', { name: 'Email address', exact: true }).fill('test@example.com')
    await page.getByRole('textbox', { name: 'What do you have in mind?' }).fill('A test opportunity, not a real submission.')
    await page.getByRole('button', { name: 'Send message', exact: true }).click()
    await expect(page.locator('.form-status')).toContainText('Your message has been received')
    await expect(page.getByRole('textbox', { name: 'Your name' })).toHaveValue('')
  })
  test('retains the message and offers email on delivery error', async ({ page }) => {
    await page.route('https://formspree.io/f/testportfolio', route => route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"test"}' }))
    await page.goto('http://127.0.0.1:5175')
    await page.getByRole('textbox', { name: 'Your name' }).fill('Test Recruiter')
    await page.getByRole('textbox', { name: 'Email address', exact: true }).fill('test@example.com')
    await page.getByRole('textbox', { name: 'What do you have in mind?' }).fill('A test opportunity, not a real submission.')
    await page.getByRole('button', { name: 'Send message', exact: true }).click()
    await expect(page.locator('.form-status')).toContainText('Could not send your message')
    await expect(page.getByRole('textbox', { name: 'Your name' })).toHaveValue('Test Recruiter')
  })
})