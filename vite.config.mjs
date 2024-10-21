import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        "login.html": resolve(__dirname, 'login.html'),
        "signup.html": resolve(__dirname, 'signup.html'),
        "privacy.html": resolve(__dirname, 'privacy.html'),
        "devPortal.html": resolve(__dirname, 'devPortal.html'),
        "editProfile.html": resolve(__dirname, 'editProfile.html')
      },
    },
  },
})