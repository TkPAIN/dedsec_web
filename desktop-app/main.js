const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 600,
        icon: path.join(__dirname, 'assets', 'icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        frame: true,
        titleBarStyle: 'default',
        backgroundColor: '#000000',
        show: false
    });

    // Cargar la web (copia local o remota)
    const webPath = path.join(__dirname, '../website/index.html');
    mainWindow.loadFile(webPath);

    // Menú personalizado estilo DedSec
    const template = [
        {
            label: 'DedSec OS',
            submenu: [
                { label: 'Acerca de DedSec', click: () => showAbout() },
                { type: 'separator' },
                { label: 'Salir', role: 'quit' }
            ]
        },
        {
            label: 'Colectivo',
            submenu: [
                { label: 'Foro interno', click: () => shell.openExternal('https://discord.gg/dedsec') },
                { label: 'Reportar bug', click: () => shell.openExternal('https://github.com/dedsec/report') }
            ]
        },
        {
            label: 'Ver',
            submenu: [
                { label: 'Recargar', role: 'reload' },
                { label: 'Desarrollador', role: 'toggleDevTools' },
                { type: 'separator' },
                { label: 'Pantalla completa', role: 'togglefullscreen' }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.webContents.send('app-ready', { platform: process.platform });
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function showAbout() {
    const dialog = require('electron').dialog;
    dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'DedSec OS',
        message: 'DedSec OS v1.0.0',
        detail: 'Sistema operativo del colectivo hacker.\nCifrado de extremo a extremo.\n#DespertarColectivo',
        icon: path.join(__dirname, 'assets', 'icon.png')
    });
}

// Proteger la aplicación
app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
        shell.openExternal(navigationUrl);
    });
    
    contents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        if (parsedUrl.origin !== 'file://') {
            event.preventDefault();
            shell.openExternal(navigationUrl);
        }
    });
});

app.whenReady().then(() => {
    createWindow();
    
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// Guardar datos locales
ipcMain.handle('save-data', async (event, data) => {
    const userDataPath = path.join(app.getPath('userData'), 'dedsec-data.json');
    fs.writeFileSync(userDataPath, JSON.stringify(data, null, 2));
    return { success: true };
});

ipcMain.handle('load-data', async () => {
    const userDataPath = path.join(app.getPath('userData'), 'dedsec-data.json');
    if (fs.existsSync(userDataPath)) {
        const data = fs.readFileSync(userDataPath, 'utf8');
        return JSON.parse(data);
    }
    return null;
});
