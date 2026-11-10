import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, MotionConfig, useReducedMotion } from 'motion/react'
import {
  ArrowDown, ArrowDownToLine, ArrowRight, ArrowUpRight, Box, Check, ChevronDown,
  Code2, Copy, GitFork as Github, Layers3, BriefcaseBusiness as Linkedin, LockKeyhole, MapPin, Menu, Moon,
  Pause, Play, RotateCcw, Scan, Smartphone, Sun, X,
} from 'lucide-react'
import { experience, filters, profile, projects, skillGroups, type Project, type WorkFilter } from './data'
import ContactForm from './ContactForm'
import './portfolio.css'

const SpatialScene = lazy(() => import('./SpatialScene'))
const navigation = [['Work', '#work'], ['About', '#about'], ['Toolkit', '#toolkit'], ['Journey', '#journey']] as const

function PortraitFallback() {
  return <div className="scene-fallback"><img src="/media/portrait.png" width="617" height="669" alt="Krishnanandh N" fetchPriority="high" /></div>
}

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    return this.state.failed ? <PortraitFallback /> : this.props.children
  }
}

function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <motion.div className={className} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.08 }} transition={{ duration: 0.5 }}>{children}</motion.div>
}

function FilterBar({ value, onChange, label, allLabel }: { value: WorkFilter; onChange: (value: WorkFilter) => void; label: string; allLabel?: string }) {
  return (
    <div className="filter-bar" role="group" aria-label={label}>
      {filters.map(filter => <button key={filter} type="button" className={`filter ${value === filter ? 'active' : ''}`} aria-pressed={value === filter} onClick={() => onChange(filter)}>{filter === 'All work' && allLabel ? allLabel : filter}</button>)}
    </div>
  )
}

function EnterpriseVisual() {
  return (
    <div className="enterprise-visual" aria-label="Conceptual Unity to native mobile integration diagram, not a product screenshot" role="img">
      <div className="diagram-caption mono"><span className="tiny-dot" /> UNITY AS A LIBRARY</div>
      <div className="diagram-flow">
        <div className="diagram-platform"><Smartphone size={21} /><span>iOS</span></div>
        <span className="diagram-line" />
        <div className="diagram-engine"><Box size={48} strokeWidth={1} /><strong>UNITY</strong><span>AR CORE</span></div>
        <span className="diagram-line" />
        <div className="diagram-platform"><Smartphone size={21} /><span>Android</span></div>
      </div>
      <div className="diagram-chips mono"><span><Scan size={12} /> SPATIAL</span><span><Layers3 size={12} /> NATIVE</span></div>
      <span className="diagram-coordinate mono">WORLD SPACE / LOCAL EXPERIENCE</span>
    </div>
  )
}

function ProjectCard({ project, onPlay }: { project: Project; onPlay: (project: Project) => void }) {
  return (
    <article className={`project-card ${project.confidential ? 'project-featured' : ''}`}>
      {project.confidential ? <EnterpriseVisual /> : (
        <button className="project-media" type="button" onClick={() => onPlay(project)} aria-label={`Watch ${project.title} gameplay`}>
          <img src={project.poster} alt={`${project.title} gameplay captured in Unity`} loading="lazy" width="1280" height={project.id === 'flappy-bird' ? '750' : '804'} />
          <span className="media-badge mono">GAMEPLAY / PROTOTYPE</span>
          <span className="play-circle"><Play size={22} fill="currentColor" /></span>
          <span className="media-action">Watch gameplay <ArrowUpRight size={16} /></span>
        </button>
      )}
      <div className="project-content">
        <div className="project-meta"><span className="eyebrow">{project.eyebrow}</span><span className={`project-badge ${project.confidential ? 'nda' : ''}`}>{project.confidential ? <LockKeyhole size={11} /> : <Code2 size={11} />}{project.confidential ? 'Under NDA' : 'AI-assisted'}</span></div>
        <h3>{project.title}</h3>
        <p className="project-description">{project.description}</p>
        <p className="project-role">{project.role}</p>
        <ul className="project-highlights">{project.highlights.map(highlight => <li key={highlight}>{highlight}</li>)}</ul>
        <div className="tech-tags">{project.stack.map(tech => <span key={tech}>{tech}</span>)}</div>
        <div className="project-links">
          {project.github ? <><a href={project.github} target="_blank" rel="noreferrer"><Github size={16} /> View source <ArrowUpRight size={14} /></a><button type="button" onClick={() => onPlay(project)}><Play size={15} /> Gameplay</button></> : <span className="nda-note"><LockKeyhole size={13} /> Product identity and proprietary material withheld.</span>}
        </div>
      </div>
    </article>
  )
}

