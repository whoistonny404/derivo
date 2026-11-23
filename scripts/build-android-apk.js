const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const projectRoot = path.resolve(__dirname, '..');
const expoCli = path.join(projectRoot, 'node_modules', 'expo', 'bin', 'cli');
const androidRoot = path.join(projectRoot, 'android');

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status ?? 'unknown'}.`);
  }
}

if (!fs.existsSync(expoCli)) {
  throw new Error('Expo CLI is missing. Install the project dependencies before building the APK.');
}

const generatedPaths = [
  '.expo',
  'android/.gradle',
  'android/build',
  'android/app/build',
  'android/app/.cxx',
  'node_modules/.cache',
];

for (const relativePath of generatedPaths) {
  const target = path.resolve(projectRoot, relativePath);
  if (!target.startsWith(`${projectRoot}${path.sep}`)) {
    throw new Error(`Refusing to clean a path outside the project: ${relativePath}`);
  }
  fs.rmSync(target, { recursive: true, force: true });
}

run(process.execPath, [expoCli, 'prebuild', '--platform', 'android', '--no-install'], projectRoot);

// Patch android/settings.gradle to add pluginManagement repositories for foojay resolver
const settingsGradlePath = path.join(androidRoot, 'settings.gradle');
if (fs.existsSync(settingsGradlePath)) {
  let settingsContent = fs.readFileSync(settingsGradlePath, 'utf8');
  if (!settingsContent.includes('gradlePluginPortal')) {
    settingsContent = settingsContent.replace(
      'pluginManagement {',
      'pluginManagement {\n  repositories {\n    gradlePluginPortal()\n    google()\n    mavenCentral()\n  }'
    );
    fs.writeFileSync(settingsGradlePath, settingsContent, 'utf8');
  }
}

// Safely remove spotless plugin and configuration block in react-native-worklets
const workletsGradlePath = path.resolve(projectRoot, 'node_modules', 'react-native-worklets', 'android', 'build.gradle.kts');
if (fs.existsSync(workletsGradlePath)) {
  let workletsContent = fs.readFileSync(workletsGradlePath, 'utf8');
  workletsContent = workletsContent.replace(
    'id("com.diffplug.spotless") version "8.1.0"',
    '// id("com.diffplug.spotless") version "8.1.0"'
  );
  
  function removeBlock(content, blockStartKeyword) {
    const idx = content.indexOf(blockStartKeyword);
    if (idx === -1) return content;
    let braceCount = 0;
    let endIndex = -1;
    let started = false;
    for (let i = idx; i < content.length; i++) {
      if (content[i] === '{') {
        if (!started) started = true;
        braceCount++;
      } else if (content[i] === '}') {
        braceCount--;
        if (started && braceCount === 0) {
          endIndex = i + 1;
          break;
        }
      }
    }
    if (endIndex !== -1) {
      return content.slice(0, idx) + content.slice(endIndex);
    }
    return content;
  }

  workletsContent = removeBlock(workletsContent, 'spotless {');
  fs.writeFileSync(workletsGradlePath, workletsContent, 'utf8');
}

const gradleCommand = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
const architectureArgs = process.argv.includes('--all-architectures')
  ? []
  : ['-PreactNativeArchitectures=arm64-v8a'];
run(gradleCommand, ['--no-daemon', 'assembleRelease', ...architectureArgs], androidRoot);

console.log(`APK built at ${path.join(androidRoot, 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk')}`);
