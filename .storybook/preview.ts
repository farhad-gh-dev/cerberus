/// <reference types="vite/client" />
import type { Preview } from '@storybook/react-vite'
import '../src/renderer/src/assets/main.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
  initialGlobals: {
    backgrounds: { value: 'dark' }
  },
  decorators: [
    (Story, context) => {
      const bg = context.globals.backgrounds?.value ?? 'dark'
      const isDark = bg === 'dark'
      const root = document.documentElement
      root.classList.toggle('dark', isDark)
      document.body.style.backgroundColor = isDark ? '#0a0a0a' : '#e9ecef'
      return Story()
    }
  ]
}

export default preview
