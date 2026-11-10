import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import assert from 'node:assert/strict'
import mupdf from 'mupdf'

const distribution = fileURLToPath(new URL('../dist/', import.meta.url))
const confidential = /fujifilm|instax|mini link|expected ctc/i
const forbidden = /8129275281|fujifilm|instax|mini link|expected ctc/i
for (const file of readdirSync(distribution, { recursive: true })) {
  if (/\.(html|js|css|json|txt)$/i.test(file)) {
    assert.ok(!forbidden.test(readFileSync(path.join(distribution, file), 'utf8')), `Private content found in ${file}`)
  }
  assert.ok(!/KRISHNANANDH_N_UNITY_XR_DEV|KRISHNANANDH_N_RESUME|\.mov$/i.test(file), `Source asset in build: ${file}`)
}
const resume = mupdf.Document.openDocument(readFileSync(path.join(distribution, 'media/Krishnanandh-N-Resume.pdf')), 'application/pdf')
let text = ''
for (let index = 0; index < resume.countPages(); index++) {
  const page = resume.loadPage(index)
  text += page.toStructuredText({}).asText()
}
assert.ok(!confidential.test(text), 'Confidential content found in public resume')
assert.ok(text.includes('8129275281'), 'The original resume phone number must remain in the downloadable PDF')
assert.ok(text.includes('krishnanandhn33@gmail.com'), 'Public contact email must remain in resume')
console.log('Public build verified: original resume includes phone; webpage excludes phone and confidential product identity; no source files or original recordings published.')