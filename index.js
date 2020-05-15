const { app, BrowserWindow } = require('electron')

var newWin = function() {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })
  win.setResizable(false)
  win.setContentSize(800,600)
  win.loadFile('index.html')
  win.webContents.on('devtools-opened', () => {
    win.setResizable(true)
  })
}

app.on('ready', () => {
  newWin()
})