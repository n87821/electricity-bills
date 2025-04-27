
module.exports = {
  scripts: {
    // Normal development script
    "dev": "vite",
    "build": "tsc && vite build",
    "serve": "vite preview",

    // Electron development script
    "electron:dev": "concurrently -k \"npm run dev\" \"npm run electron:start\"",
    "electron:start": "cross-env NODE_ENV=development electron electron/main.js",
    
    // Electron build scripts
    "electron:build": "npm run build && electron-builder build --config electron-builder.yml",
    "electron:build:win": "npm run build && electron-builder build --win --config electron-builder.yml",
    "electron:build:mac": "npm run build && electron-builder build --mac --config electron-builder.yml",
    "electron:build:linux": "npm run build && electron-builder build --linux --config electron-builder.yml",
  }
};
