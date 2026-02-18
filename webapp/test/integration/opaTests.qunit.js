/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require(["project/barcodescanner/test/integration/AllJourneys"
], function () {
	QUnit.start();
});
