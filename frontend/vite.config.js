import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Base configuration that applies to all environments
  const config = {
    plugins: [react()],
    server: {
      host: true,
      port: 9003,
      strictPort: true,
    }
  }
  // Development environment configuration
  if (mode === 'development') {
    config.server.proxy = {
      '/api': {
        target: 'http://localhost:9005',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    }
    // Add more development-specific settings
    console.log('Running in development mode')
  }

  // // Production environment configuration
  // if (mode === 'production') {
  //   config.server.proxy = {
  //     '/api': {
  //       target: 'http://flask:9005',
  //       changeOrigin: true,
  //       rewrite: (path) => path.replace(/^\/api/, ''),
  //     },
  //   }
  //   // Add more production-specific settings
  //   console.log('Running in production mode')
  // }

  // You can also check for specific commands
  if (command === 'serve') {
    // Dev server specific configs
  } else if (command === 'build') {
    // Build specific configs
  }

  return config
})
