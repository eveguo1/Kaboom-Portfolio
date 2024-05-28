import { defineConfig } from "vite";

export default defineConfig({
    base: "./",
    build: {
        // npm -D install terser
        minify: "terser"
    },
});