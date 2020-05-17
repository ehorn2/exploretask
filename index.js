const { app, BrowserWindow } = require('electron')
var win
var newWin = function() {
  win = new BrowserWindow({
    width: 400,
    height: 400,
    webPreferences: {
      nodeIntegration: true
    }
  })
  win.setResizable(false)
  win.setContentSize(800,400)
  win.loadFile('index.html')
  win.webContents.on('devtools-opened', () => {
    win.setResizable(true)
  })
}

app.on('ready', () => {
  newWin()
})

exports.windowSize = (w, h) => {
  win.setContentSize(w, h)
  win.center()
}