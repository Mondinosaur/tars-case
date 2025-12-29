const { app, BrowserWindow, session } = require('electron');
const { spawn, exec } = require('child_process');
const path = require('path');
const http = require('http');
const os = require('os');

app.setName('Juno');

let mainWindow;
let ollamaProcess;
let backendProcess;
let frontendProcess;

const HOME = os.homedir();
const PROJECT_DIR = path.join(HOME, 'Documents/tars-case');
const NPM_PATH = path.join(HOME, '.nvm/versions/node/v20.19.5/bin');
const PATH_ENV = `/opt/homebrew/bin:${NPM_PATH}:/usr/local/bin:${process.env.PATH}`;

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const checkService = (port) => {
  return new Promise((resolve) => {
    http.get(`http://localhost:${port}`, () => resolve(true))
      .on('error', () => resolve(false));
  });
};

const waitForServices = async () => {
  for (let i = 0; i < 60; i++) {
    const backend = await checkService(8080);
    const frontend = await checkService(5173);
    console.log(`Check ${i}: backend=${backend}, frontend=${frontend}`);
    if (backend && frontend) return true;
    await wait(1000);
  }
  return false;
};

const startServices = () => {
  const env = { ...process.env, PATH: PATH_ENV };

  console.log('Starting Ollama...');
  ollamaProcess = spawn('/opt/homebrew/bin/ollama', ['serve'], { env });
  ollamaProcess.stderr?.on('data', (d) => console.log(`Ollama: ${d}`));
  
  console.log('Starting Backend...');
  backendProcess = spawn('/bin/bash', ['-c', 
    `cd "${PROJECT_DIR}/backend" && source venv/bin/activate && uvicorn open_webui.main:app --host 0.0.0.0 --port 8080`
  ], { env });
  backendProcess.stderr?.on('data', (d) => console.log(`Backend: ${d}`));

  console.log('Starting Frontend...');
  frontendProcess = spawn('/bin/bash', ['-c',
    `cd "${PROJECT_DIR}" && npm run dev`
  ], { env });
  frontendProcess.stderr?.on('data', (d) => console.log(`Frontend: ${d}`));
};

const stopServices = () => {
  console.log('Stopping services...');
  if (ollamaProcess) ollamaProcess.kill();
  if (backendProcess) backendProcess.kill();
  if (frontendProcess) frontendProcess.kill();
  exec('pkill -f "uvicorn open_webui"');
  exec('pkill -f "vite"');
};

const createWindow = async () => {
  await session.defaultSession.clearCache();
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    title: 'Juno',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 15, y: 15 },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    }
  });

  mainWindow.loadURL('data:text/html,<html><body style="background:#1a1a1a;color:white;display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;font-family:system-ui;"><div style="font-size:32px;font-weight:600;letter-spacing:4px;margin-bottom:20px;">Juno</div><div style="font-size:16px;opacity:0.6;">Starting services...</div></body></html>');

  mainWindow.on('page-title-updated', (e) => e.preventDefault());

  const ready = await waitForServices();
  
  if (ready) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadURL('data:text/html,<html><body style="background:#1a1a1a;color:#ff6b6b;display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;font-family:system-ui;"><div style="font-size:24px;">Failed to start services</div><div style="font-size:14px;opacity:0.6;margin-top:10px;">Check console for errors</div></body></html>');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.whenReady().then(() => {
  startServices();
  createWindow();
});

app.on('window-all-closed', () => {
  stopServices();
  app.quit();
});

app.on('before-quit', () => {
  stopServices();
});
