sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/bosch/hr/swift_trv/model/models",
	"sap/ui/model/json/JSONModel",
	"sap/f/FlexibleColumnLayoutSemanticHelper",
	"sap/f/library",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (UIComponent, Device, models, JSONModel, FlexibleColumnLayoutSemanticHelper, fioriLibrary, MessageBox,MessageToast) {
	"use strict";
	return UIComponent.extend("com.bosch.hr.swift_trv.Component", {
		metadata: {
			manifest: "json",
			config: {
				"serviceConfig": {
					"name": "ZE2E_DEP_NWGS_SRV",
					"serviceUrl": "/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/"
				}
			}
		},
		init: function () {
			var oModel, oRouter;
			var that = this;
			//UIComponent.prototype.destroy.apply(this, arguments); 

			UIComponent.prototype.init.apply(this, arguments);

			var sServiceUrl = "/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/";
			var oDataModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
			//	oDataModel.setCountSupported(false);
			this.setModel(oDataModel);
			sap.ui.core.BusyIndicator.show(-1);
			var promise1 = jQuery.Deferred();
			oDataModel.read("DEP_EMPSet", {
				success: function (result) {
					// Setting up profile data
					if (result !== null) {
						sap.m.MessageToast.show("Just a moment, we're getting things ready for you..!",{duration: 5000});
						var profileModel = new sap.ui.model.json.JSONModel();
						var aData = {};
						aData.employeeDetail = result.results[0];
						aData.myAction = "";
						// Check if this account has manager role and set it to model Profile
						var role = result.results[0].ZZ_POSITION;
						var roles = role.split(";");
						var hasMgr = false;
						var hasDepu = false;
						for (var i = 0; i < roles.length; i++) {
							if (roles[i] === "") {
								continue;
							}
							var curRole = roles[i];
							aData.currentRole = curRole;
							if (curRole === "DEPU") {
								hasDepu = true;
								continue;
							}
							if (curRole === "GRM") {
								hasMgr = true;
								break;
							}
						}
						if (hasMgr) {
							aData.currentRole = "GRM";
						} else {
							if (hasDepu) {
								aData.currentRole = "DEPU";
							}
						}
						profileModel.setData(aData);
						sap.ui.getCore().setModel(profileModel, "profile");
					}
					promise1.resolve();
				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error("Sorry for this inconvenience. Please contact support team");
				}
			});

			$.when(promise1).done(
				function () {
					// Setting up global data
					var ExistingModel = sap.ui.getCore().getModel("global");
					if (ExistingModel === null || ExistingModel === undefined ||(ExistingModel && ExistingModel.getData() === null)) {
						// Global model and data
						var oGlobalModel = new sap.ui.model.json.JSONModel();
						oGlobalModel.setSizeLimit(300);
						var globalData = {};
						// Profile data
						var aData = sap.ui.getCore().getModel("profile").getData();
						var pernr = aData.employeeDetail.ZZ_DEP_PERNR;
						var batchOperation0 = oDataModel.createBatchOperation("ZE2E_DEP_SERVICESet", "GET");
						var batchOperation1 = oDataModel.createBatchOperation("DEP_VISA_TYPSet", "GET");
						var batchOperation2 = oDataModel.createBatchOperation("DEP_COUNTRIESSet", "GET");
						var batchOperation3 = oDataModel.createBatchOperation("DEP_TRV_PURPOSESet", "GET");
						var batchOperation4 = oDataModel.createBatchOperation("DEP_STYPSet", "GET");
						var batchOperation5 = oDataModel.createBatchOperation("DEP_PASSPORT_INFOSet('" + pernr + "')", "GET");
						var batchOperation6 = oDataModel.createBatchOperation("DEP_EMPSet('" + pernr + "')?$expand=EMPtoEMPDEPNDNT", "GET");
						var batchOperation7 = oDataModel.createBatchOperation("GetConstant?CONST='HOME'&SELPAR='INTL_DURATION'&$format=json", "GET");
						//	var batchOperation8 = oDataModel.createBatchOperation("GetConstant?CONST='HOME'&SELPAR='DOME_DURATION'&$format=json", "GET");
						//	var batchOperation9 = oDataModel.createBatchOperation("GetConstant?CONST='HOME'&SELPAR='DOME_PERIOD'&$format=json", "GET");
						//	var batchOperation10 = oDataModel.createBatchOperation("GetConstant?CONST='DEPU'&SELPAR='SPONSOR_PERIOD'&$format=json", "GET");
						//	var batchOperation11 = oDataModel.createBatchOperation("GetConstant?CONST='HOME'&SELPAR='OLD_TRAVEL'&$format=json", "GET");
						//	var batchOperation12 = oDataModel.createBatchOperation("GetConstant?CONST='CARGO'&SELPAR='MIN_DAY'&$format=json", "GET");
						//	var batchOperation13 = oDataModel.createBatchOperation("GetConstant?CONST='CARGO'&SELPAR='MIN_DUR'&$format=json", "GET");
						//	var batchOperation14 = oDataModel.createBatchOperation("GetConstant?CONST='CARGO_CONDITION'&SELPAR='DATE'&$format=json", "GET");
						//	var batchOperation15 = oDataModel.createBatchOperation("GetConstant?CONST='COOLING_DATE_S'&SELPAR=''&$format=json", "GET");
						//	var batchOperation16 = oDataModel.createBatchOperation("GetConstant?CONST='COOLING_DAYS_M'&SELPAR=''&$format=json", "GET");
						var batchOperation17 = oDataModel.createBatchOperation("GetTravelDurationDays?CONST='BUSR_DURATION'&$format=json", "GET");
						//	var batchOperation18 = oDataModel.createBatchOperation("GetConstant?CONST='CARGOSTVA'&SELPAR='MIN_DUR'&$format=json", "GET");
						//	var batchOperation19 = oDataModel.createBatchOperation("GetConstant?CONST='CARGOSTVA'&SELPAR='TPNO'&$format=json", "GET");
						//	var batchOperation20 = oDataModel.createBatchOperation("GetConstant?CONST='CHGDATFRM'&SELPAR='1'&$format=json", "GET");
						//	var batchOperation21 = oDataModel.createBatchOperation("GetConstant?CONST='STA_2018'&SELPAR='DATE'&$format=json", "GET");
						//	var batchOperation22 = oDataModel.createBatchOperation("GetConstant?CONST='STVA_REMINDER'&SELPAR='DAYS'&$format=json", "GET");
						//	var batchOperation23 = oDataModel.createBatchOperation("GetRecvOrgUnitSet", "GET"); //Recieving Org changes by UEA6KOR_18.02.2019	
						var batchOperation24 = oDataModel.createBatchOperation("DEP_TRAVEL_TYPESet", "GET"); //New Policy changes by UEA6KOR_29.05.2019	
						//	var batchOperation25 = oDataModel.createBatchOperation("TRV_ADV_RESTRICTSet", "GET"); //Advance Restriction changes by MYU1KOR
						//	var batchOperation26 = oDataModel.createBatchOperation("GetConstant?CONST='NP19_DE'&SELPAR='DATE'&$format=json", "GET"); //Uml6kor_25.9.2019_newpolicy_date_validation for DE applicable from
						//	var batchOperation27 = oDataModel.createBatchOperation("GetConstant?CONST='EXT_DATE'&SELPAR='COV_19'&$format=json", "GET"); // UCD1KOR 06 MaY 2020 FOR extension end date for covid 19
						oDataModel.addBatchReadOperations([batchOperation0, batchOperation1, batchOperation2, batchOperation3,
							batchOperation5, batchOperation6, batchOperation7, batchOperation17, batchOperation24, batchOperation4
						]);
						oDataModel.submitBatch(function (oResult) {
							// Set dropdownlist data to global model
							globalData.serviceType = oResult.__batchResponses[0].data.results; // ServiceType manager
							globalData.visaType = oResult.__batchResponses[1].data.results;
							globalData.country = oResult.__batchResponses[2].data.results;
							globalData.purpose = oResult.__batchResponses[3].data.results; // PurposeTravel manager
							globalData.subtype = oResult.__batchResponses[9].data.results; // Subtype manager
							globalData.intlDuration = oResult.__batchResponses[6].data.GetConstant.VALUE;
							//	globalData.domeDuration = oResult.__batchResponses[8].data.GetConstant.VALUE;
							//	globalData.domePeriod = oResult.__batchResponses[9].data.GetConstant.VALUE;
							//	globalData.sponsorPeriod = oResult.__batchResponses[10].data.GetConstant.VALUE;
							//	globalData.oldTravelLink = oResult.__batchResponses[11].data.GetConstant.VALUE;
							//	globalData.DurStartDate = oResult.__batchResponses[12].data.GetConstant.VALUE; //durration before start date
							//	globalData.timeActiveCargo = oResult.__batchResponses[13].data.GetConstant.VALUE; // time to active Cargo
							//	globalData.cargoCondition = oResult.__batchResponses[14].data.GetConstant.VALUE; // time to switch between AAL and DHL in return Cargo
							//	globalData.coolingPeriodStartDate = oResult.__batchResponses[15].data.GetConstant.VALUE; // Start date of cooling period shows error message
							//	globalData.coolingPeriodMaxdays = oResult.__batchResponses[16].data.GetConstant.VALUE;

							globalData.busrDuration = oResult.__batchResponses[7].data.results;
							//	globalData.cargoStvaMinDur = oResult.__batchResponses[18].data.GetConstant.VALUE;
							//	globalData.cargoStvaTp = oResult.__batchResponses[19].data.GetConstant.VALUE;
							//	globalData.changeDateValidity = oResult.__batchResponses[20].data.GetConstant.VALUE;
							//	globalData.sta2018 = oResult.__batchResponses[21].data.GetConstant.VALUE;
							//	globalData.stvaReminder = oResult.__batchResponses[22].data.GetConstant.VALUE;
							//	globalData.RecOrgId = oResult.__batchResponses[23].data.results; // Recieving Org addition by UEA6KOR_18.02.2018	
							globalData.DepTravelType = oResult.__batchResponses[8].data.results; // New Policy changes by UEA6KOR_29.05.2019	
							//	globalData.TrvAdvRestrict = oResult.__batchResponses[25].data.results; //Advance Restriction by MYU1KOR
							//					globalData.CurrExchange = oResult.__batchResponses[26].data.results; //Currency Exchange by MYU1KOR
							// Set default value for later usage in Deputation Request Screen
							//	globalData.npde_date = oResult.__batchResponses[26].data.GetConstant.VALUE; //Uml6kor_25.9.2019_newpolicy_date_validation for DE applicable from
							//	globalData.ext_date = oResult.__batchResponses[27].data.GetConstant.VALUE; //UCD1KOR_18.05.2020newpolicy_date_validation for DE applicable from

							globalData.selectedDepuType = "Deputation Request";
							globalData.currentStage = "1";
							globalData.currentSet = "1_1";
							globalData.currentSubSet = "1_1_1";
							globalData.currentSubSubSet = "";

							oGlobalModel.setData(globalData);
							sap.ui.getCore().setModel(oGlobalModel, "global");

							// Update profile model with employee details, passport details and family details
							try {
								aData.passportDetail = oResult.__batchResponses[4].data;
								aData.employeeDetail.isNotSingle = aData.passportDetail.ZZ_MARITIAL_STAT !== "0";
								aData.employeeDetail.isEditable = aData.employeeDetail.isNotSingle;
							} catch (exc) {
								aData.employeeDetail.isNotSingle = false;
								aData.employeeDetail.isEditable = false;
							}
							try {
								aData.dependentDetail = oResult.__batchResponses[5].data.EMPtoEMPDEPNDNT.results;
								for (var i = 0; i < aData.dependentDetail.length; i++) {
									if (aData.dependentDetail[i].ZZ_DATE_EXPIRY !== "00000000" && aData.dependentDetail[i].ZZ_DATE_EXPIRY !== "") {
										aData.dependentDetail[i].ZZ_DATE_EXPIRY_VALUE = new Date(aData.dependentDetail[i].ZZ_DATE_EXPIRY.substr(0, 4),
											aData.dependentDetail[i].ZZ_DATE_EXPIRY.substr(4, 2) - 1,
											aData.dependentDetail[i].ZZ_DATE_EXPIRY.substr(6, 2));
									}
									if (aData.dependentDetail[i].ZZ_DATE_ISSUE !== "00000000" && aData.dependentDetail[i].ZZ_DATE_ISSUE !== "") {
										aData.dependentDetail[i].ZZ_DATE_ISSUE_VALUE = new Date(aData.dependentDetail[i].ZZ_DATE_ISSUE.substr(0, 4),
											aData.dependentDetail[i].ZZ_DATE_ISSUE.substr(4, 2) - 1,
											aData.dependentDetail[i].ZZ_DATE_ISSUE.substr(6, 2));
									}
								}
							} catch (exc) {
								sap.ui.core.BusyIndicator.hide();
							}
							aData.yesorno = [{
								key: "",
								description: "No"
							}, {
								key: "X",
								description: "Yes"
							}];
							aData.country = globalData.country;
							var oItem = {
								MOLGA: "",
								LTEXT: "Please select"
							};
							aData.country.unshift(oItem);
							sap.ui.getCore().getModel("profile").setData(aData);
							// Initialize router once global values completed
							oRouter = that.getRouter();
						//	oRouter.attachBeforeRouteMatched(that._onBeforeRouteMatched, that);
							oRouter.initialize();
							that.oRouter = oRouter;
							sap.ui.core.BusyIndicator.hide();
						}, function (oError) {
							sap.ui.core.BusyIndicator.hide();
							MessageBox.error("Sorry for this inconvenience. Please contact support team");
						});
					}

				});
			oModel = new JSONModel();
			this.setModel(oModel);
			// set products demo model on this sample

			var oProductsModel = new sap.ui.model.json.JSONModel();
			var data = {
				"editable": false,
				"busy": false,
				"busy1": false,
				"butonVisible": true,
				"deviceVisible": true,
				"simVisible": true,
				"detailBusy": false
			};
			oProductsModel.setData(data);
			this.setModel(oProductsModel, "products");
			sap.ui.getCore().setModel(oProductsModel, "products");

		},
		destroy: function () {
			sap.ui.getCore().getModel("global").setData(null);
			sap.ui.core.UIComponent.prototype.destroy.apply(this, arguments);
			//	this.oRouter.destroy();
		},
		/*exit: function () {
			UIComponent.prototype.destroy.apply(this, arguments);
		},*/
		getHelper: function () {
			return this._getFcl().then(function (oFCL) {
				var oSettings = {
					defaultTwoColumnLayoutType: fioriLibrary.LayoutType.TwoColumnsMidExpanded,
					defaultThreeColumnLayoutType: fioriLibrary.LayoutType.ThreeColumnsMidExpanded
				};
				return FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFCL, oSettings);
			});
		},
		_onBeforeRouteMatched: function (oEvent) {
			var oModel = this.getModel(),
				sLayout = oEvent.getParameters().arguments.layout,
				oNextUIState;
			// If there is no layout parameter, query for the default level 0 layout (normally OneColumn)
			if (!sLayout) {
				this.getHelper().then(function (oHelper) {
					oNextUIState = oHelper.getNextUIState(0);
					oModel.setProperty("/layout", oNextUIState.layout);
				});
				return;
			}
			oModel.setProperty("/layout", sLayout);
			/*this.oRouter.navTo("master", {
				layout: oNextUIState.layout
			});*/
		},
		_getFcl: function () {
			return new Promise(function (resolve, reject) {
				var oFCL = this.getRootControl().byId("flexibleColumnLayout");
				if (!oFCL) {
					this.getRootControl().attachAfterInit(function (oEvent) {
						resolve(oEvent.getSource().byId("flexibleColumnLayout"));
					}, this);
					return;
				}
				resolve(oFCL);
			}.bind(this));
		}
	});
});