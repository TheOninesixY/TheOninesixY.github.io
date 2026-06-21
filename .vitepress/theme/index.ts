import DefaultTheme from 'vitepress/theme'
import { defineComponent, h, onMounted, ref } from 'vue'
import './style.css'

const LoadingOverlay = defineComponent({
  name: 'LoadingOverlay',
  setup() {
    const visible = ref(true)
    const hiding = ref(false)
    const isDark = ref(
      typeof document !== 'undefined' &&
        document.documentElement.classList.contains('dark')
    )

    const updateDarkMode = () => {
      if (typeof document !== 'undefined') {
        isDark.value = document.documentElement.classList.contains('dark')
      }
    }

    onMounted(() => {
      updateDarkMode()

      const observer = new MutationObserver(() => {
        updateDarkMode()
      })

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      })

      const timer = window.setTimeout(() => {
        hiding.value = true

        window.setTimeout(() => {
          visible.value = false
        }, 350)
      }, 500)

      return () => {
        observer.disconnect()
        window.clearTimeout(timer)
      }
    })

    return () =>
      visible.value
        ? h(
            'div',
            {
              class: ['site-loading-overlay', hiding.value ? 'is-hiding' : ''],
              style: {
                background: isDark.value ? '#1B1B1F' : 'rgba(255, 255, 255, 0.98)'
              }
            },
            [
              h('div', {
                class: 'site-loading-spinner',
                style: {
                  borderTopColor: isDark.value ? '#3E63DD' : '#5672CD'
                }
              }),
              h(
                'span',
                {
                  class: 'site-loading-text',
                  style: {
                    color: isDark.value ? '#E5E7EB' : '#4B5563'
                  }
                },
                '加载中...'
              )
            ]
          )
        : null
  }
})

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-bottom': () => h(LoadingOverlay)
    })
  }
}
