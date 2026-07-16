import DefaultTheme from 'vitepress/theme'
import './Font.css'
import './RayGreen.css'


// Met、RayGreen主题配置
export default {
  extends: DefaultTheme,
  setup() {
    if (typeof window !== 'undefined') {
      const updateProgress = () => {
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        const progress = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0

        document.documentElement.style.setProperty('--scroll-progress', progress.toString())
      }

      window.addEventListener('scroll', updateProgress, { passive: true })
      updateProgress()
    }
  }
}
