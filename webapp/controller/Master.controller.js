sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/m/MessageBox",
	"com/bosch/hr/swift_trv/model/formatter",
	"com/bosch/hr/swift_trv/model/Common"
], function (JSONModel, Controller, Filter, FilterOperator, Sorter, MessageBox, formatter, Common) {
	"use strict";

	return Controller.extend("com.bosch.hr.swift_trv.controller.Master", {
		formatter: formatter,
		onInit: function () {

			sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this.bindDataBasedOnRole, this);
			//this.bindDataBasedOnRole();

		},
		onRefreshData: function () {
			this.onClickSearch = true;
			this.bindDataBasedOnRole();
		},
		// This method is used to bind data to the corresponding UI Components based on the role
		bindDataBasedOnRole: function (oEvent) {
			var that = this;
			var Device = sap.ui.Device.system.desktop;
			try {
				if (Device === true && (oEvent.getParameter("arguments").layout === "OneColumn" || oEvent.getParameter("arguments").layout ===
						undefined)) {
					this.getView().byId("idSearch").setWidth("26.5rem");
				} else {
					this.getView().byId("idSearch").setWidth("100%");
				}
			} catch (err) {}

			if (this.getView().getModel("MyTasks") === undefined || this.onClickSearch === true || oEvent.getParameter("arguments").layout ===
				"OneColumn") {
				sap.ui.core.BusyIndicator.show(-1);
				this.oRouter = this.getOwnerComponent().getRouter();
				this.reportDeffered = jQuery.Deferred();
				this.requestDeffered = jQuery.Deferred();
				this.taskDeffered = jQuery.Deferred();

				// Define global variables
				this.myEmployeeTaskNumberofRows = 0;
				this.myRequestNumberofRows = 0;
				var myRole = sap.ui.getCore().getModel("profile").getData().currentRole;
				myRole = "EMP"; // to Remove
				this.sServiceUrl = "/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/";
				this.oDataModel = new sap.ui.model.odata.ODataModel(this.sServiceUrl);
				var batchArray = [];
				var vTabFlag = "MT";

				var pernr = "";
				pernr = sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR;
				if (pernr !== undefined && pernr !== "") {
					sap.ui.getCore().getModel("profile").refresh();
					batchArray.push(this.oDataModel.createBatchOperation("DEP_HDR_INFOSet?$filter=ZZ_DEP_PERNR+eq+'" + pernr +
						"'+and+ZZ_ROLE_NAME+eq+'" + myRole + "'&$expand=ZE2E_REQ_STATUSSet&$format=json", "GET"));
					this.oDataModel.addBatchReadOperations(batchArray);
					this.oDataModel.submitBatch(function (oResult) {
						var oData = oResult.__batchResponses[0].data.results;

						// From the results, add all 'my task' data into array myTaskData
						// From the results, add all 'my request' data into array myRequestData
						var myTaskData = [];
						var myRequestData = [];
						for (var i = 0; i < oData.length; i++) {
							if (oData[i].ZZ_TAB_FLAG === "MT") {
								myTaskData.push(oData[i]);
							}
							if (oData[i].ZZ_TAB_FLAG === "MR") {
								myRequestData.push(oData[i]);
							}
						}

						if (myRole === "GRM") {
							that.setEmployeeMyTaskData(myTaskData);
						} else if (myRole === "EMP") {
							that.setEmployeeMyTaskData(myTaskData);
							that.setEmployeeMyRequestData(myRequestData);
						}

						$.when(that.taskDeffered).then(function () {
							that.taskDeffered = $.Deferred();
							if (myRole === "EMP") {
								that.setEmployeeOpenRequest();
							} else if (myRole === "GRM") {
								/*if (oTaskTbl)
									oTaskTbl.setBusy(false);*/
							}
							sap.ui.core.BusyIndicator.hide(0);
						});
					}, function (oError) {
						sap.ui.core.BusyIndicator.hide(0);
						sap.m.MessageToast.show("Sorry for this inconvenience. Please contact support team");
					});
				} else {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error("Employee No is Missing. Kindly check DEP_HDR Table");
				}
			}
			//	sap.m.MessageToast.show(pernr);
			//	pernr = "00001095"; // to remove
			//	sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_GRM = "Sandeep Kusuma"; // to remove

		},
		setEmployeeMyRequestData: function (results) {

			if (results !== null) {
				var myRequestModel = new sap.ui.model.json.JSONModel();
				myRequestModel.setSizeLimit(1500);
				//Set number of requests
				if (results !== null) {
					myRequestModel.setData(results);
				}
				this.myRequestNumberofRows = results.length;
				this.getView().setModel(myRequestModel, "MyRequests");
			}
			this.requestDeffered.resolve();

		},
		setEmployeeMyTaskData: function (results) {

			if (results !== null) {
				var data = [];
				for (var i = 0; i < results.length; i++) {
					if (results[i].ZZ_REQ_TYP === "BUSR") {
						data.push(results[i]);
					}
				}
				var myEmployeeTaskModel = new sap.ui.model.json.JSONModel();
				myEmployeeTaskModel.setSizeLimit(1500);
				myEmployeeTaskModel.setData(data);
				this.getView().setModel(myEmployeeTaskModel, "MyTasks");
				sap.ui.getCore().setModel(myEmployeeTaskModel, "MyTasks");
				this.myEmployeeTaskNumberofRows = data.length;
				/*if (data.length === 0) {
					sap.m.MessageToast.show("No Records Found..!!");
				}*/
				this.getView().byId("masterTitle").setText("My Tasks (" + data.length + ")");
			}
			this.taskDeffered.resolve();
		},
		setEmployeeOpenRequest: function () {
			// Display current request data on employee's top third box
			try {
				// global data 
				var globalModel = sap.ui.getCore().getModel("global");
				var aData = globalModel.getData();
				// This node: deputationList will be bound to the rowrepeater
				aData.deputationList = [];
				aData.openDeputationList = [];

				var allData = jQuery.merge(this.getView().getModel("MyTasks").getData(),
					this.getView().getModel("MyRequests").getData());
				var total = 0;
				total = this.myEmployeeTaskNumberofRows + this.myRequestNumberofRows;
				if (total > 0) {
					var count = 0;
					// loop into myRequest to get only open Request
					for (var i = 0; i < allData.length; i++) {
						// Ignore cancellation
						if ((allData[i].ZZ_REQ_TYP === "DEPU" && allData[i].ZZ_STAT_FLAG === "CANCL") ||
							(allData[i].ZZ_REQ_TYP !== "DEPU" && allData[i].ZZ_STAT_FLAG === "CANCL") ||
							(allData[i].ZZ_REQ_TYP !== "DEPU" && allData[i].ZZ_STAT_FLAG === "FF002")) {
							continue;
						}
						// Ignore reject case
						if ((allData[i].ZZ_REQ_TYP === "DEPU" &&
								((allData[i].ZZ_STAT_FLAG.substring(2, 5) === "002" &&
										(allData[i].ZZ_TRV_REQ === "" || allData[i].ZZ_TRV_REQ === null || allData[i].ZZ_TRV_REQ === "0000000000")) ||
									(allData[i].ZZ_STAT_FLAG.substring(2, 5) === "007" &&
										(allData[i].ZZ_TRV_REQ !== "" && allData[i].ZZ_TRV_REQ !== null && allData[i].ZZ_TRV_REQ !== "0000000000")))) ||
							(allData[i].ZZ_REQ_TYP !== "DEPU" && allData[i].ZZ_STAT_FLAG.substring(2, 5) === "007")) {
							continue;
						}
						aData.deputationList.push(allData[i]);
						if ((allData[i].ZZ_REQ_TYP === "VISA")) {
							continue;
						}
						if ((allData[i].ZZ_REQ_TYP === "DEPU" &&
								(allData[i].ZZ_STAT_FLAG === "JJ000" || allData[i].ZZ_STAT_FLAG === "FF001")) ||
							(allData[i].ZZ_REQ_TYP !== "DEPU" && allData[i].ZZ_STAT_FLAG === "FF001")) {
							continue;
						} else {
							aData.openDeputationList.push(allData[i]);
						}
					}
					count = aData.openDeputationList.length;
					if (count > 0) {
						aData.openDeputationList.sort(function (a, b) {
							return a.ZZ_DEP_REQ > b.ZZ_DEP_REQ ? -1 : 1;
						});
						globalModel.setData(aData);
					}
				} else {
					globalModel.setData(aData);
				}
				//sap.ui.getCore().byId("panelEmployeeCurrentRequest").setModel(globalModel, "currentRequestModel");
			} catch (exc) {
				sap.ui.core.BusyIndicator.hide(0);
			}

		},
		getArrayIndex: function (aArray, sColumn, sValue) {
			try {
				for (var i = 0; i < aArray.length; i++) {
					if (aArray[i][sColumn] === sValue) {
						return i;
					}
				}
			} catch (ex) {
				return -1;
			}
			return -1;
		},
		onSearch: function (oEvent) {
			//var sQuery = oEvent.getParameter("query");
			var sQuery = this.getView().byId("idSearch").getValue();
			var RequestNo = new sap.ui.model.Filter("ZZ_DEP_REQ", sap.ui.model.FilterOperator.Contains, sQuery);
			var pendingWith = new sap.ui.model.Filter("ZZ_NEXT_APPROVER", sap.ui.model.FilterOperator.Contains, sQuery);
			var Status = new sap.ui.model.Filter("ZZDEP_SF_TEXT", sap.ui.model.FilterOperator.Contains, sQuery);

			var filters = new sap.ui.model.Filter([RequestNo, pendingWith, Status]);
			var listassign = this.getView().byId("requestsTable");
			listassign.getBinding("items").filter(filters, "Appliation");
		},
		onAdd: function (oEvent) {
			var profileData = sap.ui.getCore().getModel("profile").getData();
			// Check supervisor blank
			if (profileData.employeeDetail.ZZ_DEP_GRM === "" || profileData.employeeDetail.ZZ_DEP_GRM === null) {
				MessageBox.error("No supervisor available. Please contact HR!");
				return;
			}

			var aData = sap.ui.getCore().getModel("global").getData();
			aData.screenData = {};
			aData.screenData.ZZ_REQ_TYP = "";
			aData.screenData.ZZ_DEP_STDATE = "";
			aData.screenData.ZZ_DEP_ENDATE = "";
			aData.screenData.ZZ_DEP_DAYS = "0";
			aData.screenData.ZZ_DEP_TYPE = "DOME";

			aData.screenData.ZZ_DEP_FRCNTRY = profileData.employeeDetail.ZZ_BASE_CNTRY;
			aData.screenData.ZZ_DEP_FRCNTRY_TXT = profileData.employeeDetail.ZZ_BASE_CNTRY_TXT;

			aData.screenData.ZZ_DEP_TOCNTRY = profileData.employeeDetail.ZZ_BASE_CNTRY;
			aData.screenData.ZZ_DEP_TOCNTRY_TXT = profileData.employeeDetail.ZZ_BASE_CNTRY_TXT;

			aData.screenData.ZZ_DEP_FRMLOC = profileData.employeeDetail.ZZ_BASE_LOC_KEY;
			aData.screenData.ZZ_DEP_FRMLOC_TXT = profileData.employeeDetail.ZZ_BASE_LOC_TXT;

			aData.screenData.ZZ_DEP_TOLOC = profileData.employeeDetail.ZZ_BASE_LOC_KEY;
			aData.screenData.ZZ_DEP_TOLOC_TXT = profileData.employeeDetail.ZZ_BASE_LOC_TXT;

			if (profileData.employeeDetail.ZZ_BASE_LOC_TXT === "Bangalore") {
				aData.screenData.ZZ_DEP_FRMLOC = "BAN";
				aData.screenData.ZZ_DEP_TOLOC = "BAN";
				profileData.employeeDetail.ZZ_BASE_LOC_KEY = "BAN";
			}

			aData.screenData.ZZ_TRV_CAT = "";
			aData.screenData.ZZ_MIN = 0;
			aData.screenData.ZZ_MAX = 0;
			aData.screenData.ZZ_SP_CMPNY = false;

			aData.cityfrom = [];
			aData.cityto = [];
			// instantiate the Fragment if not done yet
			try {
				sap.ui.getCore().byId("idFromLocationC").destroy();
				sap.ui.getCore().byId("idToLocationC").destroy();
			} catch (exc) {}
			this.createFragment = sap.ui.xmlfragment("com.bosch.hr.swift_trv.fragments.common.CreateRequest", this.getView().getController());
			this.createFragment.open();
			sap.ui.core.BusyIndicator.show(-1);
			this.oDataModel.read("DEP_LOCATIONSSet?$filter=MOLGA eq '" + aData.screenData.ZZ_DEP_FRCNTRY + "'&$format=json", null, null, true,
				function (oData, response) {
					var result = JSON.parse(response.body);
					if (result !== null) {
						sap.ui.getCore().byId("idFromLocationC").setSelectedKey(profileData.employeeDetail.ZZ_BASE_LOC_KEY);
						sap.ui.getCore().byId("idToLocationC").setSelectedKey(profileData.employeeDetail.ZZ_BASE_LOC_KEY);
						aData.cityfrom = result.d.results;
						aData.cityto = result.d.results;
						sap.ui.getCore().getModel("global").setData(aData);
						sap.ui.getCore().getModel("global").refresh();
					}
					sap.ui.core.BusyIndicator.hide(0);
				},
				function (error) {
					sap.m.MessageToast.show("Internal Server Error");
				});

		},
		onCancelCreate: function () {
			this.createFragment.close();
			this.createFragment.destroy();
		},
		handleConfirm: function (oEvent) {
			var oView = this.getView();
			var oTable = oView.byId("requestsTable");
			var mParams = oEvent.getParameters();
			var oBinding = oTable.getBinding("items");
			// apply grouping 
			var aSorters = [];
			if (mParams.groupItem) {
				var sPath = mParams.groupItem.getKey();
				var bDescending = mParams.groupDescending;
				var vGroup = function (oContext) {
					var name = oContext.getProperty(sPath);
					return {
						key: name,
						text: name
					};
				};
				aSorters.push(new sap.ui.model.Sorter(sPath, bDescending, vGroup));
			}

			// apply sorter 
			// var sPath = mParams.sortItem.getKey();
			if (mParams.groupItem === undefined) {
				sPath = "ZZ_DEP_REQ";
			} else if (mParams.groupItem.getKey() === "Status") {
				sPath = "ZZDEP_SF_TEXT";
			} else if (mParams.groupItem.getKey() === "pendingWith") {
				sPath = "ZZ_NEXT_APPROVER";
			} else {
				sPath = mParams.groupItem.getKey();
			}
			bDescending = mParams.sortDescending;
			aSorters.push(new sap.ui.model.Sorter(sPath, bDescending));
			oBinding.sort(aSorters);
		},
		onSort: function (oEvent) {
			//this._bDescendingSort = !this._bDescendingSort;
			var selectedButton = oEvent.getSource().getText();
			var value = "";
			if (selectedButton === "RequestNo") {
				value = "ZZ_DEP_REQ";
			} else if (selectedButton === "PendingWith") {
				value = "ZZ_NEXT_APPROVER";
			} else if (selectedButton === "Status") {
				value = "ZZDEP_SF_TEXT";
			}
			var oBinding = this.getView().byId("requestsTable").getBinding("items"),
				oSorter = new Sorter(value, false);

			oBinding.sort(oSorter);
		},
		onView: function (oEvent) {
			if (!this._oDialogView) {
				this._oDialogView = sap.ui.xmlfragment("com.bosch.hr.swift_trv.fragments.common.ViewSettings", this);
				this.getView().addDependent(this._oDialogView);
			}
			this._oDialogView.open();
		},
		onListItemPress: function (oEvent) {
			var that = this;
			var GlobalModel = sap.ui.getCore().getModel("global").getData();
			var oNextUIState;
			GlobalModel.StateChanged = false;
			if (oEvent === undefined) {
				var Request = this.myEmployeeTaskNumberofRows + 1;
				var reqNo = "0000000000";
			} else {
				Request = oEvent.getSource().getBindingContextPath().split("/").slice(-1).pop();
				var path = oEvent.getSource().getBindingContextPath();
				var Data = this.getView().getModel("MyTasks").getProperty(path);
				reqNo = Data.ZZ_DEP_REQ;
				GlobalModel.CurrentRequest = Data;
			}
			sap.ui.getCore().getModel("global").refresh();

			if ((GlobalModel.isCreate === true && reqNo !== "0000000000") || (GlobalModel.isUpdate === true && GlobalModel.SelectedReqNo !==
					reqNo)) {
				MessageBox.information("Any unsaved data will be lost, do you want to continue ?", {
					actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
					emphasizedAction: MessageBox.Action.OK,
					onClose: function (sAction) {
						if (sAction === "OK") {
							sap.ui.getCore().getModel("global").getData().isCreate = false;
							sap.ui.getCore().getModel("global").getData().isUpdate = false;
							sap.ui.getCore().getModel("global").getData().isRead = true;
							sap.ui.getCore().getModel("global").getData().isExisting = true;
							that.getOwnerComponent().getHelper().then(function (oHelper) {
								oNextUIState = oHelper.getNextUIState(1);
								that.oRouter.navTo("detail", {
									layout: oNextUIState.layout,
									product: Request,
									reqNo: reqNo
								});
							}.bind(that));
						}
					}
				});
			} else {
				this.getOwnerComponent().getHelper().then(function (oHelper) {
					oNextUIState = oHelper.getNextUIState(1);
					this.oRouter.navTo("detail", {
						layout: oNextUIState.layout,
						product: Request,
						reqNo: reqNo
					});
				}.bind(this));
			}

		},
		onPressProceed: function (oEvent) {
			var that = this;
			//	sap.ui.core.BusyIndicator.show(1);
			var aData = sap.ui.getCore().getModel("global").getData();
			aData.screenData.ZZ_TRV_CAT = "BUSR";
			var err = "";

			if ((aData.screenData.ZZ_TRV_CAT === "BUSR" || aData.screenData.ZZ_TRV_CAT === "INFO") &&
				aData.screenData.ZZ_DEP_FRCNTRY === aData.screenData.ZZ_DEP_TOCNTRY &&
				aData.screenData.ZZ_DEP_FRMLOC === aData.screenData.ZZ_DEP_TOLOC) {

				MessageBox.error("From and To location must be different");
				sap.ui.getCore().getModel("global").setData(aData);

				return;
			}

			// Validate black-listed country
			var selectedCountry = aData.screenData.ZZ_DEP_TOCNTRY;
			for (var i = 0; i < aData.country.length; i++) {
				if (aData.country[i].MOLGA === selectedCountry) {
					if (aData.country[i].Black_Listed === "X") {
						MessageBox.error("You are not allowed to travel to this country as per ECO guidelines");
						sap.ui.getCore().getModel("global").setData(aData);
						return;
					}
				}
			}

			// Validate start date input
			if (aData.screenData.ZZ_DEP_STDATE === "") {
				aData.screenData.ZZ_DEP_STDATE_ERROR = "Error";
				MessageBox.error("Please check start date");
				sap.ui.getCore().getModel("global").setData(aData);
				return;
			} else {
				aData.screenData.ZZ_DEP_STDATE_ERROR = "None";
				aData.screenData.ZZ_DEP_STDATE_VALUE = sap.ui.getCore().byId("idFromDateC").getDateValue();
				sap.ui.getCore().getModel("global").setData(aData);
			}
			// Validate end date input
			if (aData.screenData.ZZ_DEP_ENDATE === "") {
				aData.screenData.ZZ_DEP_ENDATE_ERROR = "Error";
				MessageBox.error("Please check end date");
				sap.ui.getCore().getModel("global").setData(aData);
				return;
			} else {
				aData.screenData.ZZ_DEP_ENDATE_ERROR = "None";
				aData.screenData.ZZ_DEP_ENDATE_VALUE = sap.ui.getCore().byId("idToDateC").getDateValue();
				sap.ui.getCore().getModel("global").setData(aData);
			}

			/// From Loc

			if (aData.screenData.ZZ_DEP_FRMLOC === "") {
				aData.screenData.ZZ_DEP_FRMLOC_ERROR = "Error";
				MessageBox.error("Please check From Location");
				sap.ui.getCore().getModel("global").setData(aData);
				return;
			} else {
				aData.screenData.ZZ_DEP_FRMLOC_ERROR = "None";
				aData.screenData.ZZ_DEP_FRMLOC = sap.ui.getCore().byId("idFromLocationC").getSelectedKey();
				sap.ui.getCore().getModel("global").setData(aData);
			}

			// To Loc
			if (aData.screenData.ZZ_DEP_TOLOC === "") {
				aData.screenData.ZZ_DEP_TOLOC_ERROR = "Error";
				MessageBox.error("Please check To Location");
				sap.ui.getCore().getModel("global").setData(aData);
				return;
			} else {
				aData.screenData.ZZ_DEP_TOLOC_ERROR = "None";
				aData.screenData.ZZ_DEP_TOLOC = sap.ui.getCore().byId("idToLocationC").getSelectedKey();
				sap.ui.getCore().getModel("global").setData(aData);
			}

			// Validate if input date is overlapped
			if (this.checkDateOverlapping() === "") {
				aData.screenData.ZZ_DEP_STDATE_ERROR = "None";
				aData.screenData.ZZ_DEP_ENDATE_ERROR = "None";
			} else {
				aData.screenData.ZZ_DEP_STDATE_ERROR = "Error";
				aData.screenData.ZZ_DEP_ENDATE_ERROR = "Error";
				err = this.checkDateOverlapping();
				MessageBox.error(err);
				sap.ui.getCore().getModel("global").setData(aData);
				return;
			}
			aData.screenData.ZZ_DEP_FRMLOC_TXT = sap.ui.getCore().byId("idFromLocationC").getSelectedItem().getText();
			aData.screenData.ZZ_DEP_TOLOC_TXT = sap.ui.getCore().byId("idToLocationC").getSelectedItem().getText();

			if (aData.screenData.ZZ_TRV_CAT === "BUSR") {
				aData.screenData.ZZ_REQ_TYP = "BUSR";
				// If Category of Travel is entered, retrieve the min and max days
				var categoryList = sap.ui.getCore().getModel("global").getData().visaType;
				var catID = aData.screenData.ZZ_TRV_CAT;
				var selectedDesc = "Business meetings/conference";
				for (var j = 0; j < categoryList.length; j++) {
					if (catID === categoryList[j].ZZ_VKEY && aData.screenData.ZZ_DEP_TYPE === categoryList[j].ZZ_ZZ_SMODID) {
						if (selectedDesc.indexOf(categoryList[j].ZZ_VISA_DESC) !== -1) {
							aData.screenData.ZZ_MIN = categoryList[j].ZZ_MIN;
							aData.screenData.ZZ_MAX = categoryList[j].ZZ_MAX;
							aData.screenData.ZZ_VISA_DESC = categoryList[j].ZZ_VISA_DESC;
							break;
						}
					}
				}

				var taxURL = "CheckNonPETaxExpSet(ZZ_MODID='" + aData.screenData.ZZ_REQ_TYP + "',ZZ_SMODID='" + aData.screenData.ZZ_DEP_TYPE +
					"',ZZ_PERNR='" +
					sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR +
					"',ZZ_ENDDATE='" + aData.screenData.ZZ_DEP_ENDATE +
					"',ZZ_STDATE='" + aData.screenData.ZZ_DEP_STDATE +
					"',ZZ_CNTRY='" + aData.screenData.ZZ_DEP_TOCNTRY + "')";

				var totalDur;
				this.oDataModel.read(taxURL, null, null, false, jQuery.proxy(function (oData, response) {
					totalDur = oData.ZZ_DURATION;
					if (totalDur != "1-") {
						var total = 180;
						var remDur = parseInt(total - totalDur,10);
						if (aData.screenData.ZZ_DEP_DAYS > remDur) {
							//Error
							var text = "You have cumulative travel duration of  " + Math.abs(remDur) +
								" days. As per policy, maximum duration employee can travel on " +
								" Business Travels (including personal time)/Info Travel/Secondary travel for a " +
								" calendar year should not be more than " + total + "days." +
								" Please check and adjust the duration accordingly.";
							MessageBox.error(text);
							return;
						}
					}
				}, this), function (error) {
					sap.m.MessageBox.error("We are not able to Porcess your request.Try After some time");
					return;

				});
			}

			// Validate duration based on Category of Travel
			if (aData.screenData.ZZ_DEP_STDATE !== "" && aData.screenData.ZZ_DEP_ENDATE !== "") {
				var dStart = new Date(aData.screenData.ZZ_DEP_STDATE.substr(0, 4), aData.screenData.ZZ_DEP_STDATE.substr(4, 2) - 1, aData.screenData
					.ZZ_DEP_STDATE.substr(6, 2));
				var dEnd = new Date(aData.screenData.ZZ_DEP_ENDATE.substr(0, 4), aData.screenData.ZZ_DEP_ENDATE.substr(4, 2) - 1, aData.screenData
					.ZZ_DEP_ENDATE.substr(6, 2));
				/*var dDur = new Date(dEnd - dStart);
				aData.screenData.ZZ_DEP_DAYS = "" + (dDur.getTime() / (1000 * 3600 * 24) + 1);
				aData.screenData.ZZ_DEP_DAYS = "" + Math.round(aData.screenData.ZZ_DEP_DAYS);*/

				var diffTime = Math.abs(dStart - dEnd);
				var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
				diffDays = diffDays + 1;
				aData.screenData.ZZ_DEP_DAYS = "" + diffDays;

				if (parseInt(aData.screenData.ZZ_DEP_DAYS, 10) > 0) {
					err = com.bosch.hr.swift_trv.model.Common.checTravelCategoryDuration(aData.screenData.ZZ_TRV_CAT, aData.screenData.ZZ_DEP_DAYS,
						aData.screenData.ZZ_DEP_TYPE, aData.screenData
						.ZZ_DEP_TOCNTRY);
					// Validate if input date is between the category duration
					if (err !== "") {
						aData.screenData.ZZ_DEP_STDATE_ERROR = "Error";
						aData.screenData.ZZ_DEP_ENDATE_ERROR = "Error";
						MessageBox.error(err);
						sap.ui.getCore().getModel("global").setData(aData);
						return;
					} else {
						aData.screenData.ZZ_DEP_STDATE_ERROR = "None";
						aData.screenData.ZZ_DEP_ENDATE_ERROR = "None";

						// Setting additional information to screen data (sponsor by company)
						if (aData.screenData.ZZ_DEP_TYPE === "INTL") {
							if (parseInt(aData.screenData.ZZ_DEP_DAYS, 10) > 360) {
								aData.screenData.ZZ_SP_CMPNY = true;
							}
						}
						sap.ui.getCore().getModel("global").setData(aData);
					}
				} else {
					aData.screenData.ZZ_DEP_STDATE_ERROR = "Error";
					aData.screenData.ZZ_DEP_ENDATE_ERROR = "Error";
					MessageBox.error("To Date must be greater than or equal to From Date");
					sap.ui.getCore().getModel("global").setData(aData);
					return;
				}
			}

			if (((aData.screenData.ZZ_REQ_TYP === "BUSR" || aData.screenData.ZZ_REQ_TYP === "DEPU" || aData.screenData.ZZ_REQ_TYP === "INFO") &&
					(
						aData.screenData.ZZ_DEP_TYPE === "INTL" || aData.screenData.ZZ_DEP_TYPE === "DOME"))) { //added info travel trvl settlement uml6kor_8/1/2020

				var trvl_set_url = "checkTrvlSettlement?&ZZ_PERNR='" +
					sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR +
					"'&ZZ_SMODID='" + aData.screenData.ZZ_DEP_TYPE +
					"'&ZZ_MODID='" + aData.screenData.ZZ_REQ_TYP +
					"'&ZZ_ENDDATE='" + aData.screenData.ZZ_DEP_ENDATE +
					"'&$format=json";

				this.oDataModel.read(trvl_set_url, null, null, false, function (oData, response) {
					that.CheckTravelSettlement1 = JSON.parse(response.body);
					that.CheckTravelSettlement = that.CheckTravelSettlement1.d.results;
					that.onValidationCheck = true;

				}, function (error) {
					sap.m.MessageToast.show("Internal Server Error");
				}, false);

				if (that.CheckTravelSettlement.length > 0) {
					var list_r = "";
					var blkflag = ""; //added by uml6kor 17/3/2020 new validation policy for trvl settlements
					if (that.CheckTravelSettlement.length === 1) {
						if (that.CheckTravelSettlement[0].ZZ_REINR.substr(2, 10) === sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR) {
							var text = "You are blocked from creation of new travel requests" +
								" due to pending travel settlements";
							MessageBox.error(text + "\n" + list_r);
							blkflag = "X";
							sap.ui.getCore().getModel("global").setData(aData);
							return;
						}
					}
					if (blkflag !== "X") {
						for (i = 0; i < that.CheckTravelSettlement.length; i++) {
							list_r = list_r + "-" + that.CheckTravelSettlement[i].ZZ_REINR + "\n";
						}
						text = "You have travel requests which are " +
							" pending for the settlement. You are not allowed to" +
							"  create a new request until the Travel settlement for the previous requests are completed";
						MessageBox.error(text + "\n" + list_r);
						sap.ui.getCore().getModel("global").setData(aData);
						return;
					}
				}

			}
			if (aData.screenData.ZZ_DEP_FRCNTRY === aData.screenData.ZZ_DEP_TOCNTRY) {
				aData.screenData.ZZ_SMODID = "DOME";
			} else {
				aData.screenData.ZZ_SMODID = "INTL";
			}
			aData.isCreate = true;
			aData.isRead = false;
			if (aData.screenData.ZZ_TRV_CAT !== "BUSR" && aData.screenData.ZZ_TRV_CAT !== "INFO" && aData.screenData.ZZ_DEP_TYPE === "INTL") { //International deputation request
				//### UCD1KOR 06 May 2020 Comment
				/// Covid-19 changes
				var covid_max = that.covid_19COnditionCheck(aData.screenData);
				if (parseInt(aData.screenData.ZZ_DEP_DAYS, 10) > covid_max) {
					//do						
				} else {
					this.checkPeriod(aData);
				}

			} else { //Business travel or domestic
				//started display of business popup uml6kor 24/6/2019
				if (that.onValidationCheck === true && aData.screenData.ZZ_TRV_CAT === "BUSR" && aData.screenData.ZZ_DEP_TOCNTRY !== "IN") {
					var dialog = new sap.m.Dialog({
						title: 'Confirm',
						type: 'Message',
						content: new sap.m.Text({
							text: "1. China - It is advisable to submit the documents minimum 30 days in advance, else Associate has to travel to Mumbai / Delhi for personal submission." +
								"\n2. Turkey - If you are holding valid Schengen / USA / UK and Ireland - you can apply for E visa else you have to go with offline submission, then documents should be notarized with Mantralaya, Mumbai which would increase the processing time." +
								"\n3. Bangladesh - Applicant has to travel to Delhi / Mumbai / Kolkata and submit the documents to Embassy personally. " +
								"\n4. Brazil - Increase in lead time as documents to be notarized with Mantralaya, Mumbai. " +
								"\n5. Romania - Applicant has to travel in Person to Delhi and submit the documents to Embassy and it is advisable to plan the travel 30 days in advance."
						}),
						beginButton: new sap.m.Button({
							text: 'Continue',
							press: function () {
								sap.ui.getCore().getModel("global").setData(aData);
								dialog.close();
								sap.ui.core.BusyIndicator.show(1);
								//	var Products = this.getView().getModel("products").getData().ProductCollection;
								//	that.getView().getModel("products").refresh();
								setTimeout(function () {
									sap.ui.getCore().getModel("global").getData().isCreate = true;
									that.onCancelCreate();
									that.onListItemPress();
									sap.ui.getCore().getModel("products").getData().butonVisible = false;
									sap.ui.getCore().getModel("products").getData().busy = true;
									sap.ui.getCore().getModel('products').refresh();
								}, 100);
							}
						}),
						endButton: new sap.m.Button({
							text: 'Cancel',
							press: function () {
								sap.ui.getCore().getModel("global").getData().isCreate = undefined;
								dialog.close();
							}
						}),
						afterClose: function () {
							dialog.destroy();
						}
					});
					dialog.open();

				} else {
					if (that.onValidationCheck === true) {
						sap.ui.core.BusyIndicator.show(1);
						setTimeout(function () {
							that.onCancelCreate();
							that.onListItemPress();
							sap.ui.getCore().getModel("products").getData().butonVisible = false;
							sap.ui.getCore().getModel("products").getData().busy = true;
							sap.ui.getCore().getModel("products").refresh();
						}, 100);
					} else {
						sap.m.MessageBox.error("We are not able to Porcess your request.Try After some time");
					}

				}
			}

		},
		/////############## From country change ##################///////////
		onCountryFromChange: function (curEvt) {
			sap.ui.core.BusyIndicator.show(-1);
			var aData = sap.ui.getCore().getModel("global").getData();
			aData.screenData.ZZ_DEP_FRCNTRY_TXT = curEvt.getSource().getSelectedItem().getText();
			aData.cityfrom = [];
			var url = "DEP_LOCATIONSSet?$filter=MOLGA eq '" + curEvt.getSource().getSelectedItem().getKey() +
				"'&$format=json";
			this.oDataModel.read(url, null, null, true, function (oData, response) {
				var FromLoc = JSON.parse(response.body).d.results;
				if (FromLoc[0] !== undefined && FromLoc[0] !== null) {
					aData.cityfrom = FromLoc;
					sap.ui.getCore().byId("idFromLocationC").setSelectedKey(FromLoc[0].MOLGA);
					sap.ui.getCore().getModel("global").setData(aData);
				}
				sap.ui.core.BusyIndicator.hide();

			}, function (error) {
				sap.m.MessageToast.show("From Locations Not Found");
			});

		},
		/////############## To country change ##################///////////
		onCountryToChange: function (curEvt) {
			sap.ui.core.BusyIndicator.show(-1);
			var aData = sap.ui.getCore().getModel("global").getData();
			aData.screenData.ZZ_DEP_TOCNTRY_TXT = curEvt.getSource().getSelectedItem().getText();
			aData.cityto = [];

			var url = "DEP_LOCATIONSSet?$filter=MOLGA eq '" + curEvt.getSource().getSelectedItem().getKey() +
				"'&$format=json";

			this.oDataModel.read(url, null, null, true, function (oData, response) {
				var ToLoc = JSON.parse(response.body).d.results;
				if (ToLoc[0] !== undefined && ToLoc[0] !== null) {
					aData.cityto = ToLoc;
					sap.ui.getCore().byId("idToLocationC").setSelectedKey(ToLoc[0].MOLGA);
					if (aData.screenData.ZZ_DEP_TOCNTRY !== "NP") {
						if (aData.screenData.ZZ_DEP_FRCNTRY === aData.screenData.ZZ_DEP_TOCNTRY) {
							aData.screenData.ZZ_DEP_TYPE = "DOME";
						} else {
							aData.screenData.ZZ_DEP_TYPE = "INTL";
						}
					} else {
						aData.screenData.ZZ_DEP_TYPE = "DOME";
					}
					sap.ui.getCore().getModel("global").setData(aData);
				}
				sap.ui.core.BusyIndicator.hide();

			}, function (error) {
				sap.m.MessageToast.show("To Locations Not Found");
			});
		},
		//Check overlapping start and end date
		checkDateOverlapping: function () {
			var aData = sap.ui.getCore().getModel("global").getData();
			var aList = sap.ui.getCore().getModel("global").getData().deputationList; //Deputation List
			if (aList !== null) {
				for (var i = 0; i < aList.length; i++) {
					var existSD = aList[i].ZZ_DEP_STDATE;
					var existED = aList[i].ZZ_DEP_ENDATE;
					var newSD = aData.screenData.ZZ_DEP_STDATE;
					var newED = aData.screenData.ZZ_DEP_ENDATE;
					// Validation is ok
					if ((newSD < existSD && newED < existSD) || (newSD > existED && newED > existED)) {
						continue;
					} else {
						if ((newSD !== existSD && newED !== existED && (aData.screenData.ZZ_TRV_CAT === "BUSR" || aData.screenData.ZZ_TRV_CAT === "INFO") &&
								aList[i].ZZ_REQ_TYP === "DEPU") || aList[i].ZZ_REQ_TYP === "VISA" || (aList[i].ZZ_TRV_CAT === "TRFR" && aList[i].ZZ_DEP_TYPE ===
								"DOME")) {
							continue;
						} else {
							return "Request" + " '" + aList[i].ZZ_DEP_REQ + "' " +
								"has already opened from " + formatter.sapDate(existSD) + " to " +
								formatter.sapDate(existED) + ". Please select another date";
						}
					}
				}
			}
			return "";
		}

	});
});