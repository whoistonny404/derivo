const fs = require('node:fs/promises');
const path = require('node:path');
const {
  withAndroidManifest,
  withDangerousMod,
  withMainApplication,
} = require('expo/config-plugins');

const serviceName = '.OverlayService';
const servicePermission = 'android.permission.FOREGROUND_SERVICE_SPECIAL_USE';

function withOverlayManifest(config) {
  return withAndroidManifest(config, (modConfig) => {
    const manifest = modConfig.modResults.manifest;
    const application = manifest.application?.[0];
    if (!application) throw new Error('Derivo overlay plugin could not find the Android application entry.');

    manifest['uses-permission'] ??= [];
    for (const name of [
      'android.permission.SYSTEM_ALERT_WINDOW',
      'android.permission.FOREGROUND_SERVICE',
      servicePermission,
    ]) {
      if (!manifest['uses-permission'].some((permission) => permission.$?.['android:name'] === name)) {
        manifest['uses-permission'].push({ $: { 'android:name': name } });
      }
    }

    application.service ??= [];
    if (!application.service.some((service) => service.$?.['android:name'] === serviceName)) {
      application.service.push({
        $: {
          'android:name': serviceName,
          'android:enabled': 'true',
          'android:exported': 'false',
          'android:foregroundServiceType': 'specialUse',
        },
        property: [
          {
            $: {
              'android:name': 'android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE',
              'android:value': 'Display user-controlled floating demo trading controls over other apps',
            },
          },
        ],
      });
    }
    return modConfig;
  });
}

function withOverlayPackage(config) {
  return withMainApplication(config, (modConfig) => {
    let source = modConfig.modResults.contents;
    const packageName = modConfig.android.package;
    const packageImport = `import ${packageName}.OverlayPackage`;

    if (!source.includes(packageImport)) {
      const packageLine = source.match(/^package .+$/m)?.[0];
      if (!packageLine) throw new Error('Derivo overlay plugin could not locate the MainApplication package declaration.');
      source = source.replace(packageLine, `${packageLine}\n\n${packageImport}`);
    }
    if (!source.includes('add(OverlayPackage())')) {
      const packageList = /PackageList\(this\)\.packages\.apply\s*\{/;
      if (!packageList.test(source)) {
        throw new Error('Derivo overlay plugin could not locate the React Native package registration block.');
      }
      source = source.replace(packageList, (match) => `${match}\n          add(OverlayPackage())`);
    }
    modConfig.modResults.contents = source;
    return modConfig;
  });
}

function withOverlaySources(config) {
  return withDangerousMod(config, [
    'android',
    async (modConfig) => {
      const projectRoot = modConfig.modRequest.projectRoot;
      const packagePath = modConfig.android.package.split('.').join(path.sep);
      const javaRoot = path.join(projectRoot, 'android', 'app', 'src', 'main', 'java', packagePath);
      const sourceRoot = path.join(projectRoot, 'plugins', 'android');
      await fs.mkdir(javaRoot, { recursive: true });

      for (const file of ['OverlayModule.kt', 'OverlayPackage.kt', 'OverlayService.kt']) {
        await fs.copyFile(path.join(sourceRoot, file), path.join(javaRoot, file));
      }

      const drawableRoot = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res', 'drawable-nodpi');
      await fs.mkdir(drawableRoot, { recursive: true });
      await fs.copyFile(
        path.join(projectRoot, 'assets', 'images', 'deriv.png'),
        path.join(drawableRoot, 'derivo_overlay.png'),
      );
      return modConfig;
    },
  ]);
}

module.exports = function withAndroidOverlay(config) {
  return withOverlaySources(withOverlayPackage(withOverlayManifest(config)));
};