function VideoDialog({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (project) dialog.current?.showModal()
    else dialog.current?.close()
  }, [project])
  return (
    <dialog ref={dialog} className="video-dialog" aria-labelledby="video-title" onClose={onClose} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close() }}>
      {project && <><div className="dialog-heading"><div><span className="eyebrow">Personal project / AI-assisted</span><h2 id="video-title">{project.title}</h2></div><button className="icon-button" type="button" aria-label="Close gameplay" onClick={() => dialog.current?.close()}><X size={21} /></button></div><video key={project.id} controls autoPlay playsInline preload="metadata" poster={project.poster} aria-label={`${project.title} gameplay recording`}><source src={project.video} type="video/mp4" /><a href={project.video}>Download gameplay recording</a></video><p className="dialog-footer">Unity prototype recording <span>Developed with AI coding tools</span></p></>}
    </dialog>
  )
}

function App() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')
  const [menuOpen, setMenuOpen] = useState(false)
  const [workFilter, setWorkFilter] = useState<WorkFilter>('All work')
  const [skillFilter, setSkillFilter] = useState<WorkFilter>('All work')
  const [playing, setPlaying] = useState(true)
  const [sceneVersion, setSceneVersion] = useState(0)
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const [openExperience, setOpenExperience] = useState('trenser')
  const reducedMotion = useReducedMotion()
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const menuButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('kn-theme', theme) } catch { return }
  }, [theme])

  useEffect(() => {
    const closeMenu = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menuOpen) { setMenuOpen(false); menuButton.current?.focus() }
    }
    window.addEventListener('keydown', closeMenu)
    return () => window.removeEventListener('keydown', closeMenu)
  }, [menuOpen])

  useEffect(() => () => { if (copyTimer.current) clearTimeout(copyTimer.current) }, [])

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setCopyError(false)
      if (copyTimer.current) clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopied(false), 2500)
    } catch { setCopyError(true) }
  }

  const visibleProjects = projects.filter(project => workFilter === 'All work' || project.categories.includes(workFilter))
  const visibleSkills = skillGroups.filter(group => skillFilter === 'All work' || group.category === skillFilter)

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <div className="header-inner container">
          <a className="wordmark" href="#home" title="Krishnanandh home">kn<span>.</span><span className="wordmark-label mono">UNITY / XR</span></a>
          <nav id="main-navigation" className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">{navigation.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}<a className="mobile-contact" href="#contact" onClick={() => setMenuOpen(false)}>Contact <ArrowUpRight size={14} /></a></nav>
          <div className="header-actions">
            <a className="header-contact" href="#contact">Let's talk <ArrowUpRight size={15} /></a>
            <button type="button" className="icon-button tooltip" data-tooltip={theme === 'dark' ? 'Light theme' : 'Dark theme'} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
            <button ref={menuButton} type="button" className="icon-button menu-button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="hero" id="home" aria-labelledby="hero-title">
          <div className="hero-grid" aria-hidden="true" />
          <div className="container hero-inner">
            <motion.div className="hero-copy" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
              <div className="availability mono"><span className="status-dot" /> OPEN TO ROLES & RELOCATION</div>
              <p className="hero-role mono">UNITY AR / XR DEVELOPER</p>
              <h1 id="hero-title" aria-label="Krishnanandh N">KRISHNANANDH<span className="hero-initial">N<span className="accent">.</span></span></h1>
              <h2>Unity-powered AR.<br /><span>Native mobile integration.</span></h2>
              <p className="hero-description">I bring Unity into the real world. Building AR camera experiences and connecting spatial software with native iOS & Android apps.</p>
              <div className="hero-ctas"><a className="button button-primary" href="#work">Explore my work <ArrowDown size={16} /></a><a className="button button-ghost" href={profile.resume} download><ArrowDownToLine size={16} /> Resume <ArrowUpRight size={14} /></a></div>
              <div className="hero-location"><MapPin size={13} /><span>{profile.location}</span><span className="location-separator">/</span><a href={profile.github} aria-label="GitHub profile" target="_blank" rel="noreferrer"><Github size={16} /></a><a href={profile.linkedin} aria-label="LinkedIn profile" target="_blank" rel="noreferrer"><Linkedin size={16} /></a></div>
            </motion.div>
            <div className="hero-visual">
              <span className="scene-label mono"><span className="tiny-dot" /> KN / 001</span>
              <div className="scene-canvas"><SceneBoundary><Suspense fallback={<PortraitFallback />}><SpatialScene key={sceneVersion} playing={playing} reducedMotion={Boolean(reducedMotion)} /></Suspense></SceneBoundary></div>
              <div className="scene-bottom"><span className="mono">REAL-TIME. REAL POSSIBILITIES.</span><div className="scene-controls"><button className="icon-button tooltip" data-tooltip={playing ? 'Pause scene' : 'Play scene'} aria-label={playing ? 'Pause 3D animation' : 'Play 3D animation'} aria-pressed={!playing} type="button" onClick={() => setPlaying(!playing)} disabled={Boolean(reducedMotion)}>{playing ? <Pause size={14} /> : <Play size={14} />}</button><button className="icon-button tooltip" data-tooltip="Reset scene" aria-label="Reset 3D view" type="button" onClick={() => setSceneVersion(sceneVersion + 1)}><RotateCcw size={14} /></button></div></div>
            </div>
          </div>
          <div className="hero-proof container"><div><strong>5<span>+</span></strong><span>Years in software<br />engineering</span></div><div><Smartphone size={26} strokeWidth={1.2} /><span>iOS & Android<br />Native integration</span></div><div><Scan size={29} strokeWidth={1.2} /><span>Commercial AR<br />From concept to release</span></div><a href="#work" className="scroll-cue mono">SCROLL TO EXPLORE <ArrowDown size={15} /></a></div>
        </section>

        <div className="stack-band"><div className="container" role="region" aria-label="Core technologies" tabIndex={0}><span><Box size={16} /> UNITY</span><span>AR FOUNDATION</span><span>C# / SWIFT</span><span>iOS + ANDROID</span><span>UNITY AS A LIBRARY</span></div></div>

        <section className="section container" id="work" aria-labelledby="work-title">
          <Reveal><div className="section-top"><div><p className="section-index mono">01 / SELECTED WORK</p><h2 id="work-title">Built for the real world<span className="accent">.</span></h2></div><p className="section-aside">Commercial experiences.<br />Independent experiments.</p></div></Reveal>
          <FilterBar value={workFilter} onChange={setWorkFilter} label="Filter projects" />
          <p className="sr-only" role="status">{visibleProjects.length} projects shown</p>
          <div className="projects-grid">{visibleProjects.map(project => <Reveal key={project.id} className={project.confidential ? 'featured-wrapper' : ''}><ProjectCard project={project} onPlay={setActiveProject} /></Reveal>)}</div>
          <div className="work-footnote"><span><Code2 size={14} /> Personal projects developed in collaboration with AI coding tools.</span><a href={profile.github} target="_blank" rel="noreferrer">More on GitHub <ArrowUpRight size={14} /></a></div>
        </section>

        <section className="about-section" id="about" aria-labelledby="about-title">
          <div className="container about-grid"><Reveal><p className="section-index mono">02 / A LITTLE CONTEXT</p><h2 id="about-title">The bridge between<br />Unity & native<span className="accent">.</span></h2><div className="about-signature"><span className="mono">ENGINE</span><span className="signature-line" /><Box size={30} strokeWidth={1.1} /><ArrowRight size={20} /><Smartphone size={28} strokeWidth={1.1} /><span className="signature-line" /><span className="mono">DEVICE</span></div></Reveal><Reveal className="about-copy"><p className="lead">I like making complex systems feel effortless on the other side of the screen.</p><p>I'm Krishnanandh, a software engineer with 5+ years of experience building Unity applications, including 3+ years in AR. My focus is the point where real-time 3D meets everyday mobile experiences.</p><p>As the sole Unity developer on a commercial AR camera project, I worked alongside multiple Android and iOS developers to bring spatial features into a native app ecosystem. My work spans C# logic, AR camera workflows, themed interfaces, and integration across native toolchains.</p><p>Beyond commercial AR and medical applications, I explore gameplay systems through AI-assisted Unity projects. Away from the editor, you'll find me travelling or gaming.</p><div className="about-details"><span><MapPin size={14} /> Based in Kerala, India</span><span><span className="tiny-dot" /> Open to relocation</span></div></Reveal></div>
        </section>

        <section className="section container" id="toolkit" aria-labelledby="toolkit-title">
          <Reveal><div className="section-top"><div><p className="section-index mono">03 / THE TOOLKIT</p><h2 id="toolkit-title">The right tools. Thoughtfully used<span className="accent">.</span></h2></div></div></Reveal>
          <FilterBar value={skillFilter} onChange={setSkillFilter} label="Filter skills" allLabel="All skills" />
          <p className="sr-only" role="status">{visibleSkills.length} skill groups shown</p>
          <div className="skills-grid">{visibleSkills.map((group) => { const Icon = group.icon === 'scan' ? Scan : group.icon === 'mobile' ? Smartphone : group.icon === 'box' ? Box : Code2; return <Reveal key={group.title} className="skill-group"><div className="skill-heading"><Icon size={22} strokeWidth={1.3} /><h3>{group.title}</h3></div><ul>{group.skills.map(skill => <li key={skill}>{skill}</li>)}</ul></Reveal> })}</div>
        </section>

        <section className="journey-section" id="journey" aria-labelledby="journey-title"><div className="container journey-grid"><Reveal><p className="section-index mono">04 / THE JOURNEY</p><h2 id="journey-title">A foundation.<br />Always building<span className="accent">.</span></h2><p className="journey-intro">From computer engineering to shipping interactive experiences.</p><a className="text-link" href={profile.resume} download>Full resume <ArrowDownToLine size={15} /></a></Reveal><div className="timeline">{experience.map(entry => <div className={`timeline-entry ${openExperience === entry.id ? 'expanded' : ''}`} key={entry.id}><span className="timeline-dot" /><button className="timeline-trigger" type="button" aria-expanded={openExperience === entry.id} aria-controls={`experience-${entry.id}`} onClick={() => setOpenExperience(openExperience === entry.id ? '' : entry.id)}><span><span className="timeline-date mono">{entry.date}</span><strong>{entry.title}</strong><span className="timeline-organization">{entry.organization}</span></span><ChevronDown size={19} /></button><div id={`experience-${entry.id}`} hidden={openExperience !== entry.id} className="timeline-content"><p>{entry.summary}</p><ul>{entry.details.map(detail => <li key={detail}>{detail}</li>)}</ul><span className="timeline-location"><MapPin size={12} /> {entry.location}</span></div></div>)}</div></div></section>

        <section className="section container contact-section" id="contact" aria-labelledby="contact-title"><Reveal><div className="contact-heading"><div><p className="section-index mono">05 / WHAT'S NEXT?</p><h2 id="contact-title">Let's build<br />something that matters<span className="accent">.</span></h2></div><div className="contact-availability"><span className="status-dot" /><span>Open to roles<br />& relocation</span></div></div></Reveal><div className="contact-grid"><div className="contact-details"><p>Senior Unity AR/XR opportunities, native mobile integration, and interesting technical challenges.</p><a className="email-link" href={`mailto:${profile.email}`}>{profile.email}<ArrowUpRight size={19} /></a><button type="button" className={`copy-button ${copied ? 'copied' : ''}`} onClick={copyEmail}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? 'Email copied' : 'Copy email address'}</button><p className="sr-only" role="status">{copied ? 'Email address copied to clipboard.' : copyError ? `Copy unavailable. Email: ${profile.email}` : ''}</p>{copyError && <p className="copy-error">Copy unavailable. Please select the email address above.</p>}<div className="contact-socials"><a href={profile.github} target="_blank" rel="noreferrer"><Github size={18} /> GitHub <ArrowUpRight size={13} /></a><a href={profile.linkedin} target="_blank" rel="noreferrer"><Linkedin size={18} /> LinkedIn <ArrowUpRight size={13} /></a></div></div><ContactForm /></div></section>
      </main>
      <footer className="site-footer"><div className="container"><a href="#home" className="wordmark" title="Back to top">kn<span>.</span></a><span>© {new Date().getFullYear()} Krishnanandh N</span><span className="footer-note mono">THOUGHTFULLY BUILT. ALWAYS EXPLORING.</span><a href="#home" className="back-top">Back to top <ArrowUpRight size={14} /></a></div></footer>
      <VideoDialog project={activeProject} onClose={() => setActiveProject(null)} />
    </MotionConfig>
  )
}

export default App