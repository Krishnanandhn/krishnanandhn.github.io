const mediaBase = `${import.meta.env.BASE_URL}media/`

export const profile = {
  name: 'Krishnanandh N',
  email: 'krishnanandhn33@gmail.com',
  github: 'https://github.com/Krishnanandhn',
  linkedin: 'https://www.linkedin.com/in/krishnanandh-n-37a36124a/',
  resume: `${mediaBase}Krishnanandh-N-Resume.pdf`,
  portrait: `${mediaBase}portrait.png`,
  location: 'Thiruvananthapuram, India',
}

export const filters = ['All work', 'AR / XR', 'Native mobile', 'Game development'] as const
export type WorkFilter = typeof filters[number]

export interface Project {
  id: string
  title: string
  eyebrow: string
  description: string
  role: string
  categories: WorkFilter[]
  stack: string[]
  highlights: string[]
  github?: string
  video?: string
  poster?: string
  confidential?: boolean
}

export const projects: Project[] = [
  {
    id: 'commercial-ar', title: 'AR, beyond the screen.', eyebrow: 'Commercial / Consumer mobile',
    description: 'A feature-rich AR camera and photobooth experience embedded in a native mobile app ecosystem.',
    role: 'Unity AR Developer / Sole Unity developer', categories: ['AR / XR', 'Native mobile'],
    stack: ['Unity', 'C#', 'Swift', 'Xcode', 'Gradle', 'Unity as a Library'],
    highlights: [
      'Owned the Unity-side AR camera, spatial filters, and photobooth logic, collaborating with multiple Android and iOS developers.',
      'Built product-specific themed UI and integrated Unity features into native app workflows.',
      'Contributed to multi-printer Bluetooth workflows and alpha, beta, and store release delivery.',
    ], confidential: true,
  },
  {
    id: 'zombie-world', title: 'Zombie World', eyebrow: 'Personal / 3D survival action',
    description: 'A survival prototype built around enemy intelligence, wave systems, and responsive combat.',
    role: 'Lead Developer & Systems Designer / AI-assisted', categories: ['Game development'],
    stack: ['Unity 3D', 'C#', 'NavMesh AI', 'State machines'],
    highlights: ['Player movement, enemy pathfinding, and dynamic wave spawning.', 'Combat state management and modular gameplay systems.'],
    github: 'https://github.com/Krishnanandhn/Zombie-World', video: `${mediaBase}zombie-world.mp4`, poster: `${mediaBase}zombie-world.webp`,
  },
  {
    id: 'flappy-bird', title: 'Flappy Bird', eyebrow: 'Personal / 2D arcade',
    description: 'A familiar arcade challenge, rebuilt to explore clean physics-driven gameplay and mobile input.',
    role: 'Developer / AI-assisted', categories: ['Game development'],
    stack: ['Unity 2D', 'C#', '2D Physics', 'Mobile input'],
    highlights: ['Rigid-body collisions, score tracking, and responsive jump mechanics.', 'Infinite background scrolling and a repeatable gameplay loop.'],
    github: 'https://github.com/Krishnanandhn/Flappybird', video: `${mediaBase}flappy-bird.mp4`, poster: `${mediaBase}flappy-bird.webp`,
  },
]

export const skillGroups = [
  { title: 'AR & spatial computing', category: 'AR / XR', icon: 'scan', skills: ['AR Foundation', 'ARKit', 'ARCore', 'ARDK', 'AR camera workflows', 'Spatial filters'] },
  { title: 'Native mobile integration', category: 'Native mobile', icon: 'mobile', skills: ['Unity as a Library', 'Swift / Objective-C integration', 'Xcode', 'Android Gradle', 'iOS & Android delivery'] },
  { title: 'Unity & real-time 3D', category: 'Game development', icon: 'box', skills: ['Unity 3D / 2D', 'C#', 'Custom shaders', 'Graphics optimization', 'NavMesh AI', 'State machines'] },
  { title: 'Supporting technologies', category: 'Supporting', icon: 'code', skills: ['ASP.NET Core', 'REST APIs', 'Cross-functional delivery', 'Themed UI systems'] },
] as const

export const experience = [
  {
    id: 'trenser', date: 'Sep 2021 - Present', title: 'Software Engineer', organization: 'Trenser Technology Solutions', location: 'Thiruvananthapuram',
    summary: 'Unity development at the intersection of AR, native mobile, and real-world products.',
    details: [
      'Sole Unity developer on a commercial AR camera project, working alongside multiple native Android and iOS engineers.',
      'Delivered real-world CG object placement, spatial effects, camera capture, and product-themed interfaces.',
      'Worked with cross-functional teams through alpha, beta, and major App Store and Play Store releases.',
      'Nearly a year of experience with medical applications, adapting to domain-specific requirements.',
    ],
  },
  {
    id: 'education', date: 'May 2021', title: 'Diploma in Computer Engineering', organization: 'Maharajas Technological Institute', location: 'Thrissur',
    summary: 'The technical foundation for a career building interactive software.',
    details: ['Completed a Diploma in Computer Engineering at Maharajas Technological Institute, Thrissur.'],
  },
]