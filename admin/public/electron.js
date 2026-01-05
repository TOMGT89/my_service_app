const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 1024,
        minHeight: 768,
        title: 'Service Manager',
        // icon: path.join(__dirname, 'favicon.ico'), // Ensure you have an icon
        webPreferences: {
            nodeIntegration: true, // Be careful with this in production
            contextIsolation: false, // For easier IPC in this prototype phase
            // preload: path.join(__dirname, 'preload.js'), // Recommended for security later
        },
        autoHideMenuBar: true, // Modern look
        titleBarStyle: 'hidden', // Custom title bar if desired
        titleBarOverlay: {
            color: '#0f172a',
            symbolColor: '#ffffff'
        }
    });

    // Load the app
    if (isDev) {
        // In Dev: Load from Vite Dev Server
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools(); // Open DevTools
    } else {
        // In Prod: Load built files
        // Ensure "homepage": "./" is set in package.json for relative paths
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
    return mainWindow;
}

// App Lifecycle
app.whenReady().then(async () => {
    console.log('🚀 STARING GEOTER APP - VERSION 2.0');
    console.log('🧹 CLEARING APP CACHE...');

    const win = createWindow();

    // Force Clear Cache
    await win.webContents.session.clearCache();
    console.log('✅ CACHE CLEARED! LOADING UI...');

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// --- IPC HANDLERS (Communication Frontend <-> Electron) ---

// Example: Get App Version
ipcMain.handle('get-app-version', () => app.getVersion());

// Example: Print to PDF (Native handling)
ipcMain.handle('print-to-pdf', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    // Implementation for silent print or PDF generation
    // const data = await win.webContents.printToPDF({});
    // return data;
    return { success: true };
});
