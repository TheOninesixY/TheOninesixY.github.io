import DefaultTheme from 'vitepress/theme'
import './Font.css'
import './Met.css'

export default {
  extends: DefaultTheme,
  setup() {
    if (typeof window !== 'undefined') {
      const updateProgress = () => {
        const dividerLine = document.querySelector('.VPNavBar .divider .divider-line')
        if (!dividerLine) return

        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        const progress = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0

        dividerLine.style.setProperty('--scroll-progress', progress.toString())
      }

      window.addEventListener('scroll', updateProgress, { passive: true })
      updateProgress()
    }
  }
}
