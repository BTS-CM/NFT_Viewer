const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const url = require("url");

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
       nodeIntegration: true,
       enableRemoteModule:true,
       contextIsolation:false,
       preload: path.join(__dirname, "preload.js"),
       partition: 'persist:nft_viewer'
    }
  })

  const indexURL = app.isPackaged
    ? url.format({
        pathname: path.join(__dirname, './index.html'),
        protocol: 'file:',
        slashes: true
      })
    : "http://localhost:3333";
  mainWindow.loadURL(indexURL);

  // Automatically open Chrome's DevTools in development mode.
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }
}

let allowed = {
  "gallery": "https://nftea.gallery/gallery",
  "viewer": "https://github.com/BTS-CM/NFT_Viewer",
  "beet": "https://github.com/bitshares/beet/releases",
  "airdrop": "https://github.com/BTS-CM/airdrop_tool",
  "nft_tool": "https://github.com/BTS-CM/Bitshares_NFT_Issuance_Tool",
  "gallery": "https://nftea.gallery/gallery",
  "ipfs_pinata": "https://www.pinata.cloud/",
  "ipfs_nft_storage": "https://nft.storage/",
  "ipfs_web3_storage": "https://web3.storage/",
  "ipfs_fleek": "https://fleek.co/ipfs-gateway/",
  "ipfs_infura": "https://infura.io/product/ipfs",
  "ipfs_storj": "https://landing.storj.io/permanently-pin-with-storj-dcs",
  "ipfs_eternum": "https://www.eternum.io/",
  "ipfs_docs": "https://blog.ipfs.io/2021-04-05-storing-nfts-on-ipfs/",
  "nft_spec": "https://github.com/Bit20-Creative-Group/BitShares-NFT-Specification"
}

ipcMain.on('openURL', (event, arg) => {
  if (allowed.hasOwnProperty(arg)) {
    event.returnValue = 'Opening url!'
    shell.openExternal(allowed[arg]);
  }
});

let allowedDEX = {
  "XBTSIO": "https://ex.xbts.io/market/",
  "btsExchange": "https://bts.exchange/#/market/",
  "bit20": "https://wallet.btwty.com/market/",
  "lightClient": "https://github.com/bitshares/bitshares-ui/releases"
};

ipcMain.on('openDEX', (event, arg) => {
  if (allowedDEX.hasOwnProperty(arg.target)) {
    event.returnValue = 'Opening url!'
    let url = arg.target === 'lightClient'
                ? allowedDEX[arg.target]
                : allowedDEX[arg.target] + `${arg.symbol}_${arg.market ? arg.market : 'BTS'}`
    shell.openExternal(url);
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    // On certificate error we disable default behaviour (stop loading the page)
    // and we then say "it is all fine - true" to the callback
    event.preventDefault();
    callback(true);
  });
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
})