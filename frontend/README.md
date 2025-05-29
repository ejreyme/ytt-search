# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

```yaml
- **For Hot Reloading in Development:** Add the `FLASK_ENV=development` environment variable and a volume in `docker-compose.yml`:


flask-backend:
  build:
    context: ./backend
    dockerfile: Dockerfile
  ports:
    - "9003:9003"
  environment:
    - FLASK_ENV=development # Enable development mode
  volumes:
    - ./backend:/app # Mount the backend source code for real-time changes
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:9003/health"]
    interval: 10s
    timeout: 5s
    retries: 3
  networks:
    - app-network
```
