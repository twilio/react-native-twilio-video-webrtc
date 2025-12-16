const fs = require('fs');
const path = require('path');

// Read version from package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');

if (!fs.existsSync(packageJsonPath)) {
  console.error(`Error: package.json not found at ${packageJsonPath}`);
  process.exit(1);
}

let packageJson;
try {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
} catch (err) {
  console.error(`Error: Failed to parse package.json: ${err.message}`);
  process.exit(1);
}

const version = packageJson.version;
if (!version) {
  console.error('Error: No version found in package.json');
  process.exit(1);
}

console.log(`Generating constants with version: ${version}`);

// iOS template
const iosTemplatePath = path.join(__dirname, '..', 'ios', 'RCTTWVideoConstants.h.template');
const iosOutputPath = path.join(__dirname, '..', 'ios', 'RCTTWVideoConstants.h');

if (!fs.existsSync(iosTemplatePath)) {
  console.error(`Error: iOS template not found at ${iosTemplatePath}`);
  process.exit(1);
}

const iosTemplate = fs.readFileSync(iosTemplatePath, 'utf8');
const iosContent = iosTemplate.replace(
  'kTwilioVideoReactNativeVersion = @""',
  `kTwilioVideoReactNativeVersion = @"${version}"`
);
fs.writeFileSync(iosOutputPath, iosContent);
console.log(`Generated: ${iosOutputPath}`);

// Android template
const androidTemplatePath = path.join(
  __dirname,
  '..',
  'android',
  'src',
  'main',
  'java',
  'com',
  'twiliorn',
  'library',
  'TwilioVideoConstants.java.template'
);
const androidOutputPath = path.join(
  __dirname,
  '..',
  'android',
  'src',
  'main',
  'java',
  'com',
  'twiliorn',
  'library',
  'TwilioVideoConstants.java'
);

if (!fs.existsSync(androidTemplatePath)) {
  console.error(`Error: Android template not found at ${androidTemplatePath}`);
  process.exit(1);
}

const androidTemplate = fs.readFileSync(androidTemplatePath, 'utf8');
const androidContent = androidTemplate.replace(
  'kTwilioVideoReactNativeVersion = ""',
  `kTwilioVideoReactNativeVersion = "${version}"`
);
fs.writeFileSync(androidOutputPath, androidContent);
console.log(`Generated: ${androidOutputPath}`);

console.log('Constants generation complete!');
