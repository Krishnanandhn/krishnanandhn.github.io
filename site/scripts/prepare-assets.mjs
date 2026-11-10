import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const source = path.resolve(root, '../Assets')
const media = path.join(root, 'public/media')
mkdirSync(media, { recursive: true })

const resumePath = path.join(media, 'Krishnanandh-N-Resume.pdf')
copyFileSync(path.join(source, 'Resume/KRISHNANANDH_N_UNITY_XR_DEV.pdf'), resumePath)
console.log('Resume: original PDF copied unchanged, including the phone number.')
if (process.argv.includes('--resume-only')) process.exit(0)

for (const video of [
  { source: 'FlappyBird.mov', slug: 'flappy-bird', posterAt: '8' },
  { source: 'Zombie World gameplay without audio.mp4', slug: 'zombie-world', posterAt: '30' },
]) {
  const input = path.join(source, 'ScreenRecordings', video.source)
  execFileSync('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y', '-i', input,
    '-vf', 'scale=1280:-2', '-r', '30', '-c:v', 'libx264',
    '-preset', 'fast', '-crf', '25', '-pix_fmt', 'yuv420p',
    '-an', '-movflags', '+faststart', path.join(media, `${video.slug}.mp4`),
  ], { stdio: 'inherit' })
  execFileSync('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y', '-ss', video.posterAt,
    '-i', input, '-frames:v', '1', '-vf', 'scale=1280:-2',
    '-quality', '85', path.join(media, `${video.slug}.webp`),
  ], { stdio: 'inherit' })
  const megabytes = statSync(path.join(media, `${video.slug}.mp4`)).size / 1_000_000
  console.log(`${video.slug}: browser-ready MP4 (${megabytes.toFixed(1)} MB) and WebP poster.`)
}