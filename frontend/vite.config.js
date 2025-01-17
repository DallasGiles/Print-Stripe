import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    console.log("Loaded ENV Variables from Vite:", env); // Debugging

    return {
        plugins: [react()],
        define: {
            'process.env': env,  // Ensure env variables are available
        }
    };
});