sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";   

	return Controller.extend("com.bosch.hr.swift_trv.controller.App", {
		onInit: function () {
			this.oOwnerComponent = this.getOwnerComponent();
			this.oRouter = this.oOwnerComponent.getRouter();
			this.oRouter.attachRouteMatched(this.onRouteMatched, this);

			var Device = sap.ui.Device.system.desktop;
			if (Device === true) {
				this.getView().byId("flexibleColumnLayout").addStyleClass("screenReduce");
			}
		},

		onRouteMatched: function (oEvent) {
			var sRouteName = oEvent.getParameter("name"),
				oArguments = oEvent.getParameter("arguments");

			this._updateUIElements();
			// Save the current route name
			this.currentRouteName = sRouteName;
			this.currentProduct = oArguments.product;
			this.currentSupplier = oArguments.supplier;
		},

		onStateChanged: function (oEvent) {
			var bIsNavigationArrow = oEvent.getParameter("isNavigationArrow"),
				sLayout = oEvent.getParameter("layout");

			this._updateUIElements();
			try {
				if (oEvent.getParameters().layout === "TwoColumnsMidExpanded") {
					sap.ui.getCore().getModel("global").getData().StateChanged = true;

				} else if (oEvent.getParameters().layout === "TwoColumnsBeginExpanded") {
					sap.ui.getCore().getModel("global").getData().StateChanged = true;
				}
				sap.ui.getCore().getModel("global").refresh();
			} catch (err) {}
			if ((oEvent.getParameters().layout === "TwoColumnsBeginExpanded" || oEvent.getParameters().layout === "TwoColumnsMidExpanded") &&
				this.currentRouteName === "detail") {
				// Replace the URL with the new layout if a navigation arrow was used
				if (bIsNavigationArrow) {
					var url = ($(location).attr("href"));
					url = url.split('/');
					var reqNumber = url[url.length - 1];
					var reqNo = reqNumber;

					this.oRouter.navTo(this.currentRouteName, {
						layout: sLayout,
						product: this.currentProduct,
						reqNo: reqNo
					}, true);
				}
			} else {
				// Replace the URL with the new layout if a navigation arrow was used
				if (bIsNavigationArrow) {
					this.oRouter.navTo(this.currentRouteName, {
						layout: sLayout,
						product: this.currentProduct,
						supplier: this.currentSupplier
					}, true);
				}
			}
		},

		// Update the close/fullscreen buttons visibility
		_updateUIElements: function () {
			var oModel = this.oOwnerComponent.getModel(),
				oUIState;
			this.oOwnerComponent.getHelper().then(function (oHelper) {
				oUIState = oHelper.getCurrentUIState();
				oModel.setData(oUIState);
			});
		},

		onExit: function () {
		//	this.oRouter.detachBeforeRouteMatched(this.onRouteMatched, this);
			this.oRouter.detachRouteMatched(this.onRouteMatched, this);

			//this.oRouter.detachBeforeRouteMatched(this.onBeforeRouteMatched, this);
			//	this.oRouter.destroy();
		}
	});

});