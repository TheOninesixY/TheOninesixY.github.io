import DefaultTheme from 'vitepress/theme'
import { defineComponent, h, onMounted, ref } from 'vue'
import './style.css'

const LoadingOverlay = defineComponent({
  name: 'LoadingOverlay',
  setup() {
    const visible = ref(true)
    const hiding = ref(false)

    onMounted(() => {
      const timer = window.setTimeout(() => {
        hiding.value = true

        window.setTimeout(() => {
          visible.value = false
        }, 350)
      }, 500)

      return () => window.clearTimeout(timer)
    })

    return () =>
      visible.value
        ? h(
            'div',
            {
              class: ['site-loading-overlay', hiding.value ? 'is-hiding' : '']
            },
            [
              h('div', { class: 'site-loading-spinner' }),
              h('span', { class: 'site-loading-text' }, '加载中...')
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
