Place any Android native files you want preserved across prebuilds here:

- Put files under `native-overrides/android/...` mirroring the usual `android/` layout.
- During `expo prebuild` or cloud `eas build`, the plugin `./plugins/copy-android-files.plugin.js`
  will copy any files from `native-overrides/android` into the generated `android/` project,
  overwriting defaults but preserving your customizations.

Example:

```
native-overrides/android/app/src/main/java/com/ecme/mobile/MyCustomModule.java
```

Notes:
- If you prefer to keep a standalone `android/` and manage it manually, you can ignore this folder.
- After adding or changing overrides, re-run `npx expo prebuild` or start a new `eas build` so they are applied.
