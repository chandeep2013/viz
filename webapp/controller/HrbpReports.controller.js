sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/viz/ui5/controls/common/feeds/FeedItem',
	"sap/viz/ui5/controls/Popover"
], function (Controller, FeedItem, Popover) {
	"use strict";

	return Controller.extend("com.bosch.hr.swift_trv.controller.HrbpReports", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.bosch.hr.swift_trv.view.Reports
		 */
		onInit: function () {
			this.oOwnerComponent = this.getOwnerComponent();
			this.oRouter = this.oOwnerComponent.getRouter();
			this.oRouter.getRoute("HrbpReports").attachPatternMatched(this._onvizCharts, this);
		},
		_onvizCharts: function () {
			var that = this;
			var vizModel = new sap.ui.model.json.JSONModel();
			var global = sap.ui.getCore().getModel("global").getData();
			var CountryModel = new sap.ui.model.json.JSONModel();
			CountryModel.setData(global.country);
			that.getView().setModel(CountryModel, "country");
			this.sServiceUrl = "/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/";
			this.oDataModel = new sap.ui.model.odata.ODataModel(this.sServiceUrl);
			var data = "";
			var that = this;
			$.ajax({
				url: "model/reports.json",
				dataType: "json",
				async: false,
				type: "GET",
				complete: function (xhr, status) {},
				success: function (response) {
					data = response;
					vizModel.setData(response);
					sap.ui.getCore().setModel(vizModel, "data");
					that.getView().setModel(vizModel, "data");
				},
				error: function (textStatus, errorThrown) {
					data = textStatus.responseText;
				}
			});

			var oView = this.getView();
			//this.expandmyChart(oView, "idVizFrame1", "Cell1");
			//	this.popOverChart(oView, "idVizFrame1", "idPopOver1");
			//	this.popOverChart(oView, "idVizFrame2", "idPopOver2");
			//	this.popOverChart(oView, "idVizFrame3", "idPopOver3");

			this.twoSeriesChart(oView, "idVizFrame1", "valueAxisFeed1");
			//this.twoSeriesChart(oView, "idVizFrame2", "valueAxisFeed2");
			this.check(oView, "idVizFrame3", "valueAxisFeed3");
			var YearArray = [];
			var YearModel = new sap.ui.model.json.JSONModel();
			var currentYear = new Date().getFullYear();
			for (var i = 2000; i < currentYear+1; i++) {
				YearArray.push({
					"text": i
				});
			}
			YearModel.setData(YearArray);
			this.getView().setModel(YearModel, "Year");

		},
		onListItemPress: function (oEvent) {
			var sToPageId = oEvent.getParameter("listItem").getCustomData()[0].getValue();
			this.getSplitContObj().toDetail(this.createId(sToPageId));
		},
		onPressPECountriesYes: function () {
			this.getView().byId("idHrbpCountry").setEnabled(false);
			this.getView().byId("idHrbpCountry").setSelectedKeys([]);
			this.getView().byId("idHrbpLoc").setEnabled(false);
			this.getView().byId("idHrbpLoc").setSelectedKeys([]);
		},
		onPressPECountriesNo: function () {
			this.getView().byId("idHrbpCountry").setEnabled(true);
			this.getView().byId("idHrbpCountry").setSelectedKeys([]);
			this.getView().byId("idHrbpLoc").setEnabled(true);
			this.getView().byId("idHrbpLoc").setSelectedKeys([]);
		},
		/////############## country change ##################///////////
		onCountryChange: function (curEvt) {
			var that = this;
			if (curEvt.getSource().getSelectedKeys().length > 1) {
				this.getView().byId("idHrbpLoc").setEnabled(false);
				this.getView().byId("idHrbpLoc").setSelectedKeys([]);
			} else {
				sap.ui.core.BusyIndicator.show(-1);
				this.getView().byId("idHrbpLoc").setEnabled(true);
				var locationModel = new sap.ui.model.json.JSONModel();
				var url = "DEP_LOCATIONSSet?$filter=MOLGA eq '" + curEvt.getSource().getSelectedKeys() +
					"'&$format=json";
				this.oDataModel.read(url, null, null, true, function (oData, response) {
					var FromLoc = JSON.parse(response.body).d.results;
					if (FromLoc[0] !== undefined && FromLoc[0] !== null) {
						locationModel.setData(FromLoc);
						//that.getView().byId("idLocationR").setSelectedKey(FromLoc[0].MOLGA);
						that.getView().setModel(locationModel, "location");
					}
					sap.ui.core.BusyIndicator.hide();
				}, function (error) {
					sap.ui.core.BusyIndicator.hide();
					sap.m.MessageToast.show("Locations Not Found for the selected country");
				});
			}
			var AssignmentModel = new sap.ui.model.json.JSONModel();
			this.oDataModel.read("/AsgModelsF4Set?$filter=ToCountry eq '" + curEvt.getSource().getSelectedKeys() +
				"'&$format=json", null, null, true,
				function (oData, response) {
					var Assignment = JSON.parse(response.body).d.results;
					if (Assignment[0] !== undefined && Assignment[0] !== null) {
						AssignmentModel.setData(Assignment);
						that.getView().setModel(AssignmentModel, "Assignment");
					}
					sap.ui.core.BusyIndicator.hide();
				},
				function (error) {
					sap.ui.core.BusyIndicator.hide();
					sap.m.MessageToast.show("Assignment Model Not Found for the selected country");
				});

		},
		getSplitContObj: function () {
			var result = this.byId("SplitContDemo");
			if (!result) {
				sap.m.MessageToast.error("SplitApp object can't be found");
			}
			return result;
		},
		twoSeriesChart: function (oView, sChart, seriesId) {
			var value = ["DEPU", "BUSR", "INFO", "SECO"];
			var oVizFrame = oView.byId(sChart);
			var feedValueAxis1 = this.getView().byId(seriesId);
			oVizFrame.removeFeed(feedValueAxis1);
			feedValueAxis1.setValues(value);
			oVizFrame.addFeed(feedValueAxis1);
			oVizFrame.setVizProperties({
				plotArea: {
					dataLabel: {
						visible: true,
						type: 'value'
					},
					drawingEffect: 'glossy'
				},
				title: {
					text: 'Column Chart'
				},
				legendGroup: {
					layout: {
						position: 'right'
					}
				}
			});

		},
		check: function (oView, sChart, seriesId) {
			var value = ["DEPU", "BUSR", "INFO", "SECO", "DEPUAvgDuration", "BUSRAvgDuration","INFOAvgDuration","HOMEAvgDuration"];
			var oVizFrame = oView.byId(sChart);
			var feedValueAxis1 = this.getView().byId(seriesId);
			oVizFrame.removeFeed(feedValueAxis1);
			feedValueAxis1.setValues(value);
			oVizFrame.addFeed(feedValueAxis1);
			oVizFrame.setVizProperties({
				plotArea: {
					dataShape: {
						primaryAxis: ['bar', 'bar', 'bar', 'bar', 'line','line','line'],
						secondaryAxis: ['line', 'line', 'line']
					}
				}
			});
			oVizFrame.setVizProperties({
				plotArea: {
					dataLabel: {
						visible: true,
						type: "value"
					},
					drawingEffect: "glossy"
				},
				title: {
					text: "Combination Chart"
				},
				legendGroup: {
					layout: {
						position: "right"
					}
				}
			});
		},
		popOverChart: function (oView, sChart, sPopOverId) {
			var oVizFrame = oView.byId(sChart);
			var oPopOver = this.getView().byId(sPopOverId);
			oPopOver.connect(oVizFrame.getVizUid());
		},
		navButtonPress: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("View1", {
				layout: "OneColumn"
			});
			/*var oSplitApp = this.getView().byId("SplitContDemo");
			oSplitApp.setMode("HideMode");//ShowHideMode
			this.getView().byId("detail").setShowNavButton(true);*/
		},
		handleSearchButtonPress:function(){
			var that = this;
			var year = this.getView().byId("idHerbpYear").getSelectedKeys().toString();
			var country = this.getView().byId("idHrbpCountry").getSelectedKeys().toString();
			var asgType = this.getView().byId("idHrbpAsgType").getSelectedKeys().toString();
			var toLoc = this.getView().byId("idHrbpLoc").getSelectedKeys().toString();
			var peLoc = this.getView().byId("idHrbpPELoc").getSelectedKey();
			if(peLoc === "Yes"){
				var PECountries = "X";
			}
			else{
				PECountries = "";
			}
			var sponsor = this.getView().byId("idHrbpFamilySP").getSelectedKey();
			if(sponsor == 2){
				var family = "X";
			}else{
				family="";
			}
			sap.ui.core.BusyIndicator.show(-1);
			var url="AnalyticRepSet?$filter=PeLoc eq '"+PECountries+"' and Year eq '"+year+"' and Country eq '"+ country +"' and ToLoc eq '"+toLoc+"' and AsgType eq '"+asgType+"' and Family eq '"+family+"'&$format=json";
			var vizModel = new sap.ui.model.json.JSONModel();
			this.oDataModel.read(url, null, null, true,
				function (oData, response) {
					var vizData = JSON.parse(response.body).d.results;
					if (vizData[0] !== undefined && vizData[0] !== null) {
						vizModel.setData(vizData);
						that.getView().setModel(vizModel, "vizData");
					}
					sap.ui.core.BusyIndicator.hide();
				},
				function (error) {
					sap.m.MessageToast.show("No Data Found for selected Filters..!");
					sap.ui.core.BusyIndicator.hide();
				});
		},
		onPressDetailBack: function () {
			var oSplitApp = this.getView().byId("SplitContDemo");
			if (oSplitApp.getMode() == "ShowHideMode") {
				oSplitApp.setMode("HideMode");
				this.getView().byId("detail").setShowNavButton(false);
			} else {
				oSplitApp.setMode("ShowHideMode");
				this.getView().byId("detail").setShowNavButton(true);
			}

		},
		onListItemReportPress: function (evt) {
			var chart = this.getView().byId("idVizFrame1");
			var SelectedId = evt.getParameters("listitem").listItem.getId();
			if (SelectedId.indexOf("idBarChart") !== -1) {
				chart.setVizType("bat");
			} else if (SelectedId.indexOf("idColChart") !== -1) {
				chart.setVizType("column");
			} else if (SelectedId.indexOf("idLineChart") !== -1) {
				chart.setVizType("line");
			}
			//	chart.setVizType("column");
		},
		selectData: function (evt) {
			var that = this;
			var sChart = evt.getSource().getVizUid();
			this.pop = evt.getSource().getVizUid().split("")[evt.getSource().getVizUid().split("").length - 1];
			this.oVizFrame = this.getView().byId(sChart);
			var modelData = this.getView().getModel("data").getData().items;
			var sel = this.getView().byId(sChart).vizSelection();
			for (var i = 0; i < modelData.length; i++) {
				if (modelData[i].Year === sel[0].data.Year) {
					this.Average = modelData[i].DEPUAvgDuration;
					break;
				}
			}

			/*var popoverProps = {
				'customDataControl' : function(data){
                            if(data.data.val) {
                               return new sap.m.Text({text:"Testing"});
                            }
                        }
			};*/
			this.chartPopover = new Popover();
			this.chartPopover.setActionItems([{
				type: "action",
				text: "Average Travel Duration" + " - " + that.Average
			}]);

			this.oVizFrame.attachSelectData(that.fnSwitchPop(), that);
		},
		fnSwitchPop: function () {
			/*var oPopOver = this.getView().byId("idPopOver" + this.pop);
			oPopOver.connect(this.oVizFrame.getVizUid());*/
			this.chartPopover.connect(this.oVizFrame.getVizUid());
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.bosch.hr.swift_trv.view.Reports
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.bosch.hr.swift_trv.view.Reports
		 */

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.bosch.hr.swift_trv.view.Reports
		 */
		//	onExit: function() {
		//
		//	}

	});

});