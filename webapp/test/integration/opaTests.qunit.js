/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/bosch/hr/swift_trv/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});