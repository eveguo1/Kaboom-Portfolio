import { defineConfig } from "vite";

export default defineConfig({
    base: "/Kaboom-Portfolio/",
    build: {
        // npm -D install terser
        minify: "terser"
    },
});