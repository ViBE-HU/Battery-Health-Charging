'use strict';
const Main = imports.ui.main;
const Config = imports.misc.config;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const [major] = Config.PACKAGE_VERSION.split('.');
const shellVersion = Number.parseInt(major);

const Panel = shellVersion > 42 ? Me.imports.lib.thresholdPanel : Me.imports.lib.thresholdPanel42;
const PowerIcon = shellVersion > 42 ? Me.imports.lib.powerIcon : Me.imports.lib.powerIcon42;

var thresholdPanel = null;
var powerIcon = null;
let sessionId = null;

function init() {
    ExtensionUtils.initTranslations(Me.metadata.uuid);
}

// thresholdPanel created in user-mode session and destroyed in lockscreen session
// powerIcon need to be enabled in lockscreen session to apply correct icon to Gnome System Battery indicator icon in System-tray.
function enable() {
    // Do not create threshold panel if enable is triggered in lockscreen state
    if (!Main.sessionMode.isLocked && thresholdPanel === null)
        thresholdPanel = new Panel.ThresholdPanel();

    powerIcon = new PowerIcon.BatteryStatusIndicator();

   // Destroy thresholdPanel on unlock-dialog / create thresholdPanel in user-mode
    sessionId = Main.sessionMode.connect('updated', session => {
        if (session.currentMode === 'user' || session.parentMode === 'user') {
            if (thresholdPanel === null)
                thresholdPanel = new Panel.ThresholdPanel();
        }  else if (session.currentMode === 'unlock-dialog') {
            thresholdPanel.destroy();
            thresholdPanel = null;
        }
    });
}

function disable() {
    if (thresholdPanel !== null) {
        thresholdPanel.destroy();
        thresholdPanel = null;
    }

    powerIcon.disable();
    powerIcon = null;
    
    if (sessionId) {
        Main.sessionMode.disconnect(sessionId);
        sessionId = null;
    }
}

