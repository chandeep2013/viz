sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/m/MessageToast",
	"com/bosch/hr/swift_trv/model/formatter",
	"sap/m/ColumnListItem",
	"sap/m/Input",
	"sap/m/DatePicker",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter"
], function (Controller, MessageBox, JSONModel, Filter, MessageToast, formatter, ColumnListItem, Input, DatePicker, FilterOperator,
	Sorter) {
	"use strict";

	return Controller.extend("com.bosch.hr.swift_trv.controller.Detail", {
		formatter: formatter,
		onInit: function () {
			this.oOwnerComponent = this.getOwnerComponent();

			this.oRouter = this.oOwnerComponent.getRouter();
			this.oModel = this.oOwnerComponent.getModel();

			this.oRouter.getRoute("master").attachPatternMatched(this.onRouterMatched, this);
			this.oRouter.getRoute("detail").attachPatternMatched(this.onRouterMatched, this);

		},
		TemplateForTable: function () {
			var that = this;
			/************************* Cost Assignment Table********************************/

			this.CostAssigmenTable = this.byId("idCostAssigmenTable");
			this.oReadOnlyTemplate_C = this.byId("idCostAssigmenTable").removeItem(0);
			this.rebindTable_C(this.oReadOnlyTemplate_C, "Navigation");
			this.oEditableTemplate_C = new ColumnListItem({
				cells: [
					new Input({
						value: "",
						visible: false
					}),
					new Input({
						value: "{detail>ZZ_PERCENT}",
						placeholder: "Percent",
						type: "Number"
					}), new Input({
						value: "{detail>ZZ_GEBER}",
						valueHelpRequest: function (oEvent) {
							sap.ui.core.BusyIndicator.show(-1);
							that.selectedPath = oEvent.getSource().getParent().getBindingContextPath();
							that.FundServiceCall(that.selectedPath);
						},
						textFormatMode: "KeyValue",
						showValueHelp: true,
						placeholder: "Fund",
						showSuggestion: true,
						valueHelpOnly: true
					}), new Input({
						value: "{detail>ZZ_FISTL}",
						textFormatMode: "KeyValue",
						showValueHelp: true,
						placeholder: "Budget",
						showSuggestion: true,
						valueHelpOnly: true,
						valueHelpRequest: function (oEvent) {
							sap.ui.core.BusyIndicator.show(-1);
							that.selectedPath_budget = oEvent.getSource().getParent().getBindingContextPath();
							that.BudgetCenterServiceCall(that.selectedPath_budget);
						}
					}), new Input({
						value: {
							parts: ['detail>ZZ_FIPOS', 'detail>ZZ_GEBER'],
							formatter: function (val, fund) {
								if (fund === "F01") {
									return "";
								} else {
									return val;
								}

							}
						},
						valueHelpOnly: true,
						editable: {
							parts: ['detail>ZZ_GEBER'],
							formatter: function (val) {
								if (val === "F01") {
									return false;
								} else {
									return true;
								}

							}
						},
						textFormatMode: "KeyValue",
						showValueHelp: true,
						placeholder: "WBS",
						showSuggestion: true,
						valueHelpRequest: function (oEvent) {
							sap.ui.core.BusyIndicator.show(-1);
							that.selectedPath_WBS = oEvent.getSource().getParent().getBindingContextPath();
							that.WBSServiceCall(that.selectedPath_WBS);
						}
					}),
					new Input({
						value: {
							parts: ['detail>ZZ_KOSTL'],
							formatter: function (val) {
								if (val === "F03" || val === "F04") {
									return "";
								} else {
									return val;
								}

							}
						},
						valueHelpOnly: true,
						textFormatMode: "KeyValue",
						showValueHelp: true,
						placeholder: "Cost Center",
						editable: {
							parts: ['detail>ZZ_GEBER'],
							formatter: function (val) {
								if (val === "F03" || val === "F04") {
									return false;
								} else {
									return true;
								}

							}
						},
						showSuggestion: true,
						valueHelpRequest: function (oEvent) {
							sap.ui.core.BusyIndicator.show(-1);
							that.selectedPath_cost = oEvent.getSource().getParent().getBindingContextPath();
							that.costCenterServiceCall(that.selectedPath_cost);
						}
					}),
					new Input({
						value: "{detail>ZZ_FIPEX}",
						textFormatMode: "KeyValue",
						showValueHelp: true,
						placeholder: "Code",
						showSuggestion: true,
						valueHelpOnly: true,
						valueHelpRequest: function (oEvent) {
							sap.ui.core.BusyIndicator.show(-1);
							that.selectedPath_BudgetCode = oEvent.getSource().getParent().getBindingContextPath();
							that.budgetCodeServiceCall(that.selectedPath_BudgetCode);
						}
					}),
					new sap.m.Link({
						visible: {
							parts: ['detail>ZZ_GEBER'],
							formatter: function (fund) {
								if (fund === "F03") {
									return true;
								} else {
									return false;
								}
							}
						},
						text: "Info",
						press: function (oEvent) {
							if (!that._oDialogAddInfo) {
								that._oDialogAddInfo = sap.ui.xmlfragment("com.bosch.hr.swift_trv.fragments.general.CostAssingmentAdditionalInfo", that);
								that.getView().addDependent(that._oDialogAddInfo);
							}
							that.selectedPath_AddInfo = oEvent.getSource().getParent().getBindingContextPath();
							that.conditionsCheckforAddInfo(that.selectedPath_AddInfo);
							that._oDialogAddInfo.open();
						}
					})

				]
			});

			/*******************************************************************************/

			/************************* Travel Details Table********************************/
			this.TravelDetailTable = this.byId("idTravelDetailTable");
			this.oReadOnlyTemplate_T = this.byId("idTravelDetailTable").removeItem(0);
			this.rebindTable_T(this.oReadOnlyTemplate_T, "Navigation");
			this.oEditableTemplate_T = new ColumnListItem({
				cells: [
					new Input({
						value: "",
						visible: false
					}), new sap.m.Select({
						selectedKey: "{detail>ZZ_ZSLFDPD}",
						width: "100%",
						items: {
							path: 'detail>/DependentItems',
							templateShareable: false,
							template: new sap.ui.core.Item({
								key: "{detail>DOMVALUE_L}",
								text: "{detail>DDTEXT}"
							})

						}
					}), new sap.m.Input({
						value: "{detail>ZZ_ZFRPLACE}"
					}), new sap.m.Input({
						value: "{detail>ZZ_ZTOPLACE}"
					}), new sap.m.HBox({
						items: [new DatePicker({
							value: "{detail>ZZ_BEGDA}",
							displayFormat: "dd/MM/yyyy",
							valueFormat: "yyyyMMdd",
							change: function (oEvent) {
								var date = oEvent.getSource().getValue();
								var val = oEvent.getSource().getDateValue();
								that.onTravelDetails_DateChange(date, val);
							}
						}), new sap.m.TimePicker({
							value: "",
							valueFormat: "HH:mm",
							displayFormat: "HH:mm"
						})]
					}),

					new sap.m.HBox({
						items: [new DatePicker({
							value: {
								parts: ['detail>ZZ_ENDDA'],
								formatter: function (ZZ_ENDDA) {
									if (ZZ_ENDDA === "00000000") {
										return "";
									} else {
										return ZZ_ENDDA;
									}
								}
							},
							//value: "{detail>ZZ_ENDDA}",
							displayFormat: "dd/MM/yyyy",
							valueFormat: "yyyyMMdd"
						}), new sap.m.TimePicker({
							value: "",
							valueFormat: "HH:mm",
							displayFormat: "HH:mm"
						})]
					}),
					new sap.m.Select({
						selectedKey: "{detail>ZZ_ZMODE}",
						width: "100%",
						items: {
							path: 'detail>/TransportItems',
							templateShareable: false,
							template: new sap.ui.core.Item({
								key: "{detail>DOMVALUE_L}",
								text: "{detail>DDTEXT}"
							})

						}
					})

				]
			});

			/**********************************************************/

			/************************* Accomdation Table********************************/

			this.AccomdationTable = this.byId("idAccomdationTable");
			this.oReadOnlyTemplate_ACC = this.byId("idAccomdationTable").removeItem(0);
			this.rebindTable_ACC(this.oReadOnlyTemplate_ACC, "Navigation");
			this.oEditableTemplate_ACC = new ColumnListItem({
				cells: [
					new Input({
						value: "",
						visible: false
					}),
					new Input({
						value: "{detail>ZZ_ZPLACE}",
						placeholder: "Place"
					}), new DatePicker({
						value: {
							parts: ['detail>ZZ_BEGDA'],
							formatter: function (ZZ_BEGDA) {
								if (ZZ_BEGDA === "00000000") {
									return "";
								} else {
									return ZZ_BEGDA;
								}
							}
						},
						change: function (oEvent) {
							that.AccStartPath = oEvent.getSource().getParent().getBindingContextPath();
							var date = oEvent.getSource().getValue();
							that.AccStart(that.AccStartPath, date);
						},
						displayFormat: "dd/MM/yyyy",
						valueFormat: "yyyyMMdd"
					}), new DatePicker({
						value: {
							parts: ['detail>ZZ_ENDDA'],
							formatter: function (ZZ_ENDDA) {
								if (ZZ_ENDDA === "00000000") {
									return "";
								} else {
									return ZZ_ENDDA;
								}
							}
						},
						change: function (oEvent) {
							that.AccEndPath = oEvent.getSource().getParent().getBindingContextPath();
							var date = oEvent.getSource().getValue();
							that.AccEnd(that.AccEndPath, date);
						},
						displayFormat: "dd/MM/yyyy",
						valueFormat: "yyyyMMdd"
					}), new Input({
						value: "{detail>ZZ_CONTACT}",
						placeholder: "Contact Person"
					})
				]
			});

			/**********************************************************/

			/************************* Advance Table********************************/

			this.AdvanceTable = this.byId("idAdvanceTable");
			this.oReadOnlyTemplate_ADV = this.byId("idAdvanceTable").removeItem(0);
			this.rebindTable_ADV(
				this.oReadOnlyTemplate_ADV, "Navigation");
			this.oEditableTemplate_ADV = new ColumnListItem({
				cells: [
					new Input({
						value: "",
						visible: false
					}),
					new sap.m.ComboBox({
						selectedKey: "{detail>currency_key}",
						width: "100%",
						items: {
							path: 'detail>/CurrencyItems',
							templateShareable: false,
							template: new sap.ui.core.Item({
								key: "{detail>FIELD1}",
								text: "{detail>FIELD1}"
							})

						}
					}),
					new Input({
						value: "{detail>boarding}",
						change: function (oEvent) {
							that.selectedAdvance = oEvent.getSource().getParent().getBindingContextPath();
							that.CalculateAdvace(that.selectedAdvance);
						},
						liveChange: function (oEvent) {
							that.selectedAdvance = oEvent.getSource().getParent().getBindingContextPath();
							that.CalculateAdvace(that.selectedAdvance);
						}
					}),
					new Input({
						value: "{detail>lodging}",
						change: function (oEvent) {
							that.selectedAdvance = oEvent.getSource().getParent().getBindingContextPath();
							that.CalculateAdvace(that.selectedAdvance);
						},
						liveChange: function (oEvent) {
							that.selectedAdvance = oEvent.getSource().getParent().getBindingContextPath();
							that.CalculateAdvace(that.selectedAdvance);
						}
					}), new Input({
						value: "{detail>others}",
						change: function (oEvent) {
							that.selectedAdvance = oEvent.getSource().getParent().getBindingContextPath();
							that.CalculateAdvace(that.selectedAdvance);
						},
						liveChange: function (oEvent) {
							that.selectedAdvance = oEvent.getSource().getParent().getBindingContextPath();
							that.CalculateAdvace(that.selectedAdvance);
						}
					}),
					new Input({
						value: "{detail>total}",
						editable: false
					})
				]
			});

			/**********************************************************/
		},
		////////################ Editable template for all table ##############//////////
		rebindTable_C: function (oTemplate, sKeyboardMode) {
			this.CostAssigmenTable.bindItems({
				path: "detail>/TRV_HDRtoTRV_COST_ASGN/results",
				template: oTemplate,
				templateShareable: true,
				key: "fund"
			}).setKeyboardMode(sKeyboardMode);
		},
		rebindTable_T: function (oTemplate, sKeyboardMode) {
			this.TravelDetailTable.bindItems({
				path: "detail>/TRV_HDRtoTRV_travel_Data/results",
				template: oTemplate,
				templateShareable: true,
				key: "Traveller"
			}).setKeyboardMode(sKeyboardMode);
		},

		rebindTable_ACC: function (oTemplate, sKeyboardMode) {
			this.AccomdationTable.bindItems({
				path: "detail>/TRV_HDRtoTRV_ACCOM/results",
				template: oTemplate,
				templateShareable: true,
				key: "place"
			}).setKeyboardMode(sKeyboardMode);
		},
		rebindTable_ADV: function (oTemplate, sKeyboardMode) {
			this.AdvanceTable.bindItems({
				path: "detail>/advance",
				template: oTemplate,
				templateShareable: true,
				key: "currency_key"
			}).setKeyboardMode(sKeyboardMode);
		},
		///////////############## Editable tamplates -End########################//////////////
		onAfterRendering: function () {
			var Device = sap.ui.Device.system.desktop;
			if (Device === true || sap.ui.Device.system.tablet) {
				this.getView().byId("idCostAssigmenTable").getInfoToolbar().setVisible(true);
				this.getView().byId("idTravelDetailTable").getInfoToolbar().setVisible(true);
				this.getView().byId("idAccomdationTable").getInfoToolbar().setVisible(true);
				this.getView().byId("idAdvanceTable").getInfoToolbar().setVisible(true);

			} else {
				this.getView().byId("idCostAssigmenTable").getInfoToolbar().setVisible(false);
				this.getView().byId("idTravelDetailTable").getInfoToolbar().setVisible(false);
				this.getView().byId("idAccomdationTable").getInfoToolbar().setVisible(false);
				this.getView().byId("idAdvanceTable").getInfoToolbar().setVisible(false);
			}
			this.getView().byId("idTravelHideColumn").setWidth("0px");
			this.getView().byId("idCostAssingmentColumn").setWidth("0px");
			this.getView().byId("idAccommodationColumn").setWidth("0px");
			this.getView().byId("idAdvanceColumn").setWidth("0px");
		},
		AccStart: function (path, date) {
			var Property = this.getView().getModel("detail").getProperty(path);
			Property.ZZ_BEGDA = date;
			this.getView().getModel("detail").refresh();
		},
		AccEnd: function (path, date) {
			var Property = this.getView().getModel("detail").getProperty(path);
			Property.ZZ_ENDDA = date;
			this.getView().getModel("detail").refresh();
		},

		CalculateAdvace: function (path) {
			var DetailData = this.getView().getModel("detail").getProperty(path);
			var Total = parseInt(DetailData.boarding, 10) + parseInt(DetailData.lodging, 10) + parseInt(DetailData.others, 10);
			this.getView().getModel("detail").getProperty(path).total = Total;
		},
		onChangeDataRequired: function () {
			var selectedKey = sap.ui.getCore().byId("idSimDataRequired").getSelectedKey();
			if (selectedKey === "Y") {
				this.getView().getModel("detail").getData().ZZ_SIM_DATA_KEY = "Y";
			} else {
				this.getView().getModel("detail").getData().ZZ_SIM_DATA_KEY = "N";
			}
			this.getView().getModel("detail").refresh();
		},

		///////////////////######################## F4 help for budgetCode ##################################/////////////////////
		budgetCodeServiceCall: function (path) {
			var that = this;
			var Fund = this.getView().getModel("detail").getProperty(path).ZZ_GEBER;
			if (Fund === undefined || Fund === "") {
				sap.m.MessageToast.show("Please enter Fund value");
				sap.ui.core.BusyIndicator.hide();
			} else {
				if (!that._oDialogBudgetCode) {
					that._oDialogBudgetCode = sap.ui.xmlfragment("com.bosch.hr.swift_trv.fragments.f4Help.SuggestionItems_BudgetCode", that);
					that.getView().addDependent(that._oDialogBudgetCode);
				}
				if (that.bCodeServiceCall === true) {
					that._oDialogBudgetCode.open();
					sap.ui.core.BusyIndicator.hide();
				} else {
					this.oDataModel.read("Commit_item_f4?" + "GEBER='" + Fund + "'&ZZ_SMODID='" + this.getView().getModel("detail").getData().ZZ_SMODID +
						"'&$format=json", null, null, true,
						function (oData, response) {
							var data = JSON.parse(response.body);
							that.getView().getModel("detail").getData().BudgetCode = data.d.results;
							that.getView().getModel("detail").refresh();
							if (data.d.results.length === 0) {
								sap.m.MessageToast.show("Invalid Fund");
							} else {
								that.bCodeServiceCall = true;
								that._oDialogBudgetCode.open();
							}
							sap.ui.core.BusyIndicator.hide();
						},
						function (error) {
							sap.m.MessageToast.show("No Budget Code available");
							sap.ui.core.BusyIndicator.hide();
						});
				}
			}
		},
		//////////####################### F4 help for Cost Center ##########################################////////////////////////
		costCenterServiceCall: function (path) {
			var that = this;
			if (!that._oDialogCost) {
				that._oDialogCost = sap.ui.xmlfragment("com.bosch.hr.swift_trv.fragments.f4Help.SuggestionItems_CostCenter", that);
				that.getView().addDependent(that._oDialogCost);
			}
			if (that.bCenterServiceCall === true) {
				that._oDialogCost.open();
				sap.ui.core.BusyIndicator.hide();
			} else {
				var Data = this.getView().getModel("detail").getData();
				this.oDataModel.read("CostCenterF4Help?" + "ZZ_REINR='" + this.sRequest + "'&ZZ_TTYPE='" +
					"BUSR" + "'&ZZ_PERNR='" + this.Perner +
					"'&ZZ_LAND1='" + Data.ZZ_LAND1 + "'&$format=json", null, null, true,
					function (oData, response) {
						var data = JSON.parse(response.body);
						that.getView().getModel("detail").getData().CostCenterF4Help = data.d.results;
						that.getView().getModel("detail").refresh();
						if (data.d.results.length === 0) {
							sap.m.MessageToast.show("No Data Found");
						} else {
							that.bCenterServiceCall = true;
							that._oDialogCost.open();
						}
						sap.ui.core.BusyIndicator.hide();
					},
					function (error) {
						sap.m.MessageToast.show("Failed to load Cost Center ...!");
						sap.ui.core.BusyIndicator.hide();
					});
			}
		},
		/////////########################## F4 help for Fund ########################//////////////
		FundServiceCall: function (path) {
			var that = this;
			if (!that._oDialogFund) {
				that._oDialogFund = sap.ui.xmlfragment("com.bosch.hr.swift_trv.fragments.f4Help.SuggestionItems_Fund", that);
				that.getView().addDependent(that._oDialogFund);
			}
			if (that.bFundServiceCall === true) {
				that._oDialogFund.open();
				sap.ui.core.BusyIndicator.hide();
			} else {
				var Data = this.getView().getModel("detail").getData();

				this.oDataModel.read("Fund_F4_Help?ZZ_BEGDA='" + Data.ZZ_DATV1 + "'&ZZ_ENDDA='" + Data.ZZ_DATB1 +
					"'&$format=json", null, null, true,
					function (oData, response) {
						var data = JSON.parse(response.body);
						that.getView().getModel("detail").getData().Fund_F4_Help = data.d.results;
						that.getView().getModel("detail").refresh();
						if (data.d.results.length === 0) {
							sap.m.MessageToast.show("No Data Found");
						} else {
							that.bFundServiceCall = true;
							that._oDialogFund.open();
						}
						sap.ui.core.BusyIndicator.hide();
					},
					function (error) {
						sap.m.MessageToast.show("Failed to load Fund!");
						sap.ui.core.BusyIndicator.hide();
					});
			}
		},
		/////////##########################  F4 help for WBS ##########################////////
		WBSServiceCall: function (path) {
			var that = this;
			if (!that._oDialogWBS) {
				that._oDialogWBS = sap.ui.xmlfragment("com.bosch.hr.swift_trv.fragments.f4Help.SuggestionItems_WBS", that);
				that.getView().addDependent(that._oDialogWBS);
			}
			if (that.bWBSServiceCall === true) {
				that._oDialogWBS.open();
				sap.ui.core.BusyIndicator.hide();
			} else {
				var Data = this.getView().getModel("detail").getData();
				this.oDataModel.read("WBSf4Help?" + "ZZ_REINR='" + this.reqNo + "'&ZZ_PERNR='" + this.Perner + "'&ZZ_LAND1='" + Data.ZZ_LAND1 +
					"'&ZZ_TTYPE='" + "BUSR" + "'&$format=json", null, null, true,
					function (oData, response) {
						var data = JSON.parse(response.body);
						that.getView().getModel("detail").getData().WBSF4Help = data.d.results;
						that.getView().getModel("detail").refresh();
						if (data.d.results.length === 0) {
							sap.m.MessageToast.show("No Data Found");
						} else {
							that.bWBSServiceCall = true;
							that._oDialogWBS.open();
						}
						sap.ui.core.BusyIndicator.hide();
					},
					function (error) {
						sap.m.MessageToast.show("Failed to load WBS ...!");
						sap.ui.core.BusyIndicator.hide();
					});
			}
		},

		/////////////////###################  F4 help for BudgetCenter #############################/////////////////
		BudgetCenterServiceCall: function (path) {
			var that = this;
			if (!that._oDialogBudget) {
				that._oDialogBudget = sap.ui.xmlfragment("com.bosch.hr.swift_trv.fragments.f4Help.SuggestionItems_Budget", that);
				that.getView().addDependent(that._oDialogBudget);
			}
			var budgetcenterPromise = jQuery.Deferred();
			if (that.bBudgetCenterServiceCall === true) {
				budgetcenterPromise.resolve();
				that._oDialogBudget.open();
				sap.ui.core.BusyIndicator.hide();
			} else {
				this.oDataModel.read("ZE2E_FUND_CENTERSet?&$format=json", null, null, true,
					function (oData, response) {
						var data = JSON.parse(response.body);
						that.budCenterData = data.d.results;
						if (data.d.results.length === 0) {
							sap.m.MessageToast.show("No Data Found");
						} else {
							that.bBudgetCenterServiceCall = true;
							//that._oDialogBudget.open();
						}
						that.getView().getModel("detail").refresh();
						sap.ui.core.BusyIndicator.hide();
						budgetcenterPromise.resolve();
					},
					function (error) {
						sap.m.MessageToast.show("Failed to load Budget Center ...!");
						sap.ui.core.BusyIndicator.hide();
					});
			}
			$.when(budgetcenterPromise).done(
				function () {
					if (that.getView().getModel("detail").getProperty(path).ZZ_GEBER === "F02") {
						var BudgetCenter = [];
						for (var i = 0; i < that.budCenterData.length; i++) {
							if (that.budCenterData[i].ZzVkmFund === "X")
								BudgetCenter.push(that.budCenterData[i]);
						}
						that.getView().getModel("detail").getData().BudgetCenter = BudgetCenter;
					} else {
						BudgetCenter = [];
						for (i = 0; i < that.budCenterData.length; i++) {
							if (that.budCenterData[i].ZzVkmFund === "")
								BudgetCenter.push(that.budCenterData[i]);
						}
						that.getView().getModel("detail").getData().BudgetCenter = BudgetCenter;
					}
					that.getView().getModel("detail").refresh();
					that._oDialogBudget.open();
				});
		},
		////////////////////////////################## F03 MCR additional Info #####################/////////////
		onPressAddInfoRead: function (oEvent) {
			var that = this;
			if (!that._oDialogAddInfo) {
				that._oDialogAddInfo = sap.ui.xmlfragment("com.bosch.hr.swift_trv.fragments.general.CostAssingmentAdditionalInfo", that);
				that.getView().addDependent(that._oDialogAddInfo);
			}
			var selectedPath = oEvent.getSource().getParent().getBindingContextPath();
			var data = this.getView().getModel("detail").getProperty(selectedPath);
			if (data.ZZ_RESOURCEID !== undefined && data.ZZ_TASKID !== undefined && data.ZZ_RESOURCEID !== "" && data.ZZ_TASKID !== "") {
				sap.ui.getCore().byId("idNonMCRForm").setVisible(false);
				sap.ui.getCore().byId("idMCRForm").setVisible(true);
				sap.ui.getCore().byId("idOkButton").setVisible(false);
				sap.ui.getCore().byId("idTaskInfo").setValue(data.ZZ_TASKID);
				sap.ui.getCore().byId("idResourceId").setValue(data.ZZ_RESOURCEID);
				sap.ui.getCore().byId("idResourceType").setValue(data.ZZ_RESOURCETYP);

			} else {
				sap.ui.getCore().byId("idNonMCRForm").setVisible(true);
				sap.ui.getCore().byId("idMCRForm").setVisible(false);
				sap.ui.getCore().byId("idOkButton").setVisible(true);
				sap.ui.getCore().byId("idCoordName").setValue(data.ZZ_CCNAME);
				sap.ui.getCore().byId("idPoNumber").setValue(data.ZZ_PONO);
				sap.ui.getCore().byId("idCustCost").setValue(data.ZZ_CCOST);
				sap.ui.getCore().byId("idCoDept").setValue(data.ZZ_CCDEPT);
				sap.ui.getCore().byId("idCutomerCompanyName").setValue(data.ZZ_CLENTY);
			}
			this._oDialogAddInfo.open();
		},
		onPressCloseAddInfo: function () {
			this._oDialogAddInfo.close();
		},
		conditionsCheckforAddInfo: function (path) {
			var that = this;
			if (!that._oDialogAddInfo) {
				that._oDialogAddInfo = sap.ui.xmlfragment("com.bosch.hr.swift_trv.fragments.general.CostAssingmentAdditionalInfo", that);
				that.getView().addDependent(that._oDialogAddInfo);
			}
			var data = this.getView().getModel("detail").getProperty(path);
			if (data.ZZ_GEBER === "F03" && ((data.ZZ_POST1 && data.ZZ_POST1.indexOf("MCR") !== -1) || (data.WBSDescription && data.WBSDescription
					.indexOf("MCR") !== -1))) {
				sap.ui.getCore().byId("idNonMCRForm").setVisible(false);
				sap.ui.getCore().byId("idMCRForm").setVisible(true);
				sap.ui.getCore().byId("idOkButton").setVisible(false);
			} else {
				sap.ui.getCore().byId("idNonMCRForm").setVisible(true);
				sap.ui.getCore().byId("idMCRForm").setVisible(false);
				sap.ui.getCore().byId("idOkButton").setVisible(true);
			}
			this._oDialogAddInfo.open();
		},
		////////////////////// ####################### F03 MCR Additional Info Events -End ###############################/////////

		edit_Elements: function () {
			//var that = this;
			this.destroyUIElements();
			var objPage = this.byId("idObjPage");
			objPage.removeAllBlocks();
			objPage.addBlock(sap.ui.xmlfragment("com.bosch.hr.swift_trv.fragments.general.ChangeForm", this));
			this.rebindTable_C(this.oEditableTemplate_C, "Edit");
			this.rebindTable_T(this.oEditableTemplate_T, "Edit");
			this.rebindTable_ACC(this.oEditableTemplate_ACC, "Edit");
			this.rebindTable_ADV(this.oEditableTemplate_ADV, "Edit");

			this.getView().byId("idCostAssigmenTable").setMode("MultiSelect");
			this.getView().byId("idTravelDetailTable").setMode("MultiSelect");
			this.getView().byId("idAccomdationTable").setMode("MultiSelect");
			this.getView().byId("idAdvanceTable").setMode("MultiSelect");

			this.getView().byId("idCostAssigmenTable").getHeaderToolbar().setVisible(true);
			this.getView().byId("idTravelDetailTable").getHeaderToolbar().setVisible(true);
			this.getView().byId("idAccomdationTable").getHeaderToolbar().setVisible(true);
			this.getView().byId("idAdvanceTable").getHeaderToolbar().setVisible(true);
			this.getView().getModel("products").getData().editable = true;
			///////////////////// to check
			/*this.getView().getModel("products").getData().busy = true;*/
			this.getView().getModel("products").refresh();
			sap.ui.getCore().getModel("global").getData().SelectedReqNo = this.reqNo;
			this.getView().getModel("detail").getData().StartDateEditable = true;
			if (this.EnableTravelDetail === true) {
				this.getView().getModel("detail").getData().editable = false;
				this.getView().getModel("detail").getData().StartDateEditable = false;
				this.EnableTravelDetailTable();
			}
			setTimeout(function () {
				$(".sapMListTblSubCntRow").css("cssText", "display: block !important;");
				$(".sapMListTbl .sapMLabel").css("cssText", "width: auto !important;");
				$(".sapMListTblSubCntSpr").css("cssText", "display: None !important;");
			}, 1);
			var oObjectPage = this.getView().byId("ObjectPageLayout");
			oObjectPage.setShowFooter(true);
			this.getView().getModel("detail").refresh();
		},
		EnableTravelDetailTable: function () {
			///// Editable false for  datechnage
			var CostAssignmentItems = this.getView().byId("idCostAssigmenTable").getItems();
			for (var i = 0; i < CostAssignmentItems.length; i++) {
				var cells = CostAssignmentItems[i].getCells();
				for (var j = 0; j < cells.length; j++) {
					try {
						CostAssignmentItems[i].getCells()[j].setEditable(false);
					} catch (err) {}

				}
			}

			var AccomdationTableItems = this.getView().byId("idAccomdationTable").getItems();
			for (i = 0; i < AccomdationTableItems.length; i++) {
				cells = AccomdationTableItems[i].getCells();
				for (j = 0; j < cells.length; j++) {
					AccomdationTableItems[i].getCells()[j].setEditable(false);
				}
			}

			var AdvanceTableItems = this.getView().byId("idAdvanceTable").getItems();
			for (i = 0; i < AdvanceTableItems.length; i++) {
				cells = AdvanceTableItems[i].getCells();
				for (j = 0; j < cells.length; j++) {
					try {
						AdvanceTableItems[i].getCells()[j].setEditable(false);
					} catch (err) {
						AdvanceTableItems[i].getCells()[j].setEnabled(false);
					}

				}
			}

			this.getView().byId("idCostAssigmenTable").getHeaderToolbar().setVisible(false);
			this.getView().byId("idAccomdationTable").getHeaderToolbar().setVisible(false);
			this.getView().byId("idAdvanceTable").getHeaderToolbar().setVisible(false);
			this.getView().byId("idCostAssigmenTable").setMode("None");
			this.getView().byId("idAccomdationTable").setMode("None");
			this.getView().byId("idAdvanceTable").setMode("None");

		},
		nonedit_Elements: function () {

			var objPage = this.byId("idObjPage");
			objPage.removeAllBlocks();
			objPage.addBlock(sap.ui.xmlfragment("com.bosch.hr.swift_trv.fragments.general.DisplayForm", this));
			this.destroyUIElements();
			this.rebindTable_C(this.oReadOnlyTemplate_C, "Navigation");
			this.rebindTable_T(this.oReadOnlyTemplate_T, "Navigation");
			this.rebindTable_ACC(this.oReadOnlyTemplate_ACC, "Navigation");
			this.rebindTable_ADV(this.oReadOnlyTemplate_ADV, "Navigation");

			this.getView().byId("idCostAssigmenTable").setMode("None");
			this.getView().byId("idTravelDetailTable").setMode("None");
			this.getView().byId("idAccomdationTable").setMode("None");
			this.getView().byId("idAdvanceTable").setMode("None");

			this.getView().getModel("products").getData().editable = false;
			//	this.getView().getModel("products").getData().busy = false;
			this.getView().getModel("products").refresh();
			this.getView().byId("idCostAssigmenTable").getHeaderToolbar().setVisible(false);
			this.getView().byId("idTravelDetailTable").getHeaderToolbar().setVisible(false);
			this.getView().byId("idAccomdationTable").getHeaderToolbar().setVisible(false);
			this.getView().byId("idAdvanceTable").getHeaderToolbar().setVisible(false);
			this.getView().getModel("detail").getData().StartDateEditable = false;
			sap.ui.getCore().getModel("products").getData().butonVisible = true;
			sap.ui.getCore().getModel('products').refresh();

			var oObjectPage = this.getView().byId("ObjectPageLayout");
			oObjectPage.setShowFooter(false);
			setTimeout(function () {
				$(".sapMListTblSubCntRow").css("cssText", "display: -webkit-box !important;");
				$(".sapMListTbl .sapMLabel").css("cssText", "width: 8rem !important;");
				$(".sapMListTblSubCntSpr").css("cssText", "display: .5rem !important;");
				/*sap.ui.core.BusyIndicator.hide();*/
			}, 100);
		},
		onTravelDetails_DateChange: function (date, val) {
			var oData = this.getView().getModel("detail").getData();
			if ((oData.ZZ_MODID === 'BUSR' || oData.ZZ_MODID === 'SECO' || oData.ZZ_MODID === 'INFO' || (oData.ZZ_MODID === 'DEPU' && sap.ui.getCore()
					.getModel("global").getData().ZZ_TRV_CAT !== 'TRFR'))) {
				var min_date;
				var max_date;
				for (var i = 0; i < oData.TRV_HDRtoTRV_travel_Data.results.length && oData.TRV_HDRtoTRV_travel_Data !== undefined; i++) {
					if (oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ZSLFDPD === '00') {
						if (min_date === null || max_date === null || min_date === undefined || max_date === undefined) {
							min_date = oData.TRV_HDRtoTRV_travel_Data.results[0].ZZ_BEGDA;
							max_date = oData.TRV_HDRtoTRV_travel_Data.results[0].ZZ_BEGDA;

						}
						if (parseInt(min_date, 0) > parseInt(oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_BEGDA, 0)) {
							min_date = oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_BEGDA;
						}
						if (parseInt(max_date, 0) < parseInt(oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_BEGDA, 0)) {
							max_date = oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_BEGDA;
						}
					}
				}
				if (oData.PersFlag !== "X") {
					oData.ZZ_DATV1 = min_date;
					oData.ZZ_DATB1 = max_date;
					this.getView().getModel("detail").setData(oData);
					this.getView().getModel("detail").refresh();
					this.DateChageValidation();
				} else {
					this.checkPersonalDate();
					var min_pdate;
					var max_pdate;
					var pstripDate = new Date(oData.Personal_SDate.substr(0, 4),
						oData.Personal_SDate.substr(4, 2) - 1,
						oData.Personal_SDate.substr(6, 2));
					var tetripDate = new Date(oData.ZZ_DATB1.substr(0, 4),
						oData.ZZ_DATB1.substr(4, 2) - 1,
						oData.ZZ_DATB1.substr(6, 2));
					if (tetripDate > pstripDate) {
						max_pdate = oData.ZZ_DATB1;
						min_pdate = oData.Personal_SDate;
					} else {
						max_pdate = oData.Personal_EDate;
						min_pdate = oData.ZZ_DATV1;
					}
					oData.minPDate = min_pdate;
					oData.maxPDate = max_pdate;
					this.getView().getModel("detail").setData(oData);
				}

			}
		},
		onChangeTravelDate: function (evt) {
			//	var aList = sap.ui.getCore().getModel("global").getData().deputationList; //Deputation List
			var min_date, min_pdate;
			var max_date, max_pdate;
			var flag1 = 0;
			var flag2 = 0;
			var aData = this.getView().getModel("detail").getData();
			if (this.TravelStartDate === undefined && this.TravelEndDate === undefined) {
				this.TravelStartDate = aData.ZZ_DATV1;
				this.TravelEndDate = aData.ZZ_DATB1;
			}
			if ((aData.Personal_SDate && (aData.Personal_SDate < this.TravelStartDate)) || (aData.Personal_EDate && (aData.Personal_EDate <
					this.TravelStartDate))) {
				min_pdate = aData.Personal_SDate;
			}

			if (aData.Personal_SDate && (aData.Personal_SDate > this.TravelEndDate) && aData.Personal_EDate && (aData.Personal_EDate > this.TravelEndDate)) {
				max_pdate = aData.Personal_EDate;
			}

			for (var i = 0; i < aData.TRV_HDRtoTRV_travel_Data.results.length && aData.TRV_HDRtoTRV_travel_Data !== undefined; i++) {
				if (aData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ZSLFDPD === '00') {
					if (min_date === null || max_date === null || min_date === undefined || max_date === undefined) {
						min_date = aData.TRV_HDRtoTRV_travel_Data.results[0].ZZ_BEGDA;
						max_date = aData.TRV_HDRtoTRV_travel_Data.results[0].ZZ_BEGDA;
					}
					if (parseInt(min_date, 0) >= parseInt(aData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_BEGDA, 0)) {
						min_date = aData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_BEGDA;
						flag1 = i;
					}

					if (parseInt(max_date, 0) <= parseInt(aData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_BEGDA, 0)) {
						max_date = aData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_BEGDA;
						flag2 = i;
					}
				}
			}
			aData.TRV_HDRtoTRV_travel_Data.results[flag1].ZZ_BEGDA = aData.ZZ_DATV1;
			aData.TRV_HDRtoTRV_travel_Data.results[flag2].ZZ_BEGDA = aData.ZZ_DATB1;
			this.getView().getModel("detail").setData(aData);
			this.getView().getModel("detail").refresh();
			this.DateChageValidation();

			if (aData.PersFlag === "X") {
				this.onPersonalDateChange();
			}
		},
		onPersonalDateChange: function (evt) {
			var min_date, max_date, flag1, flag2;
			var oData = this.getView().getModel("detail").getData();
			if (oData.ZZ_DATV1 !== "" && oData.ZZ_DATB1 !== "" && oData.Personal_SDate !== "" && oData.Personal_EDate !== "" && oData.Personal_SDate !==
				undefined && oData.Personal_EDate !== undefined) {
				if (oData.ZZ_MODID === 'BUSR' && oData.ZZ_SMODID === "INTL" && oData.PersFlag === "X") {
					var min_pdate;
					var max_pdate;
					var pstripDate = new Date(oData.Personal_SDate.substr(0, 4),
						oData.Personal_SDate.substr(4, 2) - 1,
						oData.Personal_SDate.substr(6, 2));
					var tetripDate = new Date(oData.ZZ_DATB1.substr(0, 4),
						oData.ZZ_DATB1.substr(4, 2) - 1,
						oData.ZZ_DATB1.substr(6, 2));
					if (tetripDate > pstripDate) {
						max_pdate = oData.ZZ_DATB1;
						min_pdate = oData.Personal_SDate;
					} else {
						max_pdate = oData.Personal_EDate;
						min_pdate = oData.ZZ_DATV1;
					}
					if (oData.TRV_HDRtoTRV_travel_Data !== undefined) {

						for (var i = 0; i < oData.TRV_HDRtoTRV_travel_Data.results.length && oData.TRV_HDRtoTRV_travel_Data !== undefined; i++) {
							if (min_date === null || max_date === null || min_date === undefined || max_date === undefined) {
								min_date = oData.TRV_HDRtoTRV_travel_Data.results[0].ZZ_BEGDA;
								max_date = oData.TRV_HDRtoTRV_travel_Data.results[0].ZZ_BEGDA;
							}
							if (parseInt(min_date, 0) >= parseInt(oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_BEGDA, 0)) {
								min_date = oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_BEGDA;
								flag1 = i;
							}

							if (parseInt(max_date, 0) <= parseInt(oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_BEGDA, 0)) {
								max_date = oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_BEGDA;
								flag2 = i;
							}
						}
						oData.TRV_HDRtoTRV_travel_Data.results[flag1].ZZ_BEGDA = min_pdate;
						oData.TRV_HDRtoTRV_travel_Data.results[flag2].ZZ_BEGDA = max_pdate;

						//	oData.TRV_HDRtoTRV_travel_Data.results[0].ZZ_BEGDA = min_pdate;
						//	oData.TRV_HDRtoTRV_travel_Data.results[oData.TRV_HDRtoTRV_travel_Data.results.length - 1].ZZ_BEGDA = max_pdate;
						oData.minPDate = min_pdate;
						oData.maxPDate = max_pdate;
						this.getView().getModel("detail").setData(oData);
					}
					this.checkPersonalDate();
				}
			}
		},
		checkPersonalDate: function () {
			var oData = this.getView().getModel("detail").getData();
			if (oData.Personal_SDate === undefined) {
				oData.Personal_SDate = "";
			}
			if (oData.Personal_EDate === undefined) {
				oData.Personal_EDate = "";
			}
			if (oData.ZZ_TRV_TYP === "BUSR" && oData.ZZ_SMODID === "INTL" && oData.PersFlag === "X") {
				if (oData.Personal_SDate !== null || oData.Personal_EDate !== null) {
					var psDate = new Date(oData.Personal_SDate.substr(0, 4),
						oData.Personal_SDate.substr(4, 2) - 1,
						oData.Personal_SDate.substr(6, 2));
					var peDate = new Date(oData.Personal_EDate.substr(0, 4),
						oData.Personal_EDate.substr(4, 2) - 1,
						oData.Personal_EDate.substr(6, 2));
					var tsDate = new Date(oData.ZZ_DATV1.substr(0, 4),
						oData.ZZ_DATV1.substr(4, 2) - 1,
						oData.ZZ_DATV1.substr(6, 2));
					var teDate = new Date(oData.ZZ_DATB1.substr(0, 4),
						oData.ZZ_DATB1.substr(4, 2) - 1,
						oData.ZZ_DATB1.substr(6, 2));
					var peDateDiff = new Date(tsDate - 1);
					var psDateDiff = new Date(psDate - 1);
					if (psDate > peDate) {
						this.PersonalError = "Personal Trip Start Date should be less than End Date";
						oData.PersonalError = "Error";
						MessageBox.error(this.PersonalError);
					} else {
						this.PersonalError = undefined;
						oData.PersonalError = "None";
					}
					this.getView().getModel("detail").setData(oData);
					if ((peDateDiff.getDate() === peDate.getDate() && peDateDiff.getMonth() === peDate.getMonth()) || (psDateDiff.getDate() ===
							teDate.getDate() && psDateDiff.getMonth() === teDate.getMonth())) {
						this.PersonalError = undefined;
						oData.PersonalError = "None";
					} else {
						oData.PersonalError = "Error";
						this.PersonalError = "Please make sure that there is no gap/overlap between personal travel and business travel";
						MessageBox.error("Please make sure that there is no gap/overlap between personal travel and business travel");
					}
					this.getView().getModel("detail").setData(oData);
				}
			}
		},
		DateChageValidation: function () {
			var aList = sap.ui.getCore().getModel("global").getData().deputationList; //Deputation List
			if (aList !== null) {
				for (var i = 0; i < aList.length; i++) {
					var existSD = aList[i].ZZ_DEP_STDATE;
					var existED = aList[i].ZZ_DEP_ENDATE;
					var newSD = this.getView().getModel("detail").getData().ZZ_DATV1;
					var newED = this.getView().getModel("detail").getData().ZZ_DATB1;
					var startDate = newSD;
					var endDate = newED;
					// Validation is ok
					if ((existSD <= startDate && existED >= startDate) || (existSD <= endDate && existED >= endDate) || (existSD >= startDate &&
							existED <= endDate)) {
						if (aList[i].ZZ_TRV_REQ !== this.reqNo) {
							var Text = "Request Number" + " '" + aList[i].ZZ_DEP_REQ + "' " + "has already opened from " + formatter.sapDate(
									existSD) + " to " + formatter.sapDate(existED) +
								". Please select another date";
							this.TravelDateError = Text;
							return;
						} else {
							this.TravelDateError = undefined;
						}
					} else if (newSD !== existSD && newED !== existED) {
						var date1 = new Date(newSD.substring(4, 6) + "/" + newSD.substring(6, 8) + "/" + newSD.substring(0, 4));
						var date2 = new Date(newED.substring(4, 6) + "/" + newED.substring(6, 8) + "/" + newED.substring(0, 4));
						var diffTime = Math.abs(date2 - date1);
						var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
						diffDays = diffDays + 1;
						this.getView().getModel("detail").getData().ZZ_ZDURN = diffDays;
						this.getView().getModel("detail").refresh();
						if (newSD > newED) {
							MessageBox.error("Start Date should be less than End Date");
							return;
						}
						continue;
					}
				}
			}
		},
		onPressAdvance: function () {
			var that = this;
			if (that.advanceCall === true) {
				that._AdvanceoDialog.open();
			} else {
				sap.ui.core.BusyIndicator.show(-1);
				var oData = this.getView().getModel("detail").getData();
				var url = "AdvanceAmount?" + "ENDDA='" + oData.ZZ_DATB1 + "'&STDATE='" + oData.ZZ_DATV1 + "'&ZE2E_LEVEL='" + oData.ZZ_LEVEL +
					"'&ZZ_CITY='" + oData.ZZ_LOCATION_END + "'&ZZ_FRMLAND='" + oData.ZZ_FMCNTRY + "'&ZZ_MODID='" + oData.ZZ_MODID + "'&ZZ_SMODID='" +
					oData.ZZ_SMODID + "'&ZZ_TOLAND='" + oData.ZZ_LAND1 + "'&$format=json";
				this.oDataModel.read(url, null, null, true,
					function (data, response) {
						var result = JSON.parse(response.body);
						var advance = result.d.results[0];
						that.advanceCall = true;
						if (!that._AdvanceoDialog) {
							that._AdvanceoDialog = sap.ui.xmlfragment("com.bosch.hr.swift_trv.fragments.common.AdvancesAsPerPolicy", that);
							that.getView().addDependent(that._AdvanceoDialog);
						}
						if (advance.ZE2E_BOAC_TEXT && advance.ZE2E_LODC_TEXT && advance.ZE2E_CONC_TEXT) {
							sap.ui.getCore().byId("idBoardingAllownce").setText(advance.ZE2E_BOAC_TEXT + ":" + advance.ZE2E_BOAC_AMT + " " + advance.ZE2E_BOAC_CURR);
							sap.ui.getCore().byId("idLodgingAllownce").setText(advance.ZE2E_LODC_TEXT + ":" + advance.ZE2E_LODC_AMT + " " + advance.ZE2E_LODC_CURR);
							sap.ui.getCore().byId("idConveyanceAllownce").setText(advance.ZE2E_CONC_TEXT + ":" + advance.ZE2E_CONC_AMT + " " + advance.ZE2E_CONC_CURR);
						}
						that._AdvanceoDialog.open();
						sap.ui.core.BusyIndicator.hide(0);
					},
					function (error) {
						sap.m.MessageToast.show("Advance Details Not Found..!");
					});
			}
		},
		onClosePopup: function () {
			this._AdvanceoDialog.close();
			//this._oDialog.destroy();
		},
		onRouterMatched: function (oEvent) {
			this.masterRoute = this.oOwnerComponent.getRouter().getRoute('master'); ///To remove
			this.detailRoute = this.oOwnerComponent.getRouter().getRoute('detail'); ///To remove

			var globalData = sap.ui.getCore().getModel("global").getData();
			if (globalData.isExisting === true) {
				this.rebindTable_C(this.oReadOnlyTemplate_C, "Navigation");
				this.rebindTable_T(this.oReadOnlyTemplate_T, "Navigation");
				this.rebindTable_ACC(this.oReadOnlyTemplate_ACC, "Navigation");
				this.rebindTable_ADV(this.oReadOnlyTemplate_ADV, "Navigation");
				globalData.isExisting = false;
				this.MinScreen = false;
				this.FullScreen = false;
				this.dateChange = false;
				this.EnableTravelDetail = false;
				this.bCodeServiceCall = false;
				this.bCenterServiceCall = false;
				this.bFundServiceCall = false;
				this.bWBSServiceCall = false;
				this.bBudgetCenterServiceCall = false;
				sap.ui.getCore().getModel("products").getData().dateChange = false;
			}
			if (globalData.StateChanged !== true && globalData.isUpdate !== true && this.MinScreen !== true && this.FullScreen !== true &&
				oEvent !== undefined && oEvent.getParameter("arguments").layout !==
				"MidColumnFullScreen") {
				this._onProductMatched(oEvent);
			}
			if (globalData.isUpdate === true) {
				setTimeout(function () {
					$(".sapMListTblSubCntRow").css("cssText", "display: block !important;");
					$(".sapMListTbl .sapMLabel").css("cssText", "width: auto !important;");
					$(".sapMListTblSubCntSpr").css("cssText", "display: None !important;");
				}, 10);
			} else {
				setTimeout(function () {
					$(".sapMListTblSubCntRow").css("cssText", "display: -webkit-box !important;");
					$(".sapMListTbl .sapMLabel").css("cssText", "width: 8rem !important;");
					$(".sapMListTblSubCntSpr").css("cssText", "display: .5rem !important;");
				}, 10);
			}
		},
		///////////////////////////#####################################################////////////////////////////////////
		_onProductMatched: function (oEvent) {
			var that = this;
			this.aData = sap.ui.getCore().getModel("global").getData();
			sap.ui.core.BusyIndicator.show(1);
			this.reqNo = "";
			if (this.aData.isUpdate !== true && this.dateChange !== true) {
				this._product = oEvent.getParameter("arguments").product || this._product || "0";
				this.reqNo = oEvent.getParameter("arguments").reqNo;
			} else {
				this.reqNo = this.getView().getModel("detail").getData().ZZ_DEP_REQ;
			}
			this.Perner = sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR;
			this.level = sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_LEVEL;
			//	this.Perner = "00001095"; // to remove
			//	this.level = "51"; /// to remove
			this.sServiceUrl = "/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/";
			this.oDataModel = new sap.ui.model.odata.ODataModel(this.sServiceUrl);
			if (this.aData.isCreate === undefined && this.reqNo !== "" && this.reqNo !== undefined) {
				this.aData.isCreate = false;
				this.aData.isRead = true;
			}
			if (oEvent === undefined) {
				this.aData.isRead = false;
			}
			/////////################## Date Change #########################////////////////
			if (this.dateChange === true) {
				this.aData.isUpdate = true;
				this.aData.isRead = false;
			}
			//////####################### Service list for Create and Update ###############################/////////////
			var batchOperation0 = this.oDataModel.createBatchOperation("GetDomain?DomainName='ZINF_REASON'&$format=json", "GET");
			var batchOperation1 = this.oDataModel.createBatchOperation("GetDomain?DomainName='ZINSUR'&$format=json", "GET");
			var batchOperation3 = this.oDataModel.createBatchOperation("GetDomain?DomainName='FTPD_MEALCODE'&$format=json", "GET");
			var batchOperation4 = this.oDataModel.createBatchOperation("GetDomain?DomainName='FTPD_FLIGHT_PREF_SEAT'&$format=json", "GET");
			var batchOperation5 = this.oDataModel.createBatchOperation(
				"GetF4Table?TableName='ZE2E_TRV_TYP'&Col1='ZZ_TRV_KEY'&Col2='ZZ_TRV_TYP'&Col3=''&Col4=''&Col5=''&Col6=''&Col7=''&Col8=''&Col9=''&Col10=''&$format=json",
				"GET");
			var batchOperation8 = this.oDataModel.createBatchOperation("GetConstant?CONST='BUSR'&SELPAR='WARNING'&$format=json", "GET");

			if (this.aData.isCreate === true) {
				var screenData = sap.ui.getCore().getModel("global").getData().screenData;
				/*var sSELLAR = screenData.ZZ_DEP_REQ.charAt(2);*/
				var sSELLAR = "";
				var sTRV_TR_URL = "GetConstant?CONST='VKM_TR'&SELPAR='{0}'&$format=json";
				sTRV_TR_URL = sTRV_TR_URL.replace("{0}", sSELLAR);
				var batchOperation13 = this.oDataModel.createBatchOperation(sTRV_TR_URL, "GET");
				var batchOperation20 = this.oDataModel.createBatchOperation("GetF4Help?Srch_help='F4_TCURC_ISOCD'&ZZ_SMODID='" + this.aData.screenData
					.ZZ_SMODID +
					"'&$format=json", "GET");
			} else if (this.aData.isUpdate === true || this.dateChange === true) {
				sSELLAR = this.reqNo.charAt(2);
				sTRV_TR_URL = "GetConstant?CONST='VKM_TR'&SELPAR='{0}'&$format=json";
				sTRV_TR_URL = sTRV_TR_URL.replace("{0}", sSELLAR);
				batchOperation13 = this.oDataModel.createBatchOperation(sTRV_TR_URL, "GET");
				var sModId = this.getView().getModel("detail").getData().ZZ_SMODID;
				batchOperation20 = this.oDataModel.createBatchOperation("GetF4Help?Srch_help='F4_TCURC_ISOCD'&ZZ_SMODID='" + sModId
					.ZZ_SMODID +
					"'&$format=json", "GET");
			}

			var batchOperation21 = this.oDataModel.createBatchOperation("GetDomain?DomainName='ZSLFDPD'&$format=json", "GET");
			var batchOperation22 = this.oDataModel.createBatchOperation("GetDomain?DomainName='ZINF_MODE'&$format=json", "GET");

			var batchOperation6 = this.oDataModel.createBatchOperation("CUSTOMER_DETAILS_RFC?PERNR='" + this.Perner + "'&$format=json", "GET");
			var batchOperation18 = this.oDataModel.createBatchOperation("VKMNames?VKMName='DE'&$format=json", "GET");
			var batchOperation19 = this.oDataModel.createBatchOperation("MCRData?&$format=json", "GET");
			var batchOperation23 = this.oDataModel.createBatchOperation("PersonalTripSet(TrvReq='" + this.reqNo + "',EmpNo='" + this.Perner +
				"',Version='')", "GET");

			sap.ui.getCore().getModel("products").getData().ZZ_VISA_SDATE = "";
			sap.ui.getCore().getModel("products").getData().ZZ_VISA_EDATE = "";
			sap.ui.getCore().getModel("products").getData().ZZ_VISA_NO = "";
			sap.ui.getCore().getModel("products").getData().ZZ_CURR_VISA_TYP = "";
			sap.ui.getCore().getModel("products").getData().href = "";
			sap.ui.getCore().getModel("products").getData().enabledUpload = true;
			sap.ui.getCore().getModel("products").refresh();
			/////################### Create New request ###########################///////////
			if (this.aData.isCreate === true) {
				this.sRequest = "0000000000";
				if (screenData.ZZ_REQ_TYP === "BUSR" && screenData.ZZ_DEP_TYPE === "INTL") {

					if (screenData.ZZ_DEP_REQ === "" || screenData.ZZ_DEP_REQ === undefined) {
						screenData.ZZ_DEP_REQ = "";
						screenData.ZZ_TRV_REQ = screenData.ZZ_DEP_REQ = "";
						var tpstDate = new Date(screenData.ZZ_DEP_STDATE.substr(0, 4), screenData.ZZ_DEP_STDATE.substr(4, 2) - 1, screenData.ZZ_DEP_STDATE
							.substr(6, 2));
						var tpenDate = new Date(screenData.ZZ_DEP_ENDATE.substr(0, 4), screenData.ZZ_DEP_ENDATE.substr(4, 2) - 1, screenData.ZZ_DEP_ENDATE
							.substr(6, 2));
						var tpDur = new Date(tpenDate - tpstDate);
						var tpDays = tpDur.getTime() / (1000 * 3600 * 24) + 1;
						tpDays = "" + Math.round(tpDays);

						if (tpDays <= 31) {
							this.aData.simCardFields = true;
						}
					} else {
						this.aData.simCardFields = true;

					}
				} else {
					if (screenData.ZZ_DEP_REQ === "" || screenData.ZZ_DEP_REQ === undefined) {
						screenData.ZZ_DEP_REQ = "";
						screenData.ZZ_TRV_REQ = screenData.ZZ_DEP_REQ = "";
					}
				}
				var batchArray = [batchOperation0, batchOperation1, batchOperation3, batchOperation4,
					batchOperation5, batchOperation6, batchOperation8, batchOperation13, batchOperation18, batchOperation19,
					batchOperation20, batchOperation21, batchOperation22
				];
				this.oDataModel.addBatchReadOperations(batchArray);
				this.oDataModel.submitBatch(function (oResult) {
					var oModel = new sap.ui.model.json.JSONModel();
					var oData = {
						ZZ_ZDURN: (screenData.ZZ_REQ_TYP === "BUSR" || screenData.ZZ_REQ_TYP === "INFO") ? screenData.ZZ_DEP_DAYS : "",
						ZZ_DATB1: (screenData.ZZ_REQ_TYP === "BUSR" || screenData.ZZ_REQ_TYP === "INFO") ? screenData.ZZ_DEP_ENDATE : "",
						ZZ_DATV1: (screenData.ZZ_REQ_TYP === "BUSR" || screenData.ZZ_REQ_TYP === "INFO") ? screenData.ZZ_DEP_STDATE : "",
						ZZ_LAND1: screenData.ZZ_DEP_TOCNTRY,
						ZZ_LOCATION_END: (screenData.ZZ_REQ_TYP === "BUSR" || screenData.ZZ_REQ_TYP === "INFO") ? screenData.ZZ_DEP_TOLOC_TXT : "",
						ZZ_FMCNTRY: (screenData.ZZ_REQ_TYP === "BUSR" || screenData.ZZ_REQ_TYP === "INFO") ? screenData.ZZ_DEP_FRCNTRY : screenData
							.ZZ_DEP_TOCNTRY,
						ZZ_FMLOC: (screenData.ZZ_REQ_TYP === "BUSR" || screenData.ZZ_REQ_TYP === "INFO") ? screenData.ZZ_DEP_FRMLOC_TXT : screenData
							.ZZ_DEP_TOLOC_TXT,
						ZZ_TRV_TYP: screenData.ZZ_REQ_TYP,
						ZZ_ZCATG: that.assignTravelCategory(that.level),
						ZZ_PERNR: that.Perner,
						ZZ_REINR: "0000000000",
						ZZ_LEVEL: that.level,
						ZZ_ZVISAT: (screenData.ZZ_REQ_TYP === "BUSR" || screenData.ZZ_REQ_TYP === "INFO") ? that.assignVisaCategory(
							screenData.ZZ_REQ_TYP, screenData.ZZ_DEP_FRCNTRY, screenData.ZZ_DEP_TOCNTRY) : "1",
						ZZ_MODID: screenData.ZZ_REQ_TYP,
						ZZ_STATUS: "",
						ZZ_SIM_REQ_KEY: "",
						ZZ_SIM_TYP_KEY: "",
						ZZ_SIM_DATA_KEY: ""
					};
					oData.ZZ_SMODID = (oData.ZZ_FMCNTRY === oData.ZZ_LAND1) || (oData.ZZ_FMCNTRY === "IN" && oData.ZZ_LAND1 === "NP") || (oData.ZZ_FMCNTRY ===
						"NP" && oData.ZZ_LAND1 === "IN") ? "DOME" : "INTL";
					that.bindTravelData(oData, oResult.__batchResponses[0].data, oResult.__batchResponses[1].data, oResult.__batchResponses[
						2].data, oResult.__batchResponses[4].data, oResult.__batchResponses[5].data);
					oData.view = {
						"enabled": true,
						"isFuture": true,
						"costLength": 0,
						"detailLength": 0,
						"accommodationLength": 0,
						"international": screenData.ZZ_DEP_TYPE === "INTL",
						"enableConfirm": screenData.ZZ_DEP_TYPE === "INTL",
						"enableAddDetail": true,
						"enabledCountry": screenData.ZZ_REQ_TYP === "SECO",
						"warning": oResult.__batchResponses[6].data.GetConstant.VALUE,
						"visaAvailability": (screenData.ZZ_REQ_TYP === "BUSR" || screenData.ZZ_REQ_TYP === "INFO") && screenData.ZZ_DEP_TYPE ===
							"INTL",
						"cargoVis": false
					};
					if (oData.ZZ_DATB1 !== "00000000" && oData.ZZ_DATB1 !== "" && oData.ZZ_DATB1 !== null) {
						oData.view.ZZ_DATB1_VALUE = new Date(oData.ZZ_DATB1.substr(0, 4), oData.ZZ_DATB1.substr(4, 2) - 1, oData.ZZ_DATB1.substr(6,
							2));
						oData.view.ZZ_DATV1_VALUE = new Date(oData.ZZ_DATV1.substr(0, 4), oData.ZZ_DATV1.substr(4, 2) - 1, oData.ZZ_DATV1.substr(6,
							2));
					} else {
						oData.ZZ_DATB1 = "";
						oData.ZZ_DATV1 = "";
					}
					if (oData.ZZ_SIM_REQ_KEY === "" || oData.ZZ_SIM_REQ_KEY === "N" || oData.ZZ_SIM_REQ_KEY === "P") {
						oData.ZZ_SIM_REQ_KEY = "N";
					} else {
						oData.ZZ_SIM_REQ_KEY = "Y";
					}
					// Set value for insurance
					if ((oData.ZZ_TRV_TYP === "BUSR" || oData.ZZ_TRV_TYP === "INFO") && oData.ZZ_SMODID === "INTL") {
						oData.view.enableInsurance = false;
						oData.ZZ_ZINSUR = "B";
					} else {
						oData.view.enableInsurance = oData.view.isFuture;
					}

					sap.ui.getCore().getModel("products").getData().ZZ_CURR_VISA_TYP = "BUSR";
					sap.ui.getCore().getModel("products").getData().ZZ_VISA_TOCNTRY = screenData.ZZ_DEP_TOCNTRY;
					sap.ui.getCore().getModel("products").getData().ZZ_VISA_FCNTRY = screenData.ZZ_DEP_FRCNTRY;
					sap.ui.getCore().getModel("products").getData().ZZ_MULT_ENTRY_CHAR = false;
					sap.ui.getCore().getModel("products").getData().ZZ_VISA_SDATE = "";
					sap.ui.getCore().getModel("products").getData().ZZ_VISA_EDATE = "";
					sap.ui.getCore().getModel("products").getData().ZZ_VISA_NO = "";
					sap.ui.getCore().getModel("products").getData().ZZ_OFFC_ADDRESS = "BUSR";
					sap.ui.getCore().getModel("products").getData().ZZ_DEP_REQ = "";
					sap.ui.getCore().getModel("products").getData().ZZ_VISA_PLAN = "";
					sap.ui.getCore().getModel("products").getData().VISAPLANTOITEM = [];
					sap.ui.getCore().getModel("products").refresh();
					oData.MCR = oResult.__batchResponses[9].data.results;
					oData.CurrencyItems = oResult.__batchResponses[10].data.results;
					oModel.setSizeLimit(100000);
					oData.DependentItems = oResult.__batchResponses[11].data.results;
					oData.TransportItems = oResult.__batchResponses[12].data.results;
					oData.CountryList = that.aData.country;
					that.bindingDeepEntity(oData, screenData.ZZ_DEP_TOCNTRY);
					that.convertAdvance(oData);
					that.initialDataSetup(oData);
					sap.ui.getCore().getModel("global").setProperty("/VKM_TR", oResult.__batchResponses[7].data.GetConstant.VALUE);
					oData.ZZ_NEXT_APPROVER = sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_NTID;
					oData.subtype = sap.ui.getCore().getModel("global").getData().subtype;
					oModel.setData(oData);
					//oModel.setSizelimit(CurrencyItems.length);
					that.getView().setModel(oModel, "detail");
					that.TemplateForTable(); // create templates for tables
					that.edit_Elements();
					var backup = that.copyFields(oData, backup);
					that.getView().byId("ObjectPageLayout").setSelectedSection("idGeneralTab");
					sap.ui.core.BusyIndicator.hide();

				}, function (oError) {
					MessageBox.error("Sorry for this inconvenience. Please contact support team");
				});

			} else if (this.aData.isRead === true || this.aData.isUpdate === true || this.dateChange === true) {
				///////////############################# Read existing request #####################################//////////////////
				this.sRequest = this.reqNo;
				var batchOperationR1 = this.oDataModel.createBatchOperation("CUSTOMER_DETAILS_RFC?PERNR='" + this.Perner +
					"'&$format=json",
					"GET");
				var batchOperationR2 = this.oDataModel.createBatchOperation("TRV_HDRSet(ZZ_PERNR='" + this.Perner + "',ZZ_DEP_REQ='" +
					this.reqNo + "',ZZ_VERSION='',ZZ_TRV_TYP='" + "BUSR" +
					"')?$expand=TRV_HDRtoTRV_COST_ASGN,TRV_HDRtoTRV_travel_Data,TRV_HDRtoTRV_ACCOM,TRV_HDRtoTRV_ADVANCE,DEP_VISA_PLAN,ZE2E_REQ_STATUSSet",
					"GET");

				var batchOperationR3 = this.oDataModel.createBatchOperation("DmsDocsSet?$filter=DepReq+eq+'" + this.reqNo +
					"'+and+EmpNo+eq+'" + this.Perner + "'", "GET");
				var aBatch = [];
				if (this.aData.isRead === true) {
					aBatch.push(batchOperationR1, batchOperationR2, batchOperationR3, batchOperation3, batchOperation23);
				} else {
					aBatch.push(batchOperationR1, batchOperationR2, batchOperation0, batchOperation1, batchOperation3,
						batchOperation5, batchOperation8, batchOperation13, batchOperation18, batchOperation19,
						batchOperation20, batchOperation21, batchOperation22, batchOperationR3, batchOperation23);
				}

				this.oDataModel.addBatchReadOperations(aBatch);
				this.oDataModel.submitBatch(function (oResult) {
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setSizeLimit(100000);
					var oData = oResult.__batchResponses[1].data;
					if (that.aData.isUpdate === true || that.dateChange === true) {
						// visa Type, insurance type, meal type, travel type
						that.bindTravelData(oData, oResult.__batchResponses[2].data, oResult.__batchResponses[3].data, oResult.__batchResponses[
							4].data, oResult.__batchResponses[5].data, oResult.__batchResponses[0].data);
					}
					if (that.aData.isRead === true) {
						oData.Meal = oResult.__batchResponses[3].data;
					}
					that.bindingDeepEntity(oData);
					if (oData.ZZ_SIM_REQ_KEY === "" || oData.ZZ_SIM_REQ_KEY === "N" || oData.ZZ_SIM_REQ_KEY === "P") {
						oData.ZZ_SIM_REQ_KEY = "N";
					} else {
						oData.ZZ_SIM_REQ_KEY = "Y";
					}
					// Control the screen data
					oData.view = {
						"costLength": oData.TRV_HDRtoTRV_COST_ASGN.results.length,
						"detailLength": that.getTravelDetailLength(oData),
						"accommodationLength": oData.TRV_HDRtoTRV_ACCOM.results.length,
						//	"selectedTab": screenData.ZZ_REQ_TYP === "HOME" || screenData.ZZ_REQ_TYP === "EMER" ? 2 : 0,
						"isTravelRequest": true,
						"visaAvailability": oData.ZZ_SMODID === "INTL",
						"cargoVis": false
					};
					//"warning": oResult.__batchResponses[8].data.GetConstant.VALUE,

					oData.view.international = (oData.ZZ_SMODID === "INTL" && (oData.ZZ_TRV_TYP === "BUSR"));
					oData.view.enableConfirm = oData.ZZ_STATUS.substring(2, 5) === "000" || oData.ZZ_STATUS.substring(2, 5) === "008" || that.aData
						.isRead;
					oData.view.confirm = oData.view.enableConfirm;
					if (oData.ZZ_STATUS === "BB000") {
						oData.view.confirm = false;
					}
					//	that.checkfund(oData);
					// Convert advance from object to array
					try {
						var PersonalTrip = oResult.__batchResponses[14].data;
					} catch (err) {
						PersonalTrip = oResult.__batchResponses[4].data;
					}
					if (PersonalTrip.PersFlag === "X") {
						oData.PersFlag = "X";
						oData.Personal_SDate = PersonalTrip.SDate;
						oData.Personal_EDate = PersonalTrip.EDate;
					} else {
						oData.PersFlag = "";
						oData.Personal_SDate = "";
						oData.Personal_EDate = "";
					}
					that.convertAdvance(oData);
					if (that.aData.isRead === true) {
						that.initialDataSetup(oData);
						oModel.setData(oData);
						that.getView().setModel(oModel, "detail");
						that.TemplateForTable();
						that.nonedit_Elements();
						that.getView().getModel("detail").getData().editable = false;
					} else if (that.aData.isUpdate === true || that.dateChange === true) {

						oData.MCR = oResult.__batchResponses[9].data.results;
						oData.CurrencyItems = oResult.__batchResponses[10].data.results;
						//oModel.setSizeLimit(oData.CurrencyItems.length);
						oModel.setSizeLimit(100000);
						oData.DependentItems = oResult.__batchResponses[11].data.results;
						oData.TransportItems = oResult.__batchResponses[12].data.results;
						oData.CountryList = that.aData.country;
						that.initialDataSetup(oData);
						oModel.setData(oData);
						that.getView().setModel(oModel, "detail");
						that.TemplateForTable();
						that.edit_Elements();
						sap.ui.getCore().getModel("global").setProperty("/VKM_TR", oResult.__batchResponses[7].data.GetConstant.VALUE);

						that.getView().getModel("products").getData().editable = true;
					}
					try {
						oData.view.enabled = sap.ui.getCore().getModel("profile").getData().currentRole === "EMP" && (oData.ZZ_TRV_TYP === "BUSR") &&
							(oData.ZZ_STATUS.substring(2, 5) === "000" || oData.ZZ_STATUS.substring(
								2, 5) === "008" || that.aData.isRead || that.aData.isCreate);
						oData.view.enableAddDetail = sap.ui.getCore().getModel("profile").getData().currentRole === "EMP" && (oData.ZZ_STATUS.substring(
							2, 5) === "000" || oData.ZZ_STATUS.substring(2, 5) === "008" || that.aData.isRead || that.aData.isCreate);
						oData.view.enabledCountry = sap.ui.getCore().getModel("profile").getData().currentRole === "EMP" && (oData.ZZ_TRV_TYP ===
							"SECO" &&
							(oData.ZZ_STATUS.substring(2, 5) === "000" || oData.ZZ_STATUS.substring(2, 5) === "008" || that.aData.isRead || that.aData
								.isCreate)
						);
					} catch (exp) { // Request is save or open as read only
						oData.view.enabled = sap.ui.getCore().getModel("profile").getData().currentRole === "EMP" && (oData.ZZ_STATUS.substring(2, 5) ===
							"000" || oData.ZZ_STATUS.substring(2, 5) === "008");
						oData.view.enableAddDetail = sap.ui.getCore().getModel("profile").getData().currentRole === "EMP" && (oData.ZZ_STATUS ===
							"FF001" || oData.ZZ_STATUS.substring(2, 5) === "000" || oData.ZZ_STATUS.substring(2, 5) === "008" ? true : oData.view.enabled
						);
						oData.view.enabledCountry = sap.ui.getCore().getModel("profile").getData().currentRole === "EMP" && ((screenData.ZZ_REQ_TYP ===
							"BUSR") && oData.ZZ_STATUS.substring(2, 5) === "000" && oData.ZZ_VERSION.trim() === "");
					}
					if (com.bosch.hr.swift_trv.model.Common.checkDateInPast(oData.ZZ_DATV1) && (sap.ui.getCore().getModel("global").getData().isRead ||
							oData.ZZ_VERSION.trim() !== "1")) {
						oData.view.isFuture = false;
					} else {
						oData.view.isFuture = oData.view.enabled;
					}
					// Set value for insurance
					if (oData.ZZ_TRV_TYP === "BUSR" && oData.ZZ_SMODID === "INTL") {
						oData.view.enableInsurance = false;
						oData.ZZ_ZINSUR = "B";
					} else {
						oData.view.enableInsurance = oData.view.isFuture;
					}
					//	that.prepareDataforExistingRequest(oData);
					oData.ZZ_SMODID = (oData.ZZ_FMCNTRY === oData.ZZ_LAND1) || (oData.ZZ_FMCNTRY === "IN" && oData.ZZ_LAND1 === "NP") || (oData.ZZ_FMCNTRY ===
						"NP" && oData.ZZ_LAND1 === "IN") ? "DOME" : "INTL";
					oData.ZZ_TRV_TYP = "BUSR";
					var backup = that.copyFields(oData, backup);
					if (that.aData.isRead === true) {

						if (oData.DEP_VISA_PLAN) {
							oData.view.visaExist = 'X';
							/*	oData.selfVisa = oData.DEP_VISA_PLAN;*/
							sap.ui.getCore().getModel("products").getData().ZZ_MULT_ENTRY = false;
							sap.ui.getCore().getModel("products").getData().ZZ_VISA_SDATE = oData.DEP_VISA_PLAN.ZZ_VISA_SDATE;
							sap.ui.getCore().getModel("products").getData().ZZ_VISA_EDATE = oData.DEP_VISA_PLAN.ZZ_VISA_EDATE;
							sap.ui.getCore().getModel("products").getData().ZZ_VISA_NO = oData.DEP_VISA_PLAN.ZZ_VISA_NO;
							sap.ui.getCore().getModel("products").getData().ZZ_VISA_PLAN = oData.DEP_VISA_PLAN.ZZ_VISA_PLAN;
							sap.ui.getCore().getModel("products").getData().ZZ_CURR_VISA_TYP = oData.DEP_VISA_PLAN.ZZ_CURR_VISA_TYP;
							for (var i = 0; i < oResult.__batchResponses[2].data.results.length; i++) {
								if (oResult.__batchResponses[2].data.results[i].FileName.substr(0, 22) === "CL_VISA_COPY_SELF_BUSR") {
									sap.ui.getCore().getModel("products").getData().href = oResult.__batchResponses[2].data.results[i].FileUrl;
									break;
								}
							}
							//	sap.ui.getCore().getModel("products").refresh();
						}
					} else if (that.aData.isUpdate === true || that.dateChange === true) {
						if (oData.DEP_VISA_PLAN) {
							oData.view.visaExist = 'X';
							oData.selfVisa = oData.DEP_VISA_PLAN;
							sap.ui.getCore().getModel("products").getData().ZZ_MULT_ENTRY = false;
							sap.ui.getCore().getModel("products").getData().ZZ_VISA_SDATE = oData.DEP_VISA_PLAN.ZZ_VISA_SDATE;
							sap.ui.getCore().getModel("products").getData().ZZ_VISA_EDATE = oData.DEP_VISA_PLAN.ZZ_VISA_EDATE;
							sap.ui.getCore().getModel("products").getData().ZZ_VISA_NO = oData.DEP_VISA_PLAN.ZZ_VISA_NO;
							sap.ui.getCore().getModel("products").getData().ZZ_VISA_PLAN = oData.DEP_VISA_PLAN.ZZ_VISA_PLAN;
							sap.ui.getCore().getModel("products").getData().ZZ_CURR_VISA_TYP = oData.DEP_VISA_PLAN.ZZ_CURR_VISA_TYP;
							for (i = 0; i < oResult.__batchResponses[13].data.results.length; i++) {
								if (oResult.__batchResponses[13].data.results[i].FileName.substr(0, 22) === "CL_VISA_COPY_SELF_BUSR") {
									oData.selfVisa.href = oResult.__batchResponses[13].data.results[i].FileUrl;
									sap.ui.getCore().getModel("products").getData().href = oResult.__batchResponses[13].data.results[i].FileUrl;
									break;
								}
							}
							//	sap.ui.getCore().getModel("products").refresh();
						}
					}
					sap.ui.getCore().getModel("products").refresh();
					oData.ZZ_TRV_CAT = oData.ZZ_REQ_TYP;
					oData.CountryList = that.aData.country;
					oData.subtype = sap.ui.getCore().getModel("global").getData().subtype;
					oModel.setData(oData);
					that.getView().setModel(oModel, "detail");
					that.getView().getModel("detail").refresh();
					that.getView().getModel("products").refresh();
					sap.ui.core.BusyIndicator.hide();
					that.getView().byId("ObjectPageLayout").setSelectedSection("idGeneralTab");
				}, function (oError) {
					MessageBox.error("Sorry for this inconvenience. Please contact support team");
				});
			}
		},
		// Get travel detail length
		getTravelDetailLength: function (oData) {
			var iLen = 0;
			for (var i = 0; i < oData.TRV_HDRtoTRV_travel_Data.results.length; i++) {
				if (oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_TRVCAT === oData.ZZ_TRV_TYP) {
					iLen++;
				}
			}
			return iLen;
		},
		initialDataSetup: function (oData, check) {
			/////////////######### Initial setup for Cost Assignent Table ################////////////////
			var DataItem = {};
			if (oData.TRV_HDRtoTRV_COST_ASGN.results.length === 0) {
				DataItem = {
					"ZZ_PERCENT": "100",
					"ZZ_GEBER": "",
					"ZZ_FISTL": "",
					"ZZ_FIPOS": "",
					"ZZ_KOSTL": "",
					"ZZ_FIPEX": ""
				};
				oData.TRV_HDRtoTRV_COST_ASGN.results.push(DataItem);
			}
			/////////////######### Initial setup for Travel Details Table ################////////////////
			if (oData.TRV_HDRtoTRV_travel_Data.results.length === 0) {
				var oFirstItem = {
					ZZ_ZSLFDPD: "00",
					ZZ_ZFRPLACE: oData.ZZ_FMLOC,
					ZZ_ZTOPLACE: oData.ZZ_LOCATION_END,
					ZZ_BEGDA: oData.ZZ_DATV1,
					ZZ_BEGDA_VALUE: new Date(oData.ZZ_DATV1.substr(0, 4), oData.ZZ_DATV1.substr(4, 2) - 1, oData.ZZ_DATV1.substr(6, 2)),
					ZZ_TRVCAT: oData.ZZ_TRV_TYP,
					ZZ_ACTIVE: "X"
				};
				var oEndItem = {
					ZZ_ZSLFDPD: "00",
					ZZ_ZFRPLACE: oData.ZZ_LOCATION_END,
					ZZ_ZTOPLACE: oData.ZZ_FMLOC,
					ZZ_BEGDA: oData.ZZ_DATB1,
					ZZ_BEGDA_VALUE: new Date(oData.ZZ_DATB1.substr(0, 4), oData.ZZ_DATB1.substr(4, 2) - 1, oData.ZZ_DATB1.substr(6, 2)),
					ZZ_TRVCAT: oData.ZZ_TRV_TYP,
					ZZ_ACTIVE: "X"
				};
				oData.TRV_HDRtoTRV_travel_Data.results.push(oFirstItem);
				oData.TRV_HDRtoTRV_travel_Data.results.push(oEndItem);
			}

			/////////////######### Initial setup for Accomdation Table ################////////////////
			if (oData.TRV_HDRtoTRV_ACCOM.results.length === 0) {
				var AccItem = {
					ZZ_ZPLACE: "-",
					ZZ_BEGDA: "",
					ZZ_ENDDA: "",
					ZZ_CONTACT: "",
					ZZ_PERNR: this.Perner,
					ZZ_REINR: this.reqNo
				};
				oData.TRV_HDRtoTRV_ACCOM.results.push(AccItem);
			}

			if (check !== undefined) {
				var acc = oData.TRV_HDRtoTRV_ACCOM.results;
				if (acc.length === 1 && acc[0].ZZ_BEGDA === "" && acc[0].ZZ_ENDDA === "" && acc[0].ZZ_CONTACT === "") {
					this.getView().getModel("detail").getData().TRV_HDRtoTRV_ACCOM.results = [];
					var obj = {
						"ZZ_PERNR": this.Perner,
						"ZZ_REINR": this.reqNo
					};
					this.getView().getModel("detail").getData().TRV_HDRtoTRV_ACCOM.results.push(obj);
					this.getView().getModel("detail").refresh();
				}
			}
		},
		// Convert advance from object to array
		convertAdvance: function (oData) {
			// Convert advance from object to array
			if (oData.TRV_HDRtoTRV_ADVANCE.results.length !== 0 && oData.TRV_HDRtoTRV_ADVANCE !== undefined) {
				oData.advance = [];
				if (oData.TRV_HDRtoTRV_ADVANCE.results.length === 1) {
					var line_1 = {
						currency_key: oData.TRV_HDRtoTRV_ADVANCE.results[0].ZZ_CUR1,
						boarding: parseInt(oData.TRV_HDRtoTRV_ADVANCE.results[0].ZZ_BODVL1, 0),
						lodging: parseInt(oData.TRV_HDRtoTRV_ADVANCE.results[0].ZZ_LODVL1, 0),
						surface: parseInt(oData.TRV_HDRtoTRV_ADVANCE.results[0].ZZ_SRTVL1, 0),
						others: parseInt(oData.TRV_HDRtoTRV_ADVANCE.results[0].ZZ_OTHVL1, 0)
					};
					line_1.total = parseFloat(line_1.boarding) + parseFloat(line_1.lodging) + parseFloat(line_1.surface) + parseFloat(line_1.others);
					oData.advance.push(line_1);
				}
				if (parseInt(oData.TRV_HDRtoTRV_ADVANCE.results[0].ZZ_BODVL2, 0) !== 0 && parseInt(oData.TRV_HDRtoTRV_ADVANCE.results[0].ZZ_LODVL2,
						0) !== 0) {
					var line_2 = {
						currency_key: oData.TRV_HDRtoTRV_ADVANCE.results[0].ZZ_CUR2,
						boarding: parseInt(oData.TRV_HDRtoTRV_ADVANCE.results[0].ZZ_BODVL2, 0),
						lodging: parseInt(oData.TRV_HDRtoTRV_ADVANCE.results[0].ZZ_LODVL2, 0),
						surface: parseInt(oData.TRV_HDRtoTRV_ADVANCE.results[0].ZZ_SRTVL2, 0),
						others: parseInt(oData.TRV_HDRtoTRV_ADVANCE.results[0].ZZ_OTHVL2, 0)
					};
					line_2.total = parseFloat(line_2.boarding) + parseFloat(line_2.lodging) + parseFloat(line_2.surface) + parseFloat(line_2.others);
					oData.advance.push(line_2);
				}
				if (parseInt(oData.TRV_HDRtoTRV_ADVANCE.results[0].ZZ_BODVL3, 0) !== 0 && parseInt(oData.TRV_HDRtoTRV_ADVANCE.results[0].ZZ_LODVL3,
						0) !== 0) {

					var line_3 = {
						currency_key: oData.TRV_HDRtoTRV_ADVANCE.results[0].ZZ_CUR3,
						boarding: parseInt(oData.TRV_HDRtoTRV_ADVANCE.results[0].ZZ_BODVL3, 0),
						lodging: parseInt(oData.TRV_HDRtoTRV_ADVANCE.results[0].ZZ_LODVL3, 0),
						surface: parseInt(oData.TRV_HDRtoTRV_ADVANCE.results[0].ZZ_SRTVL3, 0),
						others: parseInt(oData.TRV_HDRtoTRV_ADVANCE.results[0].ZZ_OTHVL3, 0)
					};
					line_3.total = parseFloat(line_3.boarding) + parseFloat(line_3.lodging) + parseFloat(line_3.surface) + parseFloat(line_3.others);
					oData.advance.push(line_3);
				}
			} else {
				if (oData.ZZ_SMODID === "DOME") {
					var key = "INR";
				} else {
					key = "";
				}
				line_1 = {
					currency_key: key,
					boarding: 0,
					lodging: 0,
					surface: 0,
					others: 0,
					total: 0
				};
				oData.advance = [line_1];
			}
		},
		bindingDeepEntity: function (oData) {
			if (oData.TRV_HDRtoTRV_COST_ASGN === undefined) {
				oData.TRV_HDRtoTRV_COST_ASGN = {};
				oData.TRV_HDRtoTRV_COST_ASGN.results = new Array();
			}
			if (oData.TRV_HDRtoTRV_travel_Data === undefined) {
				oData.TRV_HDRtoTRV_travel_Data = {};
				oData.TRV_HDRtoTRV_travel_Data.results = new Array();
			}
			if (oData.TRV_HDRtoTRV_ACCOM === undefined) {
				oData.TRV_HDRtoTRV_ACCOM = {};
				oData.TRV_HDRtoTRV_ACCOM.results = new Array();
			}
			if (oData.TRV_HDRtoTRV_ADVANCE === undefined) {
				oData.TRV_HDRtoTRV_ADVANCE = {};
				oData.TRV_HDRtoTRV_ADVANCE.results = new Array();
			}
		},
		////###########################  Binding travel data ///################################
		bindTravelData: function (oData, sVisaCategory, sInsurance, sMeal, sTravelType, sCustomer) {
			try {
				// Dropdown list visa category
				oData.visaCategory = sVisaCategory.results;
				// Dropdown insurance
				oData.insurance = sInsurance.results;
				// Dropdown Meal
				oData.meal = sMeal.results;
				// Dropdown list for travel type
				oData.travelType = sTravelType.results;
				// Dropdown list for customer
				oData.customer = sCustomer.results;
				if (oData.customer.length === 0) {
					var obj = [{
						"LAND1": "US",
						"NAME1": "#Akustica Inc.",
						"ORT01": "Pittsburgh",
						"PSTLZ": "15222"
					}, {
						"LAND1": "DE",
						"NAME1": "#Bosch Engineering GmbH",
						"ORT01": "Abstatt",
						"PSTLZ": "74232"
					}];
					oData.customer = obj;
				}
			} catch (exc) {

			}
		},
		// Assign visa category
		assignVisaCategory: function (sTravelCategory, sFromCountry, sToCountry) {
			if (sFromCountry === sToCountry) {
				return "1";
			} else if (sTravelCategory === "SECO") {
				return "5";
			}
			if (sTravelCategory === "WRKP" || sTravelCategory === "TRFR") {
				return "3";
			}
			if (sTravelCategory === "TRNG") {
				return "4";
			}
			return "2";
		},
		// Mapping fields
		copyFields: function (oSource, oTarget) {
			oTarget = {};
			oTarget.ZZ_DATB1 = oSource.ZZ_DATB1;
			oTarget.ZZ_DATV1 = oSource.ZZ_DATV1;
			oTarget.ZZ_DEP_REQ = oSource.ZZ_DEP_REQ;
			oTarget.ZZ_KUNDE = oSource.ZZ_KUNDE;
			oTarget.ZZ_CUST_NAME = oSource.ZZ_CUST_NAME;
			oTarget.ZZ_LAND1 = oSource.ZZ_LAND1;
			oTarget.ZZ_LOCATION_END = oSource.ZZ_LOCATION_END;
			oTarget.ZZ_FMLOC = oSource.ZZ_FMLOC;
			oTarget.ZZ_FMCNTRY = oSource.ZZ_FMCNTRY;
			oTarget.ZZ_PERNR = oSource.ZZ_PERNR;
			oTarget.ZZ_REINR = oSource.ZZ_REINR;
			oTarget.ZZ_UHRB1 = oSource.ZZ_UHRB1;
			oTarget.ZZ_UHRV1 = oSource.ZZ_UHRV1;
			oTarget.ZZ_ZCATG = oSource.ZZ_ZCATG;
			oTarget.ZZ_ZDURN = oSource.ZZ_ZDURN;
			oTarget.ZZ_ZINSUR = oSource.ZZ_ZINSUR;
			oTarget.ZZ_ZMEAL = oSource.ZZ_ZMEAL;
			oTarget.ZZ_ZMEAL = oSource.ZZ_ZMEAL;
			oTarget.ZZ_ZPURPOSE = oSource.ZZ_ZPURPOSE;
			oTarget.TRV_HDRtoTRV_COST_ASGN = {};
			oTarget.TRV_HDRtoTRV_travel_Data = {};
			oTarget.TRV_HDRtoTRV_ACCOM = {};
			oTarget.advance = {};
			oTarget.TRV_HDRtoTRV_COST_ASGN.results = $.extend(true, [], oSource.TRV_HDRtoTRV_COST_ASGN.results);
			oTarget.TRV_HDRtoTRV_travel_Data.results = $.extend(true, [], oSource.TRV_HDRtoTRV_travel_Data.results);
			oTarget.TRV_HDRtoTRV_ACCOM.results = $.extend(true, [], oSource.TRV_HDRtoTRV_ACCOM.results);
			oTarget.advance = $.extend(true, [], oSource.advance);
			return oTarget;
		},
		// Assign travel category
		assignTravelCategory: function (sLevel) {
			switch (sLevel) {
			case "52":
				return "C";
			case "53":
				return "C";
			case "54":
				return "D";
			case "55":
				return "D";
			case "56":
				return "D";
			default:
				if (sLevel <= "51") {
					return "B";
				} else if (sLevel >= "57") {
					return "E";
				}
				return "B";
			}
		},

		onPressCancel: function () {
			this.getView().getModel("products").getData().editable = false;
			this.getView().getModel("products").refresh();
			/*this.getView().byId("idTripEndDate").setEditable(false);*/
			var oObjectPage = this.getView().byId("ObjectPageLayout");
			oObjectPage.setShowFooter(false);
		},
		onSelectSimCard: function (evt) {

			if (evt.getSource().getSelectedItem().getText() === "Yes") {
				this.getView().getModel("detail").getData().ZZ_SIM_REQ_KEY = "Y";
			} else {
				this.getView().getModel("detail").getData().ZZ_SIM_REQ_KEY = "N";
			}
			this.getView().getModel("detail").refresh();
		},
		onSelectVisaAvailability: function (evt) {
			if (evt.getSource().getSelectedKey() === "X") {
				this.getView().getModel("products").getData().visaItemsVisible = true;
				this.onPressVisaDetails();
			} else {
				this.getView().getModel("products").getData().visaItemsVisible = false;
			}
			this.getView().getModel("products").refresh();
		},
		onEditToggleButtonPress: function () {
			var oObjectPage = this.getView().byId("ObjectPageLayout"),
				bCurrentShowFooterState = oObjectPage.getShowFooter();
			oObjectPage.setShowFooter(!bCurrentShowFooterState);
			if (!bCurrentShowFooterState === true) {
				this.getView().getModel("products").getData().editable = true;
				this.getView().getModel("products").refresh();
				sap.ui.getCore().getModel("products").getData().butonVisible = false;
				sap.ui.getCore().getModel('products').refresh();
				this.reqNo = this.getView().getModel("detail").getData().ZZ_DEP_REQ;
				sap.ui.getCore().getModel("global").getData().SelectedReqNo = this.reqNo;
				this.aData.isUpdate = true;
				this.aData.isRead = false;
				this.aData.isCreate = false;
				this._onProductMatched();
			} else {
				this.getView().getModel("products").getData().editable = false;
				this.getView().getModel("products").refresh();
				sap.ui.getCore().getModel('products').refresh();
				this.aData.isUpdate = false;
				this.aData.isRead = true;
				this.aData.isCreate = false;
				this.nonedit_Elements();
			}
		},
		destroyUIElements: function () {
			try {
				/*sap.ui.getCore().byId("UploadVisaSelf").destroy();*/
				sap.ui.getCore().byId("idSimDataRequired").destroy();
			} catch (err) {
				sap.ui.getCore().byId("UploadVisaSelf");
			}
		},
		///////######################## Handle Full Screen,  Exit Screen, Close #################////////////
		handleFullScreen: function () {
			this.FullScreen = true;
			this.destroyUIElements();
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.oRouter.navTo("detail", {
				layout: sNextLayout,
				product: this._product,
				reqNo: this.reqNo /// need to check
			});
		},
		handleExitFullScreen: function () {
			this.MinScreen = true;
			this.destroyUIElements();
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
			this.oRouter.navTo("detail", {
				layout: sNextLayout,
				product: this._product,
				reqNo: this.reqNo /// need to check
			});
		},
		handleClose: function () {
			var that = this;
			var globalData = sap.ui.getCore().getModel("global").getData();
			if (globalData.isRead !== true) {
				MessageBox.information("Any unsaved data will be lost, do you want to continue ?", {
					actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
					emphasizedAction: MessageBox.Action.OK,
					onClose: function (sAction) {
						if (sAction === "OK") {
							that.CloseAllfunctions();
						}
					}
				});
			} else {
				that.CloseAllfunctions();
			}
		},
		CloseAllfunctions: function () {
			var that = this;
			that.nonedit_Elements();
			that.MinScreen = false;
			that.FullScreen = false;
			that.aData.isUpdate = false;
			that.aData.isCreate = false;
			that.aData.isRead = true;
			that.dateChange = false;
			that.EnableTravelDetail = false;
			that.advanceCall = false;
			that.bCodeServiceCall = false;
			that.bCenterServiceCall = false;
			that.bFundServiceCall = false;
			that.bWBSServiceCall = false;
			that.bBudgetCenterServiceCall = false;
			sap.ui.getCore().getModel("global").getData().isExisting = false;
			that.getView().getModel("detail").getData().dateChange = true;
			that.getView().getModel("detail").refresh();
			//	sap.ui.getCore().getModel("products").getData().busy = false;
			that.getView().getModel("products").getData().editable = false;
			sap.ui.getCore().getModel("products").getData().butonVisible = true;
			sap.ui.getCore().getModel("products").getData().dateChange = false;
			that.getView().getModel("products").refresh();
			sap.ui.getCore().getModel('products').refresh();
			setTimeout(function () {
				var sNextLayout = that.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
				that.oRouter.navTo("master", {
					layout: sNextLayout
				});
			}, 1);
		},
		onExit: function () {
			this.masterRoute.detachPatternMatched(this._onProductMatched, this); //To remove
			this.detailRoute.detachPatternMatched(this._onProductMatched, this); // To remove
			//	this.oRouter.getRoute("master").detachPatternMatched(this._onProductMatched, this);
			//	this.oRouter.getRoute("detail").detachPatternMatched(this._onProductMatched, this);
		},
		///////######################## Handle Full Screen,  Exit Screen, Close --- Close#################////////////
		onActionSheet: function (oEvent) {
			var oButton = oEvent.getSource();
			// create action sheet only once
			if (!this._actionSheet) {
				this._actionSheet = sap.ui.xmlfragment(
					"com.bosch.hr.swift_trv.fragments.common.ActionSheet",
					this
				);
				this.getView().addDependent(this._actionSheet);
			}
			this._actionSheet.openBy(oButton);
			this.ShowButtons();
		},
		ShowButtons: function () {
			var that = this;
			var oRequest = sap.ui.getCore().getModel("global").getData().CurrentRequest;
			var ModelData = this.getView().getModel("detail").getData();
			if (oRequest === undefined) {
				sap.m.MessageToast.show("Something Went Wrong. Try Again..!!");
				var sNextLayout = that.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
				that.oRouter.navTo("master", {
					layout: sNextLayout
				});
			}
			if (ModelData.ZZ_TRV_TYP === "BUSR" && ModelData.ZZ_STATUS === "FF001") {
				sap.ui.getCore().byId("idCancelButton").setEnabled(true);
				sap.ui.getCore().byId("idTicketingButton").setEnabled(true);
			} else {
				sap.ui.getCore().byId("idCancelButton").setEnabled(false);
				sap.ui.getCore().byId("idTicketingButton").setEnabled(false);
			}
			///////################# Change Date Link Enable ##############//////////////
			var curDate = new Date();
			var deputationStartDate = new Date(ModelData.ZZ_DATV1.substr(0, 4), ModelData.ZZ_DATV1.substr(4, 2) - 1, ModelData.ZZ_DATV1.substr(
				6, 2));
			var deputationEndDate = new Date(ModelData.ZZ_DATB1.substr(0, 4), ModelData.ZZ_DATB1.substr(4, 2) - 1, ModelData.ZZ_DATB1.substr(6,
				2));
			if (ModelData.ZZ_STATUS === "FF001") {
				//Similar to a new request. All fields should be enabled for editing. -Start date and end date are in future
				if ((deputationStartDate > curDate) && (deputationEndDate > curDate)) {
					sap.ui.getCore().byId("idChangeDateButton").setText("Change Request");
					sap.ui.getCore().byId("idChangeDateButton").setEnabled(true);
					this.EnableTravelDetail = false;
				} //End date, Travel details return line item should be enabled. - Start date in past and end date is in future
				else if ((deputationStartDate < curDate) && (deputationEndDate > curDate)) {
					sap.ui.getCore().byId("idChangeDateButton").setText("Change Date");
					sap.ui.getCore().byId("idChangeDateButton").setEnabled(true);
					this.EnableTravelDetail = true;
				}
				//Date change option should not be available. - Both dates are in past
				else if ((deputationStartDate < curDate) && (deputationEndDate < curDate)) {
					sap.ui.getCore().byId("idChangeDateButton").setEnabled(false);
				}
			} else if (ModelData.ZZ_STATUS.indexOf("008") !== -1) { /// for sent back by DH CC008,DD008,EE008,FF008,GG008
				sap.ui.getCore().byId("idChangeDateButton").setText("Change Request");
				sap.ui.getCore().byId("idChangeDateButton").setEnabled(false);
				this.EnableTravelDetail = false;
			} else {
				sap.ui.getCore().byId("idChangeDateButton").setEnabled(false);
			}
			///////################# Cancel request/Insurance/Ticketing Enable ##############//////////////
			if (ModelData.ZZ_SMODID === "INTL" && ModelData.ZZ_TRV_TYP === "BUSR" && ModelData.ZZ_STATUS === "FF001") {

				var iIndex = com.bosch.hr.swift_trv.model.Common.getArrayIndex(oRequest.ZE2E_REQ_STATUSSet.results, "ZZ_MODID", "INSR");
				var insrDateBeforeStarDate = com.bosch.hr.swift_trv.model.Common.checkInsrStartDate(ModelData.ZZ_DATV1);
				if (insrDateBeforeStarDate) {
					if (iIndex === -1) {
						sap.ui.getCore().byId("idInsuranceButton").setEnabled(true);
						sap.ui.getCore().byId("idInsuranceButton").setText("Create Insurance Request");
					} else {
						if (oRequest.ZE2E_REQ_STATUSSet.results[iIndex].ZZ_ACTION === '00' ||
							oRequest.ZE2E_REQ_STATUSSet.results[iIndex].ZZ_ACTION === '02') {
							sap.ui.getCore().byId("idInsuranceButton").setEnabled(true);
							sap.ui.getCore().byId("idInsuranceButton").setText("Change Insurance Request");
						} else {
							sap.ui.getCore().byId("idInsuranceButton").setEnabled(true);
							sap.ui.getCore().byId("idInsuranceButton").setText("Open Insurance Request");
						}
					}
				} else {
					//if after start date and request not sent back or saved
					if (iIndex !== -1 && oRequest.ZE2E_REQ_STATUSSet.results[iIndex].ZZ_ACTION !== '02' && oRequest.ZE2E_REQ_STATUSSet.results[iIndex]
						.ZZ_ACTION !==
						'00') {
						sap.ui.getCore().byId("idInsuranceButton").setEnabled(true);
						sap.ui.getCore().byId("idInsuranceButton").setText("Open Insurance Request");
					} else if (iIndex !== -1) {
						var past = com.bosch.hr.swift_trv.model.Common.checkDateInPast(ModelData.ZZ_DATV1);
						sap.ui.getCore().byId("idInsuranceButton").setEnabled(past);
						sap.ui.getCore().byId("idInsuranceButton").setText("Change Insurance Request");

						if (oRequest.ZE2E_REQ_STATUSSet.results[iIndex].ZZ_ACTION === "01" && oRequest.ZE2E_REQ_STATUSSet.results[iIndex].ZZ_NROLE ===
							"01") {
							sap.ui.getCore().byId("idInsuranceButton").setEnabled(false);
						}
					} else {
						sap.ui.getCore().byId("idInsuranceButton").setEnabled(false);
					}
				}
			} else {
				sap.ui.getCore().byId("idInsuranceButton").setEnabled(false);
			}
		},
		onUserInfo: function () {
			sap.m.MessageBox.information("Functinality not yet implemented..!!!");
		},
		////######################## onPressTicketing - Navigate to Ticket View ###############################/////////
		onTicketing: function (oEvent) {
			var that = this;
			this.nonedit_Elements(); /// before navigating setup everythng in read only mode in detail view
			var product = this._product,
				oNextUIState;
			sap.ui.core.BusyIndicator.show(-1);
			this.getOwnerComponent().getHelper().then(function (oHelper) {
				oNextUIState = oHelper.getNextUIState(1);
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Ticketing", {
					layout: "MidColumnFullScreen",
					product: product,
					reqNo: that.reqNo
				});
			}.bind(this));
		},
		////############################ onCreateInsurance - Navigate to Insurance View #######################/////////
		onCreateInsurance: function (oEvent) {
			var that = this;
			this.nonedit_Elements(); /// before navigating setup everythng in read only mode in detail view
			sap.ui.core.BusyIndicator.show(-1);
			if (oEvent.getSource().getText() === "Create Insurance Request") {
				sap.ui.getCore().getModel("global").getData().action = "00";
			} else if (oEvent.getSource().getText() === "Open Insurance Request") {
				sap.ui.getCore().getModel("global").getData().action = "02";
			}
			var product = this._product,
				oNextUIState;
			this.getOwnerComponent().getHelper().then(function (oHelper) {
				oNextUIState = oHelper.getNextUIState(1);
				that.oRouter.navTo("Insurance", {
					layout: "MidColumnFullScreen",
					product: product,
					reqNo: that.reqNo
				});
			}.bind(that));
		},
		///////////////######################## Onpress Date Change from Action Sheet #################////////////////
		onDateChange: function (oEvent) {
			//this.edit_Elements();
			var ButtonText = oEvent.getSource().getText();
			if (ButtonText === "Change Request") {
				this.aData.isUpdate = true;
				this.aData.isCreate = false;
				this.aData.isRead = false;
				this.dateChange = false;
				this.getView().byId("idSaveButton").setVisible(false);
				this._onProductMatched();
			} else {
				this.dateChange = true;
				/*var objPage = this.byId("idObjPage");
				objPage.removeAllBlocks();
				objPage.addBlock(sap.ui.xmlfragment("com.bosch.hr.swift_trv.fragments.general.ChangeForm", this));*/
				this.getView().getModel("detail").getData().dateChange = true;
				this.getView().getModel("detail").getData().editable = false;
				sap.ui.getCore().getModel("products").getData().dateChange = true;
				this.getView().getModel("detail").refresh();
				//this.getView().getModel("products").getData().busy = true;
				sap.ui.getCore().getModel("products").getData().butonVisible = false;
				this.getView().getModel("products").refresh();
				sap.ui.getCore().getModel("products").refresh();
				this.getView().byId("idSaveButton").setVisible(false);
				var oObjectPage = this.getView().byId("ObjectPageLayout");
				oObjectPage.setShowFooter(true);
				this.getView().byId("ObjectPageLayout").setSelectedSection("idGeneralTab");
				this._onProductMatched();
			}
		},
		//////////////######################### OnPress CancelRequest from Action Sheet################///////////////
		onCancelRequest: function () {
			var that = this;
			var promiseCancel = jQuery.Deferred();
			var oRequest = sap.ui.getCore().getModel("global").getData().CurrentRequest;
			var globaData = sap.ui.getCore().getModel("global").getData();
			globaData.requestCancel = this.reqNo;
			globaData.requestCancelModule = "BUSR";
			globaData.requestCancelTimeStamp = oRequest.ZZ_TIMESTAMP;
			sap.ui.getCore().getModel("global").setData(globaData);
			sap.ui.core.BusyIndicator.show(-1);
			this.oDataModel.read("TravelPlanCancelFlag?&TravelPlan='" + globaData.ZZ_TRV_REQ + "'&$format=json", null, null, true,
				function (oData, response) {
					var result = JSON.parse(response.body);
					that.data_flag = result.d.TravelPlanCancelFlag.TPCancelFlag;
					promiseCancel.resolve();
					sap.ui.core.BusyIndicator.hide(0);
				},
				function (error) {
					sap.m.MessageToast.show("Cancel request Failed..!");
				});

			$.when(promiseCancel).done(function () {
				if (that.data_flag === "X" && com.bosch.hr.swift_trv.model.Common.checkDateInPast(
						oRequest.ZZ_DEP_ENDATE)) {
					sap.m.MessageBox.show(
						"Please send an email to RBEI-Travel Settlement (CF/GSA2-IN).", {
							icon: sap.m.MessageBox.Icon.INFORMATION,
							title: "Information",
							actions: [sap.m.MessageBox.Action.CLOSE],
							onClose: function (oAction) {}
						}
					);
				} else {
					// End of Changes by UCD1KOR to display the information message when dates are in the past for cancel Request
					// display popup
					if (!that._oDialogCancelTask) {
						that._oDialogCancelTask = sap.ui.xmlfragment("com.bosch.hr.swift_trv.fragments.common.CloseRequest", that);
						that.getView().addDependent(that._oDialogCancelTask);
					}
					that._oDialogCancelTask.open();
				}
			});

		},
		/////////################### Sumit Cancel Request - Employee ########################////////////////
		onSubmitCancelRequest: function () {
			var that = this;
			var globaData = sap.ui.getCore().getModel("global").getData();
			// Validate comment field
			if (sap.ui.getCore().byId("txtCancelRequestComment").getValue().trim() === "" ||
				sap.ui.getCore().byId("txtCancelRequestComment").getValue() === null) {
				MessageBox.error("Please give some comments");
				return;
			}
			sap.ui.core.BusyIndicator.show(-1);
			var CancelUrl = "TravelCancel?ZZ_COMMENTS='" + sap.ui.getCore().byId("txtCancelRequestComment").getValue() +
				"'&ZZ_MGR_PERNR='" + this.Perner +
				"'&ZZ_REINR='" + globaData.requestCancel +
				"'&ZZ_ROLE='" + "EMP" +
				"'&ZZ_TTYPE='" + globaData.requestCancelModule +
				"'&ZZ_TIMESTAMP='" + globaData.requestCancelTimeStamp + "'";

			this.oDataModel.read(CancelUrl, null, null, true,
				function (oData, response) {
					that._oDialogCancelTask.close();
					sap.m.MessageToast.show("Cancellation requested successfully!");
					sap.ui.core.BusyIndicator.hide(0);
					that.clearGlobalValues();
				},
				function (error) {
					that._oDialogCancelTask.close();
					sap.ui.core.BusyIndicator.hide(0);
					sap.m.MessageToast.show("Cancellation requested Failed..!");
				});

		},
		onCloseCancelPopUp: function () {
			this._oDialogCancelTask.close();
		},
		/////#################### MCR Customer Details Events ############################//////////////
		onMCRTaskDetails: function (oEvent) {
			var that = this;
			if (!that._oDialogMCRTask) {
				that._oDialogMCRTask = sap.ui.xmlfragment("com.bosch.hr.swift_trv.fragments.general.MCR_TaskDetails", that);
				that.getView().addDependent(that._oDialogMCRTask);
			}
			that._oDialogMCRTask.open();
		},
		onMCRResourceDetails: function (oEvent) {
			var that = this;
			if (!that._oDialogMCRResource) {
				that._oDialogMCRResource = sap.ui.xmlfragment("com.bosch.hr.swift_trv.fragments.general.MCR_ResourceDetails", that);
				that.getView().addDependent(that._oDialogMCRResource);
			}
			that._oDialogMCRResource.open();
		},
		onCustomerCompanyName: function (oEvent) {
			var that = this;
			if (!that._oDialogCustomer) {
				that._oDialogCustomer = sap.ui.xmlfragment("com.bosch.hr.swift_trv.fragments.general.CustomerDetails", that);
				that.getView().addDependent(that._oDialogCustomer);
			}
			that._oDialogCustomer.open();
		},
		onPressSaveCustomerDetails: function (oEvent) {
			this.getView().getModel("detail").getProperty(this.selectedPath_WBS).ZZ_CCNAME = sap.ui.getCore().byId("idCoordName").getValue();
			this.getView().getModel("detail").getProperty(this.selectedPath_WBS).ZZ_CLENTY = sap.ui.getCore().byId("idCutomerCompanyName").getValue();
			this.getView().getModel("detail").getProperty(this.selectedPath_WBS).ZZ_PONO = sap.ui.getCore().byId("idPoNumber").getValue();
			this.getView().getModel("detail").getProperty(this.selectedPath_WBS).ZZ_CCDEPT = sap.ui.getCore().byId("idCoDept").getValue();
			this.getView().getModel("detail").getProperty(this.selectedPath_WBS).ZZ_CCOST = sap.ui.getCore().byId("idCustCost").getValue();
			this._oDialogAddInfo.close();
		},
		_handleValueHelpClose_Customer: function (oEvent) {
			var selectedItem = oEvent.getSource();
			this.getView().getModel("detail").getProperty(this.selectedPath_WBS).ZZ_CLENTY = selectedItem.getTitle();
			sap.ui.getCore().byId("idCutomerCompanyName").setValue(selectedItem.getTitle());
			this._oDialogCustomer.close();
			setTimeout(function () {
				$(".sapMListTblSubCntRow").css("cssText", "display: block !important;");
				$(".sapMListTbl .sapMLabel").css("cssText", "width: auto !important;");
				$(".sapMListTblSubCntSpr").css("cssText", "display: None !important;");
			}, 100);
		},
		_handleValueHelpClose_CustomerClose: function () {
			this._oDialogCustomer.close();
		},
		Close_MCRResource: function () {
			this._oDialogMCRResource.close();
		},
		Close_MCRTask: function () {
			this._oDialogMCRTask.close();
		},
		_handleValueHelpClose_MCRResource: function (oEvent) {
			var selectedItem = oEvent.getSource();
			this.getView().getModel("detail").getProperty(this.selectedPath_WBS).ZZ_RESOURCEID = selectedItem.getTitle();
			this.getView().getModel("detail").getProperty(this.selectedPath_WBS).ZZ_RESOURCETYP = selectedItem.getDescription();
			this.getView().getModel("detail").getProperty(this.selectedPath_WBS).ZZ_RESOUCESDESC = selectedItem.getInfo();
			sap.ui.getCore().byId("idResourceType").setValue(selectedItem.getInfo());
			sap.ui.getCore().byId("idResourceId").setValue(selectedItem.getTitle());
			setTimeout(function () {
				$(".sapMListTblSubCntRow").css("cssText", "display: block !important;");
				$(".sapMListTbl .sapMLabel").css("cssText", "width: auto !important;");
				$(".sapMListTblSubCntSpr").css("cssText", "display: None !important;");
			}, 100);
			this._oDialogMCRResource.close();
		},
		_handleValueHelpClose_MCRTask: function (oEvent) {
			var selectedItem = oEvent.getSource();
			this.getView().getModel("detail").getProperty(this.selectedPath_WBS).ZZ_TASKID = selectedItem.getTitle();
			this.getView().getModel("detail").getProperty(this.selectedPath_WBS).ZZ_TASKDESC = selectedItem.getDescription();
			this._oDialogMCRTask.close();
			setTimeout(function () {
				$(".sapMListTblSubCntRow").css("cssText", "display: block !important;");
				$(".sapMListTbl .sapMLabel").css("cssText", "width: auto !important;");
				$(".sapMListTblSubCntSpr").css("cssText", "display: None !important;");
			}, 100);
			sap.ui.getCore().byId("idTaskInfo").setValue(selectedItem.getTitle());
		},
		///////#################### MCR Customer Details Events-End ############################//////////////
		////////##################### F4 Help - Close #####################////////////
		onFundCancel: function () {
			this._oDialogFund.close();
		},
		onBudCenterCancel: function () {
			this._oDialogBudget.close();
		},
		onWBSCancel: function () {
			this._oDialogWBS.close();
		},
		onAfterCloseF4Help: function () {
			try {
				var listWbs = sap.ui.getCore().byId("idListWBS");
				listWbs.getBinding("items").filter([], "Appliation");
				sap.ui.getCore().byId("idSearchWBS").setValue("");
			} catch (err) {}
			try {
				var listFund = sap.ui.getCore().byId("idList");
				listFund.getBinding("items").filter([], "Appliation");
				sap.ui.getCore().byId("idSearchFund").setValue("");
			} catch (err) {}
			try {
				var listBudCenter = sap.ui.getCore().byId("idListBudCenter");
				listBudCenter.getBinding("items").filter([], "Appliation");
				sap.ui.getCore().byId("idSearchBudgetCenter").setValue("");
			} catch (err) {}
			try {
				var listBudgetCode = sap.ui.getCore().byId("idListBudgetCode");
				listBudgetCode.getBinding("items").filter([], "Appliation");
				sap.ui.getCore().byId("idSearchBudgetCode").setValue("");
			} catch (err) {}
			try {
				var CostCenter = sap.ui.getCore().byId("idListCostCenter");
				CostCenter.getBinding("items").filter([], "Appliation");
				sap.ui.getCore().byId("idSearchCostCenter").setValue("");
			} catch (err) {}

		},
		onCostCenterCancel: function () {
			this._oDialogCost.close();
		},
		onBudgetCodeCancel: function () {
			this._oDialogBudgetCode.close();
		},
		////////##################### F4 Help - Close End#####################////////////
		_handleValueHelpClose_fund: function (evt) {
			var selectedItem = evt.getSource().getTitle();
			this.getView().getModel("detail").getProperty(this.selectedPath).ZZ_GEBER = selectedItem;
			/*	if (selectedItem === "F01") {
					this.getView().getModel("detail").getProperty(this.selectedPath).ZZ_FIPOS = "";
				}*/
			this._oDialogFund.close();
			if (selectedItem === "F03") {
				//this.getView().getModel("detail").getProperty(this.selectedPath).ZZ_KOSTL = "";
				setTimeout(function () {
					$(".sapMListTblSubCntRow").css("cssText", "display: block !important;");
					$(".sapMListTbl .sapMLabel").css("cssText", "width: auto !important;");
					$(".sapMListTblSubCntSpr").css("cssText", "display: None !important;");
					/*sap.ui.core.BusyIndicator.hide();*/
				}, 100);
			}

			this.getView().getModel("detail").getProperty(this.selectedPath).ZZ_FIPOS = "";
			this.getView().getModel("detail").getProperty(this.selectedPath).ZZ_FISTL = "";
			this.getView().getModel("detail").getProperty(this.selectedPath).ZZ_FIPOS = "";
			this.getView().getModel("detail").getProperty(this.selectedPath).ZZ_KOSTL = "";
			this.getView().getModel("detail").getProperty(this.selectedPath).ZZ_FIPEX = "";

			this.getView().getModel("detail").refresh();
		},
		CssModify: function () {
			setTimeout(function () {
				$(".sapMListTblSubCntRow").css("cssText", "display: block !important;");
				$(".sapMListTbl .sapMLabel").css("cssText", "width: auto !important;");
				$(".sapMListTblSubCntSpr").css("cssText", "display: None !important;");
				/*sap.ui.core.BusyIndicator.hide();*/
			}, 100);
		},
		_handleValueHelpClose_budget: function (evt) {

			var oSelectedItem = evt.getSource();
			this.getView().getModel("detail").getProperty(this.selectedPath_budget).ZZ_FISTL = oSelectedItem.getTitle();
			this.getView().getModel("detail").refresh();
			this._oDialogBudget.close();
		},
		_handleValueHelpClose_budgetCode: function (evt) {

			var oSelectedItem = evt.getSource();
			this.getView().getModel("detail").getProperty(this.selectedPath_BudgetCode).ZZ_FIPEX = oSelectedItem.getTitle();
			this.getView().getModel("detail").refresh();
			this._oDialogBudgetCode.close();
		},

		_handleValueHelpClose_wbs: function (evt) {
			var oSelectedItem = evt.getSource();
			this.getView().getModel("detail").getProperty(this.selectedPath_WBS).ZZ_FIPOS = oSelectedItem.getTitle();
			this.getView().getModel("detail").refresh();
			this._oDialogWBS.close();
			var lineItem = this.getView().getModel("detail").getProperty(this.selectedPath_WBS);
			if (lineItem.ZZ_GEBER === "F03") {
				this.getView().getModel("detail").getProperty(this.selectedPath_WBS).WBSDescription = oSelectedItem.getDescription();
				this.getView().byId("idAddInfoColumn").setVisible(true);
				this.conditionsCheckforAddInfo(this.selectedPath_WBS);
			}
		},
		_handleValueHelpClose_cost: function (evt) {

			var oSelectedItem = evt.getSource();
			this.getView().getModel("detail").getProperty(this.selectedPath_cost).ZZ_KOSTL = oSelectedItem.getTitle();
			this.getView().getModel("detail").refresh();
			this._oDialogCost.close();
		},
		//////######################## F4 Help Close-End ############################///////////////////////////
		/////######################### Add Records to the tables ####################//////////////////////////
		onAddCostAssignment: function () {
			this.RemoveALlSelections();
			var model = this.getView().getModel("detail").getData();
			model.TRV_HDRtoTRV_COST_ASGN.results.push({
				"ZZ_PERCENT": "",
				"ZZ_GEBER": "",
				"ZZ_FISTL": "",
				"ZZ_FIPOS": "",
				"ZZ_KOSTL": "",
				"ZZ_FIPEX": ""
			});
			this.getView().getModel("detail").refresh();
			this.CssModify();
		},
		onDeleteRow: function (oEvent) {
			var model = this.getView().getModel("detail").getData();
			if (oEvent.getSource().getParent().getParent().getId().indexOf("idCostAssigmenTable") !== -1) {
				var aTable = this.getView().byId("idCostAssigmenTable");
				var DataArray = model.TRV_HDRtoTRV_COST_ASGN.results;
				var check = model.TRV_HDRtoTRV_COST_ASGN.results.length - aTable.getSelectedItems().length;
				if (check === 0) {
					MessageBox.error("One Record is Mandatory in Cost Assignment");
					return;
				}

			} else if (oEvent.getSource().getParent().getParent().getId().indexOf("idTravelDetailTable") !== -1) {
				aTable = this.getView().byId("idTravelDetailTable");
				DataArray = model.TRV_HDRtoTRV_travel_Data.results;
			} else if (oEvent.getSource().getParent().getParent().getId().indexOf("idAccomdationTable") !== -1) {
				aTable = this.getView().byId("idAccomdationTable");
				DataArray = model.TRV_HDRtoTRV_ACCOM.results;
			} else if (oEvent.getSource().getParent().getParent().getId().indexOf("idAdvanceTable") !== -1) {
				aTable = this.getView().byId("idAdvanceTable");
				DataArray = model.advance;
			}
			var sItems = aTable.getSelectedItems();
			if (sItems.length === 0) {
				MessageBox.show(
					"Please select a row", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error",
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function (oAction) {}
					}
				);
			} else {
				for (var i = sItems.length - 1; i >= 0; i--) {
					var path = sItems[i].getBindingContextPath();
					var idx = parseInt(path.substring(path.lastIndexOf('/') + 1), 10);
					DataArray.splice(idx, 1);
					this.getView().getModel("detail").refresh();
					sap.m.MessageToast.show("Deleted Suessfully");
					this.RemoveALlSelections();
				}
			}
		},
		RemoveALlSelections: function () {
			this.CssModify();
			this.getView().getModel("products").getData().Costeditable = false;
			this.getView().getModel("products").getData().Traveleditable = false;
			this.getView().getModel("products").getData().AccomEditable = false;
			this.getView().getModel("products").getData().AdvEditable = false;
			this.getView().getModel("products").refresh();
			this.getView().byId("idCostAssigmenTable").removeSelections(true);
			this.getView().byId("idTravelDetailTable").removeSelections(true);
			this.getView().byId("idAccomdationTable").removeSelections(true);
			this.getView().byId("idAdvanceTable").removeSelections(true);
		},
		onAddTravelDetail: function () {
			this.RemoveALlSelections();
			var model = this.getView().getModel("detail").getData();
			model.TRV_HDRtoTRV_travel_Data.results.push({
				"ZZ_TRVCAT": "BUSR",
				"ZZ_ACTIVE": "X",
				"ZZ_ZSLFDPD": "",
				"ZZ_ZFRPLACE": "",
				"ZZ_ZTOPLACE": "",
				"ZZ_BEGDA": "",
				"ZZ_BEGUR": "",
				"ZZ_ENDDA": "",
				"ZZ_ENDUZ": "",
				"ZZ_ZMODE": ""
			});
			this.getView().getModel("detail").refresh();
			this.CssModify();
		},
		onAddAccomdation: function () {
			this.RemoveALlSelections();
			var model = this.getView().getModel("detail").getData();
			model.TRV_HDRtoTRV_ACCOM.results.push({
				"ZZ_ZPLACE": "",
				"ZZ_BEGDA": "",
				"ZZ_ENDDA": "",
				"ZZ_CONTACT": ""
			});
			this.getView().getModel("detail").refresh();
			this.CssModify();
		},
		onAddAdvance: function () {
			this.RemoveALlSelections();
			var model = this.getView().getModel("detail").getData();
			if (model.advance.length > 2) {
				sap.m.MessageToast.show("You can add 3 rows only");
			} else {
				model.advance.push({
					"currency_key": "",
					"boarding": "0",
					"lodging": "0",
					"others": "0",
					"total": "0"
				});
				this.getView().getModel("detail").refresh();
				this.CssModify();
			}
		},
		/////######################### Add Records to the tables End ####################//////////////////////////
		onSelectCostAssignemnt: function () {
			var table = this.getView().byId("idCostAssigmenTable").getSelectedItems();
			if (table.length >= 1) {
				this.getView().getModel("products").getData().Costeditable = true;
			} else {
				this.getView().getModel("products").getData().Costeditable = false;
			}
			this.getView().getModel("products").refresh();
		},
		onSelectTravelDetail: function () {
			var table = this.getView().byId("idTravelDetailTable").getSelectedItems();
			if (table.length >= 1) {
				this.getView().getModel("products").getData().Traveleditable = true;
			} else {
				this.getView().getModel("products").getData().Traveleditable = false;
			}
			this.getView().getModel("products").refresh();

		},
		onSelectAccom: function () {
			var table = this.getView().byId("idAccomdationTable").getSelectedItems();
			if (table.length >= 1) {
				this.getView().getModel("products").getData().AccomEditable = true;
			} else {
				this.getView().getModel("products").getData().AccomEditable = false;
			}
			this.getView().getModel("products").refresh();

		},
		onSelectAdv: function () {
			var table = this.getView().byId("idAdvanceTable").getSelectedItems();
			if (table.length >= 1) {
				this.getView().getModel("products").getData().AdvEditable = true;
			} else {
				this.getView().getModel("products").getData().AdvEditable = false;
			}
			this.getView().getModel("products").refresh();
		},

		_handleValueHelpSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("title", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},
		///////////////############################## F4 Help - Search ############################//////////////
		OnSearchFund: function () {
			//var sQuery = oEvent.getParameter("query");
			var sQuery = sap.ui.getCore().byId("idSearchFund").getValue();
			var Fund = new sap.ui.model.Filter("fincode", sap.ui.model.FilterOperator.Contains, sQuery);
			var Desc = new sap.ui.model.Filter("beschr", sap.ui.model.FilterOperator.Contains, sQuery);
			var filters = new sap.ui.model.Filter([Fund, Desc]);
			var listassign = sap.ui.getCore().byId("idList");
			listassign.getBinding("items").filter(filters, "Appliation");
		},
		OnSearchWBS: function () {
			//var sQuery = oEvent.getParameter("query");
			var sQuery = sap.ui.getCore().byId("idSearchWBS").getValue();
			var Title = new sap.ui.model.Filter("ZZ_POSKI", sap.ui.model.FilterOperator.Contains, sQuery);
			var Desc = new sap.ui.model.Filter("ZZ_POST1", sap.ui.model.FilterOperator.Contains, sQuery);
			var filters = new sap.ui.model.Filter([Title, Desc]);
			var listassign = sap.ui.getCore().byId("idListWBS");
			listassign.getBinding("items").filter(filters, "Appliation");
		},
		OnSearchBudgetCode: function () {
			//var sQuery = oEvent.getParameter("query");
			var sQuery = sap.ui.getCore().byId("idSearchBudgetCode").getValue();
			var Title = new sap.ui.model.Filter("FIPEX", sap.ui.model.FilterOperator.Contains, sQuery);
			var Desc = new sap.ui.model.Filter("ZZ_BUD_DESC", sap.ui.model.FilterOperator.Contains, sQuery);
			var filters = new sap.ui.model.Filter([Title, Desc]);
			var listassign = sap.ui.getCore().byId("idListBudgetCode");
			listassign.getBinding("items").filter(filters, "Appliation");
		},
		OnSearchBudgetCenter: function () {
			//var sQuery = oEvent.getParameter("query");
			var sQuery = sap.ui.getCore().byId("idSearchBudgetCenter").getValue();
			var Title = new sap.ui.model.Filter("ZzFundC", sap.ui.model.FilterOperator.Contains, sQuery);
			var Desc = new sap.ui.model.Filter("ZzFundDes", sap.ui.model.FilterOperator.Contains, sQuery);
			var filters = new sap.ui.model.Filter([Title, Desc]);
			var listassign = sap.ui.getCore().byId("idListBudCenter");
			listassign.getBinding("items").filter(filters, "Appliation");
		},
		OnSearchCostCenter: function () {
			//var sQuery = oEvent.getParameter("query");
			var sQuery = sap.ui.getCore().byId("idSearchCostCenter").getValue();
			var Title = new sap.ui.model.Filter("KOSTL", sap.ui.model.FilterOperator.Contains, sQuery);
			var Desc = new sap.ui.model.Filter("KTEXT", sap.ui.model.FilterOperator.Contains, sQuery);
			var filters = new sap.ui.model.Filter([Title, Desc]);
			var listassign = sap.ui.getCore().byId("idListCostCenter");
			listassign.getBinding("items").filter(filters, "Appliation");
		},
		///////////////############################## F4 Help - Search End############################//////////////
		////////######################### F4 Help - sorting  Start#############################/////////////////
		onSortFund: function (oEvent) {
			var selectedButton = oEvent.getSource().getText();
			var value = "";
			if (selectedButton === "Ascending") {
				value = "fincode";
				var oBinding = sap.ui.getCore().byId("idList").getBinding("items"),
					oSorter = new Sorter(value, false);
			} else {
				value = "fincode";
				oBinding = sap.ui.getCore().byId("idList").getBinding("items");
				oSorter = new Sorter(value, true);
			}
			oBinding.sort(oSorter);
		},
		onSortBudCenter: function (oEvent) {
			var selectedButton = oEvent.getSource().getText();
			var value = "";
			if (selectedButton === "Ascending") {
				value = "ZzFundC";
				var oBinding = sap.ui.getCore().byId("idListBudCenter").getBinding("items"),
					oSorter = new Sorter(value, false);
			} else {
				value = "ZzFundC";
				oBinding = sap.ui.getCore().byId("idListBudCenter").getBinding("items");
				oSorter = new Sorter(value, true);
			}
			oBinding.sort(oSorter);
		},
		onSortWBS: function (oEvent) {
			var selectedButton = oEvent.getSource().getText();
			var value = "";
			if (selectedButton === "Ascending") {
				value = "ZZ_POSKI";
				var oBinding = sap.ui.getCore().byId("idListWBS").getBinding("items"),
					oSorter = new Sorter(value, false);
			} else {
				value = "ZZ_POSKI";
				oBinding = sap.ui.getCore().byId("idListWBS").getBinding("items");
				oSorter = new Sorter(value, true);
			}
			oBinding.sort(oSorter);
		},
		onSortCostCenter: function (oEvent) {
			var selectedButton = oEvent.getSource().getText();
			var value = "";
			if (selectedButton === "Ascending") {
				value = "KOSTL";
				var oBinding = sap.ui.getCore().byId("idListCostCenter").getBinding("items"),
					oSorter = new Sorter(value, false);
			} else {
				value = "KOSTL";
				oBinding = sap.ui.getCore().byId("idListCostCenter").getBinding("items");
				oSorter = new Sorter(value, true);
			}
			oBinding.sort(oSorter);
		},
		onSortBudgetCode: function (oEvent) {
			var selectedButton = oEvent.getSource().getText();
			var value = "";
			if (selectedButton === "Ascending") {
				value = "FIPEX";
				var oBinding = sap.ui.getCore().byId("idListBudgetCode").getBinding("items"),
					oSorter = new Sorter(value, false);
			} else {
				value = "FIPEX";
				oBinding = sap.ui.getCore().byId("idListBudgetCode").getBinding("items");
				oSorter = new Sorter(value, true);
			}
			oBinding.sort(oSorter);
		},
		////////######################### F4 Help - sorting  End#############################/////////////////
		checkValidations: function () {
			var that = this;
			var aData = this.getView().getModel("detail").getData();
			var check = "validataion";
			this.initialDataSetup(aData, check);
			if (aData.ZZ_MODID === 'BUSR' || aData.ZZ_MODID === 'SECO') {
				sap.ui.core.BusyIndicator.show(1);
				var taxURL = "CheckNonPETaxExpSet(ZZ_MODID='" + aData.ZZ_MODID + "',ZZ_SMODID='" + aData.ZZ_SMODID +
					"',ZZ_PERNR='" +
					this.Perner +
					"',ZZ_ENDDATE='" + aData.ZZ_DATB1 +
					"',ZZ_STDATE='" + aData.ZZ_DATV1 +
					"',ZZ_CNTRY='" + aData.ZZ_LAND1 + "')";

				var totalDur;
				this.oDataModel.read(taxURL, null, null, false, jQuery.proxy(function (oData, response) {
					totalDur = oData.ZZ_DURATION;
					if (totalDur != "1-") {
						var total = 180;
						var remDur = parseInt(total - totalDur, 10);
						if (aData.ZZ_ZDURN > remDur) {
							//Error
							var text = "You have cumulative travel duration of  " + Math.abs(remDur) +
								" days. As per policy, maximum duration employee can travel on " +
								" Business Travels (including personal time)/Info Travel/Secondary travel for a " +
								" calendar year should not be more than " + total + "days." +
								" Please check and adjust the duration accordingly.";

							that.BusrSecoError = text;
							sap.ui.core.BusyIndicator.hide();
						}
					}
					sap.ui.core.BusyIndicator.hide();
				}, this), function (error) {
					sap.m.MessageBox.error("We are not able to Porcess your request.Try After some time");
					sap.ui.core.BusyIndicator.hide();
					return;
				});
			}
			if (that.BusrSecoError !== undefined) {
				MessageBox.error(that.BusrSecoError);
				this.Error = that.BusrSecoError;
				return;
			}
			else{
				this.Error = "";
			}
			/*Personal Trip Validations*/
			if (aData.PersFlag === "X" && (aData.Personal_SDate === "" || aData.Personal_EDate === "")) {
				this.Error = "Please enter Availing Personal Trip Start Date and End Date";
				MessageBox.error("Please enter Availing Personal Trip Start Date and End Date");
				return;
			}

			this.selfVisaExist = this.getView().getModel("detail").getData().view.visaExist;
			if (this.selfVisaExist === "X") {
				var ZZ_VISA_EDATE = sap.ui.getCore().getModel("products").getData().ZZ_VISA_EDATE;
				var ZZ_VISA_SDATE = sap.ui.getCore().getModel("products").getData().ZZ_VISA_SDATE;
				var ZZ_VISA_NO = sap.ui.getCore().getModel("products").getData().ZZ_VISA_NO;
				var HRef = sap.ui.getCore().getModel("products").getData().href;
				var UploadVisaSelf = sap.ui.getCore().byId("UploadVisaSelf");
				if (ZZ_VISA_EDATE === "" || ZZ_VISA_SDATE === "" || ZZ_VISA_NO === "" || ZZ_VISA_EDATE === undefined || ZZ_VISA_SDATE ===
					undefined || ZZ_VISA_NO === undefined || HRef === "") {
					this.Error = "Please enter required visa details..!";
					MessageBox.error("Please enter required visa details..!");
					return;
				}
				if (UploadVisaSelf === undefined) {
					this.Error = "Visa Details not updated. Please check visa details and submit again..!";
					MessageBox.error("Visa Details not updated. Please check visa details and submit again..!", {
						actions: [MessageBox.Action.OK, MessageBox.Action.CLOSE],
						onClose: function (sAction) {
							if (sAction === "OK") {
								that.onPressVisaDetails();
							}
						}
					});
					return;
				}
			}
			if (this.TravelDateError !== undefined) {
				this.Error = this.TravelDateError;
				MessageBox.error(this.TravelDateError);
				return;
			}
			if (this.PersonalError !== undefined) {
				this.Error = this.PersonalError;
				MessageBox.error(this.PersonalError);
			}
			var generalError = com.bosch.hr.swift_trv.model.Common.checkGeneral(aData);
			if (generalError !== "") {
				if (generalError === "Enter Purpose of Travel") {
					this.getView().getModel("detail").getData().view.ZZ_KUNDE_ERROR = "Error";
				} else if (generalError === "Please Select Travel To") {
					this.getView().getModel("detail").getData().view.ZZ_CATID_ERROR = "Error";
				} else if (generalError === "Please enter number in following format +91987654321 or 0987654321") {
					this.getView().getModel("detail").getData().view.ZZ_MOBILE_ERROR = "Error";
				} else if (generalError === "Please select the the option SIM card Required or not") {
					this.getView().getModel("detail").getData().view.ZZ_SIM_REQ__KEY_ERROR = "Error";
				}
				this.getView().getModel("detail").refresh();
				MessageBox.error(generalError);
				this.Error = generalError;
				return;
			} else {
				this.Error = "";
			}
			var CheckTravelError = com.bosch.hr.swift_trv.model.Common.checkTravelDetail(aData);
			if (CheckTravelError !== "") {
				MessageBox.error(CheckTravelError);
				this.Error = CheckTravelError;
				return;
			} else {
				this.Error = "";
			}
			var checkCostAssignmentError = com.bosch.hr.swift_trv.model.Common.checkCostAssignment(aData);
			if (checkCostAssignmentError !== "") {
				MessageBox.error(checkCostAssignmentError);
				this.Error = checkCostAssignmentError;
				return;
			} else {
				this.Error = "";
			}
			var checkAccomodationError = com.bosch.hr.swift_trv.model.Common.checkAccomodation(aData);
			if (checkAccomodationError !== "") {
				MessageBox.error(checkAccomodationError);
				this.Error = checkAccomodationError;
				return;
			} else {
				this.Error = "";
			}
		},
		onPersonalTripCreate: function (sData) {
			var postData = {};
			postData.TrvReq = sData.ZZ_REINR;
			postData.EmpNo = sData.ZZ_PERNR;
			postData.Version = "";
			postData.PersFlag = sData.PersFlag;
			postData.SDate = sData.Personal_SDate;
			postData.STime = "";
			postData.EDate = sData.Personal_EDate;
			postData.ETime = "";

			this.oDataModel.create("PersonalTripSet", postData, null, function (oData, response) {
				//sap.m.MessageToast.show("Personal Trip Details saved");			
			}, function (error) {
				sap.m.MessageToast.show("Failed to save Personal Trip details");
			}, true);

		},
		///////######################## Save Request Data ######################////////////////////
		onPressSave: function (sAction) {
			var that = this;
			if (sAction === "AA003") {
				var sStatus = "AA003";
			} else {
				sStatus = "AA000";
				this.checkValidations();
			}
			if (this.Error !== "") {
				return;
			}

			var aData = this.getView().getModel("detail").getData();
			this.selfVisaDetails = aData.selfVisa;
			this.selfVisaExist = this.getView().getModel("detail").getData().view.visaExist;

			sap.ui.core.BusyIndicator.show(10);
			// validate data
			var aSave = $.extend(false, {}, aData);
			delete aSave.PersFlag;
			delete aSave.Personal_SDate;
			delete aSave.Personal_EDate;
			delete aSave.PersonalError;
			delete aSave.minPDate;
			delete aSave.maxPDate;
			delete aSave.subtype;
			delete aSave.ZE2E_REQ_STATUSSet;
			delete aSave.NextApprvName;
			delete aSave.selfVisa;
			delete aSave.dateChange;
			delete aSave.StartDateEditable;
			delete aSave.editable;
			delete aSave.view.ZZ_SIM_REQ__KEY_ERROR;
			delete aSave.view.ZZ_CATID_ERROR;
			delete aSave.view.ZZ_KUNDE_ERROR;
			delete aSave.view.ZZ_CATID_ERROR;
			delete aSave.view;
			delete aSave.MCR;
			delete aSave.CostCenterF4Help;
			delete aSave.Fund_F4_Help;
			delete aSave.BudgetCenter;
			delete aSave.CurrencyItems;
			delete aSave.DependentItems;
			delete aSave.TransportItems;
			delete aSave.ZZ_NEXT_APPROVER;
			delete aSave.CountryList;
			delete aSave.BudgetCode;
			delete aSave.WBSF4Help;
			delete aSave.advance;
			delete aSave.country;
			delete aSave.insurance;
			delete aSave.meal;
			delete aSave.seat;
			delete aSave.travelType;
			delete aSave.customer;
			delete aSave.view;
			delete aSave.visaCategory;
			delete aSave.budgetCenter;
			delete aSave.budgetCost;
			delete aSave.fund;
			delete aSave.vkm;
			delete aSave.ZZ_VKM;
			delete aSave.ZZ_VKM_ERROR;
			delete aSave.ZZ_VKM_TOOLTIP;
			delete aSave.ZZ_CCNAME;
			delete aSave.ZZ_CCNAME_ERROR;
			delete aSave.ZZ_CCDEPT;
			delete aSave.ZZ_CCDEPT_ERROR;
			delete aSave.mode;
			delete aSave.currency;
			delete aSave.ZZ_TRV_CAT;
			delete aSave.old;
			delete aSave.DEP_VISA_PLAN;
			delete aSave.ZZ_BEGDA_VALUE;
			delete aSave.ZZ_ENDDA_VALUE;
			delete aSave.ZZ_BEGDA_ERROR;
			delete aSave.ZZ_ENDDA_ERROR;
			delete aSave.__metadata;
			delete aSave.mcrData;
			//DYE5kOR_MCR_NON_MCR changes
			aSave.ZZ_STATUS = sStatus;
			aSave.TRV_HDRtoTRV_travel_Data = $.extend(true, [], aData.TRV_HDRtoTRV_travel_Data.results);
			for (var i = 0; i < aSave.TRV_HDRtoTRV_travel_Data.length; i++) {
				delete aSave.TRV_HDRtoTRV_travel_Data[i].ZZ_BEGDA_ERROR;
				delete aSave.TRV_HDRtoTRV_travel_Data[i].ZZ_BEGUR_ERROR;
				delete aSave.TRV_HDRtoTRV_travel_Data[i].ZZ_ENDDA_ERROR;
				delete aSave.TRV_HDRtoTRV_travel_Data[i].ZZ_ENDUZ_ERROR;
				delete aSave.TRV_HDRtoTRV_travel_Data[i].ZZ_ZFRPLACE_ERROR;
				delete aSave.TRV_HDRtoTRV_travel_Data[i].ZZ_ZTOPLACE_ERROR;
				delete aSave.TRV_HDRtoTRV_travel_Data[i].ZZ_BEGDA_VALUE;
				delete aSave.TRV_HDRtoTRV_travel_Data[i].ZZ_ENDDA_VALUE;
				delete aSave.TRV_HDRtoTRV_travel_Data[i].ZZ_ZMODE_ERROR;
				delete aSave.TRV_HDRtoTRV_travel_Data[i].ZZ_ZSLFDPD_ERROR;
				delete aSave.TRV_HDRtoTRV_travel_Data[i].__metadata;
				delete aSave.TRV_HDRtoTRV_travel_Data[i].type;
			}
			aSave.TRV_HDRtoTRV_COST_ASGN = $.extend(true, [], aData.TRV_HDRtoTRV_COST_ASGN.results);
			for (i = 0; i < aSave.TRV_HDRtoTRV_COST_ASGN.length; i++) {
				aSave.TRV_HDRtoTRV_COST_ASGN[i].ZZ_PERCENT = parseFloat(aSave.TRV_HDRtoTRV_COST_ASGN[i].ZZ_PERCENT);
				delete aSave.TRV_HDRtoTRV_COST_ASGN[i].WBSDescription;
				delete aSave.TRV_HDRtoTRV_COST_ASGN[i].ZZ_PERCENT_ERROR;
				delete aSave.TRV_HDRtoTRV_COST_ASGN[i].ZZ_FISTL_ERROR;
				delete aSave.TRV_HDRtoTRV_COST_ASGN[i].ZZ_GEBER_ERROR;
				delete aSave.TRV_HDRtoTRV_COST_ASGN[i].ZZ_GEBER_TOOLTIP;
				delete aSave.TRV_HDRtoTRV_COST_ASGN[i].ZZ_VKM_ERROR;
				delete aSave.TRV_HDRtoTRV_COST_ASGN[i].ZZ_VKM_TOOLTIP;
				delete aSave.TRV_HDRtoTRV_COST_ASGN[i].ZZ_FIPEX_ERROR;
				delete aSave.TRV_HDRtoTRV_COST_ASGN[i].ZZ_FIPEX_TOOLTIP;
				delete aSave.TRV_HDRtoTRV_COST_ASGN[i].ZZ_FIPOS_ERROR;
				delete aSave.TRV_HDRtoTRV_COST_ASGN[i].ZZ_KOSTL_ERROR;
				delete aSave.TRV_HDRtoTRV_COST_ASGN[i].__metadata;
			}
			aSave.TRV_HDRtoTRV_ACCOM = $.extend(true, [], aData.TRV_HDRtoTRV_ACCOM.results);
			for (i = 0; i < aSave.TRV_HDRtoTRV_ACCOM.length; i++) {
				delete aSave.TRV_HDRtoTRV_ACCOM[i].ZZ_ZPLACE_ERROR;
				delete aSave.TRV_HDRtoTRV_ACCOM[i].ZZ_BEGDA_ERROR;
				delete aSave.TRV_HDRtoTRV_ACCOM[i].ZZ_ENDDA_ERROR;
				delete aSave.TRV_HDRtoTRV_ACCOM[i].ZZ_CONTACT_ERROR;
				delete aSave.TRV_HDRtoTRV_ACCOM[i].ZZ_BEGDA_VALUE;
				delete aSave.TRV_HDRtoTRV_ACCOM[i].ZZ_ENDDA_VALUE;
				delete aSave.TRV_HDRtoTRV_ACCOM[i].enabled;
				delete aSave.TRV_HDRtoTRV_ACCOM[i].__metadata;
			}
			// Convert advance from array to object
			aSave.TRV_HDRtoTRV_ADVANCE = new Array();
			var advance = {};
			advance.ZZ_CUR1 = aData.advance[0].currency_key.toString();
			advance.ZZ_BODVL1 = aData.advance[0].boarding.toString();
			advance.ZZ_LODVL1 = aData.advance[0].lodging.toString();
			advance.ZZ_SRTVL1 = aData.advance[0].surface.toString();
			advance.ZZ_OTHVL1 = aData.advance[0].others.toString();
			try {
				advance.ZZ_CUR2 = aData.advance[1].currency_key.toString();
				advance.ZZ_BODVL2 = aData.advance[1].boarding.toString();
				advance.ZZ_LODVL2 = aData.advance[1].lodging.toString();
				advance.ZZ_SRTVL2 = aData.advance[1].surface.toString();
				advance.ZZ_OTHVL2 = aData.advance[1].others.toString();
			} catch (err) {}
			try {
				advance.ZZ_CUR3 = aData.advance[2].currency_key.toString();
				advance.ZZ_BODVL3 = aData.advance[2].boarding.toString();
				advance.ZZ_LODVL3 = aData.advance[2].lodging.toString();
				advance.ZZ_SRTVL3 = aData.advance[2].surface.toString();
				advance.ZZ_OTHVL3 = aData.advance[2].others.toString();
			} catch (err) {}
			aSave.TRV_HDRtoTRV_ADVANCE.push(advance);
			//######### Validations on Advance ###########////
			if (aSave.ZZ_SMODID === "DOME") {
				var Adv_Validations = aSave.TRV_HDRtoTRV_ADVANCE[0];
				if (Adv_Validations.ZZ_CUR1 !== "INR") {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error("Please Select the Curreny value INR from Advance Table");
					return;
				}
			}

			aSave.ZZ_ZDURN = aSave.ZZ_ZDURN.toString();
			aSave.ZZ_SMODID = (aSave.ZZ_FMCNTRY ===
				aSave.ZZ_LAND1) || (aSave.ZZ_FMCNTRY === "IN" && aSave.ZZ_LAND1 === "NP") || (aSave.ZZ_FMCNTRY ===
				"NP" && aSave.ZZ_LAND1 === "IN") ? "DOME" : "INTL";
			// Giang CODE BEGIN
			if (aSave.ZZ_DEP_REQ === undefined) {
				aSave.ZZ_DEP_REQ = "";
			}
			/*Start-Change Family Return Dates*/
			aSave.ZZ_VREASON = sap.ui.getCore().getModel("global").getData().changeType;
			if (aSave.ZZ_VREASON === undefined) {
				aSave.ZZ_VREASON = "";
			}
			/*End-Change Family Return Dates*/

			this.oDataModel.create("TRV_HDRSet", aSave, {
				success: function (oData, response) {
					var sMsg = "";
					if (oData.ZZ_REINR === "0000000000") {
						//changes start for budget check msg display uml6kor 4/7/2019
						if (oData.ZZ_COMMENTS.indexOf("Budget") !== -1 && oData.ZZ_COMMENTS.indexOf("manager") !== -1) {
							MessageBox.error("Budget not available. Please contact your manager.");
						} else {
							MessageBox.error("Cannot save request in system");
						}
						sap.ui.core.BusyIndicator.hide();
					} else {
						if (aSave.ZZ_REINR === "0000000000") {
							aData.ZZ_REINR = oData.ZZ_REINR;
							that.getView().getModel("detail").setData(aData);
							sMsg = "Travel plan " + oData.ZZ_REINR + " is created successfully";
							MessageBox.success(sMsg);
							that.onPersonalTripCreate(aData);
						} else {
							if (aSave.ZZ_STATUS === "AA000") {
								sMsg = "Saved successfully";
								MessageBox.success(sMsg);
								that.onPersonalTripCreate(aData);
							} else {
								sMsg = "Submitted successfully";
								MessageBox.success(sMsg);
								that.onPersonalTripCreate(aData);
							}
						}

						if (that.selfVisaExist === "X") {
							that.saveVisaPlan(oData.ZZ_REINR, "BUSR");
							if (sap.ui.getCore().byId("UploadVisaSelf").oFileUpload.files.length !== 0) {
								/*sap.ui.project.e2etm.util.StaticUtility.uploadFileDeputation(oDeputationThis, sap.ui.getCore().byId('UploadVisaSelf'), data.d
									.ZZ_REINR, oDeputationThis.getView().getModel().getData().screenData.ZZ_DEP_PERNR, sMsg);*/
								com.bosch.hr.swift_trv.model.Common.uploadFileDeputation(that, sap.ui.getCore().byId("UploadVisaSelf"), oData.ZZ_REINR,
									that.Perner,
									that.oDataModel, sMsg);
							}
						}
						that.clearGlobalValues();
						sap.ui.core.BusyIndicator.hide();
					}
				},
				error: function (error) {
					sap.m.MessageToast.show("Failed to Create Request..!");
					sap.ui.core.BusyIndicator.hide();
				},
				async: true
			});

		},
		clearGlobalValues: function () {
			var that = this;
			that.MinScreen = false;
			that.FullScreen = false;
			that.EnableTravelDetail = false;
			that.aData.isUpdate = false;
			that.aData.isCreate = false;
			that.aData.isRead = true;
			that.advanceCall = false;
			that.bCodeServiceCall = false;
			that.bCenterServiceCall = false;
			that.bFundServiceCall = false;
			that.bWBSServiceCall = false;
			that.bBudgetCenterServiceCall = false;
			that.dateChange = false;
			var oObjectPage = that.getView().byId("ObjectPageLayout");
			oObjectPage.setShowFooter(false);
			sap.ui.getCore().getModel("products").getData().butonVisible = true;
			sap.ui.getCore().getModel("products").getData().busy = false;
			sap.ui.getCore().getModel("products").refresh();
			sap.ui.getCore().getModel("MyTasks").refresh();
			that.nonedit_Elements();
			that.getView().byId("idSaveButton").setVisible(true);
			var sNextLayout = that.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
			that.oRouter.navTo("master", {
				layout: sNextLayout
			});
		},
		saveVisaPlan: function (reqNo, type) {

			var visa = {};
			visa.ZZ_VISA_EDATE = sap.ui.getCore().getModel("products").getData().ZZ_VISA_EDATE;
			visa.ZZ_VISA_SDATE = sap.ui.getCore().getModel("products").getData().ZZ_VISA_SDATE;
			visa.ZZ_VISA_NO = sap.ui.getCore().getModel("products").getData().ZZ_VISA_NO;
			//visa.href = sap.ui.getCore().getModel("products").getData().href;
			visa.ZZ_VISA_CAT = "BUSR";
			visa.ZZ_VISA_FCNTRY = sap.ui.getCore().getModel("products").getData().ZZ_VISA_FCNTRY;
			visa.ZZ_VISA_TOCNTRY = sap.ui.getCore().getModel("products").getData().ZZ_VISA_TOCNTRY;
			visa.ZZ_VISA_PLAN = sap.ui.getCore().getModel("products").getData().ZZ_VISA_PLAN;
			visa.ZZ_CURR_VISA_TYP = "BUSR";
			visa.ZZ_DEP_REQ = reqNo;
			visa.ZZ_MULT_ENTRY = "";
			visa.ZZ_PASSPORT_NO = "";
			visa.ZZ_OFFC_ADDRESS = "";
			visa.VISAPLANTOITEM = [{
				"ZZ_VISA_PLAN": "",
				"ZZ_DEPNDT_TYP": "",
				"ZZ_DEP_REQ": "",
				"ZZ_VISA_NO": "",
				"ZZ_VISA_SDATE": "",
				"ZZ_VISA_EDATE": "",
				"ZZ_MULT_ENTRY": "",
				"ZZ_VISA_FCNTRY": "",
				"ZZ_VISA_TOCNTRY": "",
				"ZZ_PASSPORT_NO": "",
				"ZZ_CURR_VISA_TYP": ""
			}];

			this.oDataModel.create("DEP_VISA_PLANSet", visa, null, function (oData, response) {
				sap.m.MessageToast.show("Visa Detail Updated");
			}, function (error) {
				sap.m.MessageToast.show("Visa Detail Not Updated");
			}, true);
		},
		onPressSubmit: function () {
			var that = this;
			var sAction = "AA003";
			var data = this.getView().getModel("detail").getData();
			/// Validations
			if (data.ZZ_SMODID === "INTL" && this.getView().byId("idConfirm").getSelected() !== true) {
				MessageBox.error("Please check on 'I have read and understood the above statement'");
				return;
			}
			this.checkValidations();
			if (this.Error !== "") {
				return;
			}
			sap.ui.core.BusyIndicator.show(-1);
			if (sAction === "AA003" && data.ZZ_SMODID === "INTL" && data.ZZ_TRV_TYP === "BUSR") {

				var promise1 = jQuery.Deferred();
				var passportURL = "DmsDocsSet?$filter=DepReq+eq+'999999999'+and+EmpNo+eq+'" + this.Perner + "'+and+DocType+eq+'PS'";
				this.oDataModel.read(passportURL, null, null, true, function (oData, response) {
					if (oData.results === undefined || oData.results === 0) {
						MessageBox.error(
							"Scanned copy of your passport is missing. Please save the request and update employee profile with passport copy. The scanned copy will help the ticketing team to block your tickets against your name as in passport."
						);
						sap.ui.core.BusyIndicator.hide();
						return;
					}
					promise1.resolve();
				}, function (error) {
					sap.ui.core.BusyIndicator.hide();
				}, true);
			}
			if (sAction === "AA003") {
				var reqNo = this.reqNo;
				var promise2 = jQuery.Deferred();
				var url = "BudgetCheck?ZZ_DEP_SUB_TYP='" + data.ZZ_DEP_SUB_TYP +
					"'&ZZ_PERNR='" + this.Perner +
					"'&ZZ_MGR_PERNR='" + this.Perner +
					"'&ZZ_REINR='" + reqNo + "'&ZZ_STAT_FLAG='" + sAction +
					"'&ZZ_TTYPE='" + data.ZZ_TRV_TYP +
					"'&$format=json";

				this.oDataModel.read(url, null, null, true, function (oData, response) {
					try {
						try {
							var output = JSON.parse(response.body);
							var sHasBudget = output.d.results[0].ZZ_BUDGET_AVL;
						} catch (ex) {
							sHasBudget = "X";
						}
						if (!com.bosch.hr.swift_trv.model.Common.noBudgetCheck(
								sAction,
								sHasBudget,
								sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_DEPT,
								data.ZZ_FSTL,
								data.TRV_HDRtoTRV_COST_ASGN.results[0].ZZ_GEBER,
								data.ZZ_SMODID)) {
							MessageBox.error("Budget not available. Please contact your manager.");
							return;
						}
						promise2.resolve();
						sap.ui.core.BusyIndicator.hide();
					} catch (exc) {
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error("Budget not available. Please contact your manager.");
						return;
					}
				}, function (error) {
					sap.m.MessageToast.show("Budget Processing Not Successfull..!");
				}, true);
			}
			if (data.ZZ_SMODID === "INTL") {
				$.when(promise1, promise2).done(
					function () {
						that.onPromiseSuccess(sAction);
					});
			} else {
				$.when(promise2).done(
					function () {
						that.onPromiseSuccess(sAction);
					});
			}
		},
		onPromiseSuccess: function (sAction) {
			var that = this;
			var data = this.getView().getModel("detail").getData();
			if (sAction === "AA003" && data.ZZ_SMODID === "INTL" && data.ZZ_DATB1 >= "20180101") {
				var max = 0;
				var min = 0;
				var globalData = sap.ui.getCore().getModel("global").getData();
				for (var i = 0; i < globalData.DepTravelType.length; i++) {
					if (data.ZZ_LAND1 === "DE") {
						if (data.ZZ_LAND1 === globalData.DepTravelType[i].ZzCountry &&
							data.ZZ_MODID === globalData.DepTravelType[i].ZzTrvKey &&
							data.ZZ_SMODID === globalData.DepTravelType[i].ZzDepSubType &&
							data.ZZ_TRV_CAT === globalData.DepTravelType[i].ZzTrvCat) {
							max = globalData.DepTravelType[i].ZzMaxDur;
							min = globalData.DepTravelType[i].ZzMinDur;
							var strtdate = data.ZZ_DATV1;
							var enddate = data.ZZ_DATB1;
							var dStart = new Date(strtdate.substr(0, 4), strtdate.substr(4, 2) - 1, strtdate.substr(6, 2));
							var dEnd = new Date(enddate.substr(0, 4), enddate.substr(4, 2) - 1, enddate.substr(6, 2));
							var dDur = new Date(dEnd - dStart);
							var durStEn = Math.round(dDur.getTime() / (1000 * 3600 * 24) + 1);

							if (durStEn <= max && durStEn >= min) {

							} else {
								MessageBox.error('Error: Maximum allowed travel duration for the selected country is ' + max +
									' . Please correct the dates accordingly');
								sap.ui.core.BusyIndicator.hide();
								return;
							}

						}
					} else {
						if (data.ZZ_MODID === globalData.DepTravelType[i].ZzTrvKey &&
							data.ZZ_SMODID === globalData.DepTravelType[i].ZzDepSubType &&
							data.ZZ_TRV_CAT === globalData.DepTravelType[i].ZzTrvCat) {
							max = globalData.DepTravelType[i].ZzMaxDur;
							min = globalData.DepTravelType[i].ZzMinDur;
							strtdate = data.ZZ_DATV1;
							enddate = data.ZZ_DATB1;
							dStart = new Date(strtdate.substr(0, 4), strtdate.substr(4, 2) - 1, strtdate.substr(6, 2));
							dEnd = new Date(enddate.substr(0, 4), enddate.substr(4, 2) - 1, enddate.substr(6, 2));
							dDur = new Date(dEnd - dStart);
							durStEn = Math.round(dDur.getTime() / (1000 * 3600 * 24) + 1);

							if (durStEn > max) {
								MessageBox.error('Error: Maximum allowed travel duration for the selected country is ' + max +
									' . Please correct the dates accordingly');
								sap.ui.core.BusyIndicator.hide();
								return;
							}
						}
					}
				}
				this.oDataModel.read("DEP_REQ_DATES?CONST='DEP_REQ_DATE'&SELPAR=''&$format=json", null, null, false, function (oData, response) {
					sap.ui.core.BusyIndicator.hide();
					if ((data.ZZ_MODID === "BUSR" || data.ZZ_MODID === "INFO") && // Confirmation
						// only
						// for
						// international
						// business
						// travel
						sAction === "AA003" && data.ZZ_SMODID === "INTL") {
						var stDate = data.ZZ_DATV1;
						var checkStartDateTmp = new Date(stDate.substr(0, 4), stDate.substr(4, 2) - 1, stDate.substr(6, 2));
						var checkCurDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
						var passportExpiry = sap.ui.getCore().getModel("profile").getData().passportDetail.ZZ_DATE_EXPIRY;
						try {
							var passExpiryDate = new Date(passportExpiry.substr(0, 4), (passportExpiry.substr(4, 2) - 1), passportExpiry.substr(6, 2));
							var crrDate = new Date();
							var diff = (passExpiryDate.getTime() - crrDate.getTime()) / 1000;
							diff /= (60 * 60 * 24 * 7 * 4);
							var val = Math.round(diff);
							if (val <= 6) {
								// no
								that.passportWarning = true;
							} else {
								that.passportWarning = false;
							}
						} catch (err) {}
						sap.ui.core.BusyIndicator.hide();
						if (parseInt(data.ZZ_ZDURN, 10) > parseInt(data.view.warning, 10)) { // Confirmation
							// for
							// BUSR
							// INTL
							// with
							// warning
							var sWarning = "This request will be forwarded for additional approval as your travel duration is more than " +
								data.view.warning + " days, do you want to continue ?";
						} else if (data.ZZ_MODID === "BUSR" &&
							checkStartDateTmp <= checkCurDate) {
							sWarning =
								"Do you want to submit the request ? Please note: Create 'additional advance request' in case you need additional advance"; //uml6kor_upgrade 26/11/2019 change of symbols 
						} else if (that.passportWarning === true) {
							sWarning =
								"Your passport is going to expire soon. Make sure you have sufficient passport validity (> 6 months) for the travel";
						} else { // Confirmation for BUSR INT w/o warning
							sWarning = "Do you want to submit the request ?";
						}
						sap.m.MessageBox.confirm(sWarning, function (oAction) {
							if (oAction === "OK") {
								that.showConfirmWBS(sAction);
							}
						});
					} else if (data.ZZ_MODID === "BUSR" || data.ZZ_MODID === "INFO") {
						that.showConfirmWBS(sAction);
						// }
					}
				}, function (error) {
					sap.ui.core.BusyIndicator.hide();
					sap.m.MessageToast.show("Date Processing Failed..!");
				}, false);
			} else {
				that.showConfirmWBS(sAction);
			}
		},
		showConfirmWBS: function (sAction) {
			var that = this;
			if (sAction === "AA003") {
				var advanceData = this.getView().getModel("detail").getData().advance;
				var total = 0;
				for (var i = 0; i < advanceData.length; i++) {
					total += parseInt(advanceData[i].total, 10);
				}
				if (total === 0) {
					sap.m.MessageBox.show(
						"The advance amount entered is '0' for this request. Do you still want to continue with submission of the request ?  ", {
							icon: sap.m.MessageBox.Icon.QUESTION,
							title: "Confirmation",
							actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
							onClose: function (oAction) {
								if (oAction === "YES") {
									that.onPressSave(sAction);
								}
							}
						});
				} else {
					this.onPressSave(sAction);
				}
			} else {
				this.onPressSave(sAction);
			}
		},
		onFileChange: function (evt) {
			com.bosch.hr.swift_trv.model.Common.uploadFileDeputation(this, evt.getSource(), this.reqNo, this.Perner, this.oDataModel);
		},
		onTypeMissmatch: function (evt) {
			sap.m.MessageToast.show("Only allow file types: image, text, MS Word, MS Excel, pdf");
		},
		onFileSizeExceed: function (evt) {
			sap.m.MessageToast.show("Not allow file size over 5MB");
		},
		onDeletePress: function () {
			var that = this;
			var sUrl = "TRV_HDRSet(ZZ_PERNR='" + this.Perner + "',ZZ_DEP_REQ='" + this.reqNo +
				"',ZZ_VERSION='',ZZ_TRV_TYP='BUSR')";
			sap.ui.core.BusyIndicator.show(-1);
			this.oDataModel.remove(sUrl, null, jQuery.proxy(function (oData, response) {
				sap.m.MessageToast.show("Deleted Succesfully");
				that.clearGlobalValues();
				sap.ui.core.BusyIndicator.hide();
			}, this), jQuery.proxy(function (error) {
				sap.m.MessageToast.show("Delete Failed");
			}, true));
		},

		/////########################## Personal Trips ##################################/////
		OnPersonalTravelSelect: function (evt) {
			var selectedVal = evt.getSource().getSelectedKey();
			if (selectedVal === "01") {
				this.getView().getModel("detail").getData().PersFlag = "X";
			} else {
				this.getView().getModel("detail").getData().PersFlag = "";
			}
			this.getView().getModel("detail").refresh();
		},
		onPressVisaDetails: function () {
			var that = this;
			if (!that._oDialogVisaInfo) {
				that._oDialogVisaInfo = sap.ui.xmlfragment("com.bosch.hr.swift_trv.fragments.general.VisaDetails", that);
				that.getView().addDependent(that._oDialogVisaInfo);
			}
			that._oDialogVisaInfo.open();
		},
		onCancelVisaDetails: function () {
			this._oDialogVisaInfo.close();
		}

	});
});