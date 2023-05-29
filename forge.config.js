const { utils: { fromBuildIdentifier } } = require('@electron-forge/core');

module.exports = {
  buildIdentifier: process.env.IS_BETA ? 'beta' : 'prod',
  packagerConfig: {
    appBundleId: fromBuildIdentifier({ beta: 'com.beta.ari.clickup-timer', prod: 'com.ari.clickup-timer' }),
    icon: './src/assets/images/icon/icon',
    arch: ['x64', 'arm64'],
    executableName: 'clickup-timer',
    asar: true,
  },
  rebuildConfig: {},
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'arnaud-ritti',
          name: 'clickup-timer'
        },
        prerelease: !!process.env.IS_BETA
      }
    }
  ],
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        iconUrl: 'https://raw.githubusercontent.com/arnaud-ritti/clickup-timer/main/src/assets/images/icon/icon.ico',
        setupIcon: './src/assets/images/icon/icon.ico',
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'linux'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          icon: './src/assets/images/icon/icon.png',
          maintainer: 'Arnaud Ritti',
          homepage: 'https://github.com/arnaud-ritti/'
        }
      },
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        icon: './src/assets/images/icon/icon.icns',
        background: './src/assets/images/dmg-background.png',
        format: 'ULFO'
      }
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        mainConfig: './webpack.main.config.js',
        devContentSecurityPolicy: "connect-src 'self' * 'unsafe-eval'",
        renderer: {
          config: './webpack.renderer.config.js',
          nodeIntegration: true,
          entryPoints: [
            {
              html: './src/main/index.html',
              js: './src/main/renderer.js',
              name: 'main_window',
              preload: {
                js: './src/main/preload.js',
              },
            },
            {
              html: './src/settings/index.html',
              js: './src/settings/renderer.js',
              name: 'settings_window',
              preload: {
                js: './src/settings/preload.js',
              },
            },
            {
              html: './src/details/index.html',
              js: './src/details/renderer.js',
              name: 'details_window',
              preload: {
                js: './src/details/preload.js',
              },
            },
            {
              html: './src/create/index.html',
              js: './src/create/renderer.js',
              name: 'create_window',
              preload: {
                js: './src/create/preload.js',
              },
            },
            {
              html: './src/timer/index.html',
              js: './src/timer/renderer.js',
              name: 'timer_window',
              preload: {
                js: './src/timer/preload.js',
              },
            },
          ],
        },
      },
    },
  ],
};
