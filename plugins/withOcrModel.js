const { withAndroidManifest } = require('expo/config-plugins');

// The Android text recogniser comes from Google Play Services, which by default
// downloads its model the first time it is used. In a plant room with no signal
// that first use would fail. This asks Play Services to fetch the model when the
// app is installed instead, so reading a nameplate works offline from day one.
const KEY = 'com.google.mlkit.vision.DEPENDENCIES';

module.exports = function withOcrModel(config) {
  return withAndroidManifest(config, (modConfig) => {
    const application = modConfig.modResults.manifest.application[0];
    application['meta-data'] = application['meta-data'] ?? [];

    const existing = application['meta-data'].find((item) => item.$['android:name'] === KEY);

    if (!existing) {
      application['meta-data'].push({ $: { 'android:name': KEY, 'android:value': 'ocr' } });
    } else if (!existing.$['android:value'].split(',').includes('ocr')) {
      existing.$['android:value'] += ',ocr';
    }

    return modConfig;
  });
};
