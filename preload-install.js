const { ipcRenderer } = require('electron');
window.addEventListener('DOMContentLoaded', () => {
    navigator.serviceWorker.register('service-worker.js', {scope: './'})
        .then(registration => ipcRenderer.send('IPC_SW_INSTALLED') )
        .catch(error => ipcRenderer.send('IPC_SW_FAILED'));
  })
