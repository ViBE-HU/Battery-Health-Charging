'use strict';
/* Lenovo Ideapad Laptops */
const {GObject} = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Helper = Me.imports.lib.helper;
const {fileExists, readFileInt, runCommandCtl} = Helper;

const LENOVO_PATH = '/sys/bus/platform/drivers/ideapad_acpi/VPC2004:00/conservation_mode';

var LenovoSingleBattery = GObject.registerClass({
    Signals: {'read-completed': {}},
}, class LenovoSingleBattery extends GObject.Object {
    name = 'Lenovo with Single Battery';
    type = 12;
    deviceNeedRootPermission = true;
    deviceHaveDualBattery = false;
    deviceHaveStartThreshold = false;
    deviceHaveVariableThreshold = false;
    deviceHaveBalancedMode = false;
    deviceHaveAdaptiveMode = false;
    deviceHaveExpressMode = false;
    iconForFullCapMode = '100';
    iconForMaxLifeMode = '060';

    isAvailable() {
        if (!fileExists(LENOVO_PATH))
            return false;
        return true;
    }

    async setThresholdLimit(chargingMode) {
        let conservationMode;
        if (chargingMode === 'ful')
            conservationMode = 0;
        else if (chargingMode === 'max')
            conservationMode = 1;
        if (readFileInt(LENOVO_PATH) === conservationMode) {
            if (conservationMode === 1)
                this.endLimitValue = 60;
            else
                this.endLimitValue = 100;
            this.emit('read-completed');
            return 0;
        }
        let status = await runCommandCtl('LENOVO', `${conservationMode}`, null, false);
        if (status === 0)  {
            const endLimitValue = readFileInt(LENOVO_PATH);
            if (conservationMode === endLimitValue) {
                if (endLimitValue === 1)
                    this.endLimitValue = 60;
                else
                    this.endLimitValue = 100;
                this.emit('read-completed');
                return 0;
            }
        }
        log('Battery Health Charging: Error threshold values not updated');
        return status;
    }
});

