const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs-extra');
const path = require('path');

/**
 * Config plugin: copy any files from mobile-app/native-overrides/android
 * into the prebuilt/generated android/ folder so manual native changes
 * are preserved when using Continuous Native Generation (CNG).
 */
module.exports = function withCopyAndroidFiles(config) {
  return withDangerousMod(config, ["android", async (config) => {
    const projectRoot = config.modRequest.projectRoot;
    const src = path.join(projectRoot, 'native-overrides', 'android');
    const dest = path.join(projectRoot, 'android');

    try {
      const exists = await fs.pathExists(src);
      if (exists) {
        await fs.copy(src, dest, { overwrite: true, recursive: true });
        console.log(`Copied native overrides from ${src} to ${dest}`);
      } else {
        console.log(`No native overrides found at ${src}`);
      }
    } catch (e) {
      console.warn('copy-android-files.plugin.js: failed to copy native overrides', e);
    }

    return config;
  }]);
};
