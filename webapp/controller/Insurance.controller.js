sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/bosch/hr/swift_trv/model/formatter",
	"sap/ui/model/json/JSONModel",
	'sap/m/ColumnListItem',
	'sap/m/Input',
	'sap/m/DatePicker',
	"sap/m/MessageBox"
], function (Controller, formatter, JSONModel, ColumnListItem, Input, DatePicker, MessageBox) {
	"use strict";

	return Controller.extend("com.bosch.hr.swift_trv.controller.Insurance", {
		formatter: formatter,
		onInit: function () {
			this.oOwnerComponent = this.getOwnerComponent();
			this.oRouter = this.oOwnerComponent.getRouter();
			this.oRouter.getRoute("Insurance").attachPatternMatched(this._onRouteMatched, this);
		},
		_onRouteMatched: function (oEvent) {
			this.oOwnerComponent = this.getOwnerComponent();
			this.oRouter = this.oOwnerComponent.getRouter();
			this.oModel = this.oOwnerComponent.getModel();
			this.sServiceUrl = "/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/";
			this.oDataModel = new sap.ui.model.odata.ODataModel(this.sServiceUrl);
			this.reqNo = oEvent.getParameter("arguments").reqNo;
			var action = sap.ui.getCore().getModel("global").getData().action;
			//action = "00";
			if (action === "00") { //Create
				this.doCreate();
			} else { //Change
				this.doModify();
			}
			//	this.displayNext();
		},
		TemplateCreation: function () {
			/************************* Travel Details Table********************************/

			this.TravellingTable = this.byId("idTravellingTable");
			this.oReadOnlyTemplate_T = this.byId("idTravellingTable").removeItem(0);
			this.rebindTable_T(this.oReadOnlyTemplate_T, "Navigation");
			this.oEditableTemplate_T = new ColumnListItem({
				cells: [
					new Text({
						text: ""
					}),
					new Input({
						value: "{traveller>ZZ_DEP_NAME}"
					}), new sap.m.ComboBox({
						selectedKey: "{traveller>ZZ_DEPNDT_TYP}",
						width: "100%",
						editable: false,
						items: [
							new sap.ui.core.Item({
								key: "00",
								text: "Self"
							})
						]
					}),
					new sap.m.Select({
						selectedKey: "{traveller>ZZ_VISA_TYPE}",
						width: "100%",
						items: [
							new sap.ui.core.Item({
								key: "",
								text: "Please Select"
							}),
							new sap.ui.core.Item({
								key: "BUSR",
								text: "Business",
								enabled: {
									parts: ['new>/ZZ_TRV_TYP', 'new>/ZZ_DEPNDT_TYP'],
									formatter: function (trvType, dpndType) {
										if (trvType === "BUSR" || trvType === "INFO" || trvType === "SECO" || trvType === "DEPU") {
											if (dpndType === "00")
												return true;
										}
										return false;
									}
								}
							}),
							new sap.ui.core.Item({
								key: "DPND",
								text: "Dependent",
								enabled: {
									parts: ['new>/ZZ_TRV_TYP', 'new>/ZZ_DEPNDT_TYP'],
									formatter: function (trvType, dpndType) {
										if (trvType === "DEPU") {
											if (dpndType !== "00") {
												return true;
											}
										}
										return false;
									}
								}

							}),
							new sap.ui.core.Item({
								key: "TOUR",
								text: "Tourist",
								enabled: {
									parts: ['new>/ZZ_TRV_TYP', 'new>/ZZ_DEPNDT_TYP', 'new>/ZE2E_INS_HDR/ZZ_SPONSOR'],
									formatter: function (trvType, dpndType, familySpons) {
										if (trvType === "BUSR" || trvType === "INFO" || trvType === "SECO") {
											if (dpndType === "00")
												return false;
											else
												return true;
										} else if (trvType === "DEPU") {
											if (dpndType === "00")
												return false;
											else {
												if (familySpons === "X")
													return true;
											}
										}
										return false;
									}
								}
							}),
							new sap.ui.core.Item({
								key: "TRNG",
								text: "Training",
								enabled: false
							}),
							new sap.ui.core.Item({
								key: "WRKP",
								text: "Work permit",
								enable: false
							})
						]
					}),

					new sap.m.Select({
						selectedKey: "{traveller>ZZ_PAY_TYP}",
						width: "100%",
						items: [new sap.ui.core.Item({
								key: "",
								text: "Please Select"
							}),
							new sap.ui.core.Item({
								key: "PBRB",
								text: "Paid By RBEI"
							}),
							new sap.ui.core.Item({
								key: "PBEM",
								text: "Paid By Associate"
							})

						]
					}),
					new Input({
						value: "{traveller>ZZ_INS_NO}",
						editable: false
					}),
					new sap.m.DatePicker({
						value: "{traveller>ZZ_DOB}",
						displayFormat: "dd/MM/yyyy",
						valueFormat: "yyyyMMdd",
						editable: false
					}),
					new Input({
						value: "{traveller>ZZ_PASSPORT}"
					})
				]
			});

			/**********************************************************/

		},
		rebindTable_T: function (oTemplate, sKeyboardMode) {
			this.TravellingTable.bindItems({
				path: "traveller>/",
				template: oTemplate,
				templateShareable: true,
				key: "Visa"
			}).setKeyboardMode(sKeyboardMode);
		},
		doModify: function (oRequest) {
			var oThis = this;
			sap.ui.core.BusyIndicator.show(-1);
			sap.ui.getCore().getModel("profile").getData().currentRole = "EMP";
			if (sap.ui.getCore().getModel("profile").getData().currentRole === "EMP") {
				var sPernr = sap.ui.getCore().getModel("global").getData().CurrentRequest.ZZ_DEP_PERNR;
				var sRequest = sap.ui.getCore().getModel("global").getData().CurrentRequest.ZZ_TRV_REQ;
				var sType = sap.ui.getCore().getModel("global").getData().CurrentRequest.ZZ_REQ_TYP;
				var sVisaPlan = sap.ui.getCore().getModel("global").getData().CurrentRequest.ZZ_VISA_PLAN;
				var sVersion = '';
				var sZZ_MODID = "BUSR";
			} else {
				sPernr = oRequest.ZZ_OWNER;
				sRequest = oRequest.ZZ_TRV_REQ;
				sType = oRequest.ZZ_TRV_KEY;
				sVisaPlan = '';
				sVersion = '';
			}

			if (sType === "VISA") { //Visa request
				var sINS_HDR =
					"ZE2E_INS_HDRSet(ZZ_TRV_REQ='{0}',ZZ_OWNER='{1}',ZZ_TRV_KEY='{2}',ZZ_VERSION='{3}')?$expand=ZE2E_INS_DETAILSet/ZE2E_INS_ANS,ZE2E_REQ_STATUS,ZE2E_BVISA_HDR";
			} else { //Travel request
				sINS_HDR =
					"ZE2E_INS_HDRSet(ZZ_TRV_REQ='{0}',ZZ_OWNER='{1}',ZZ_TRV_KEY='{2}',ZZ_VERSION='{3}')?$expand=ZE2E_INS_DETAILSet/ZE2E_INS_ANS,ZE2E_REQ_STATUS";
			}
			sINS_HDR = sINS_HDR.replace("{0}", sRequest);
			sINS_HDR = sINS_HDR.replace("{1}", sPernr);
			sINS_HDR = sINS_HDR.replace("{2}", sType);
			sINS_HDR = sINS_HDR.replace("{3}", sVersion);

			var sTRV_HDR = "TRV_HDRSet(ZZ_PERNR='{0}',ZZ_DEP_REQ='{1}',ZZ_VERSION='{2}',ZZ_TRV_TYP='{3}')";
			sTRV_HDR = sTRV_HDR.replace("{0}", sPernr);
			sTRV_HDR = sTRV_HDR.replace("{1}", sRequest);
			sTRV_HDR = sTRV_HDR.replace("{2}", sVersion);
			sTRV_HDR = sTRV_HDR.replace("{3}", sType);

			var oBatch0 = this.oDataModel.createBatchOperation(sINS_HDR, "GET");
			var oBatch1 = this.oDataModel.createBatchOperation("DEP_VISA_PLANSet('" + sVisaPlan + "')?$expand=VISAPLANTOITEM", "GET");
			var oBatch2 = this.oDataModel.createBatchOperation("DEP_PASSPORT_INFOSet('" + sPernr + "')", "GET");
			var oBatch3 = this.oDataModel.createBatchOperation("DEP_EMPSet('" + sPernr + "')?$expand=EMPtoEMPDEPNDNT", "GET");
			var oBatch4 = this.oDataModel.createBatchOperation("GetDomain?DomainName='ZSLFDPD'&$format=json", "GET");
			var oBatch5 = this.oDataModel.createBatchOperation("ZE2E_INS_QASet", "GET");
			var oBatch6 = this.oDataModel.createBatchOperation(sTRV_HDR, "GET");
			var sAmountURL = "InsAmount?ZZ_TRV_KEY='{0}'&ZZ_TRV_REQ='{1}'&$format=json";
			sAmountURL = sAmountURL.replace("{0}", sType);
			sAmountURL = sAmountURL.replace("{1}", sRequest);
			var oBatch7 = this.oDataModel.createBatchOperation(sAmountURL, "GET");
			var sURL = "/ZE2E_REQ_LOGSet?$filter=ZZ_TRV_REQ+eq+'{0}'+and+ZZ_TRV_KEY+eq+'{1}'+and+ZZ_MODID+eq+'{2}'";
			sURL = sURL.replace("{0}", sRequest);
			sURL = sURL.replace("{1}", "BUSR");
			sURL = sURL.replace("{2}", "INSR");
			var oBatch8 = this.oDataModel.createBatchOperation(sURL, "GET");

			this.oDataModel.addBatchReadOperations([oBatch0, oBatch1, oBatch2, oBatch3, oBatch4, oBatch5, oBatch6, oBatch7, oBatch8]);
			this.oDataModel.submitBatch(
				function (oResult) {
					var oData = $.extend({}, oResult.__batchResponses[0].data, oResult.__batchResponses[1].data,
						oResult.__batchResponses[2].data, oResult.__batchResponses[3].data, oResult.__batchResponses[6].data);
					//Lock for admin if current request have been handled
					var currentRole = sap.ui.getCore().getModel("profile").getData().currentRole;
					oData.ZE2E_INS_HDR = oResult.__batchResponses[0].data;
					oData.ZE2E_INS_HDR.ZZ_CLEVEL = oResult.__batchResponses[7].data.InsAmount.ZZ_CLEVEL;
					oData.ZE2E_INS_HDR.ZZ_INS_AMOUNT = oResult.__batchResponses[7].data.InsAmount.ZZ_INS_RNMEDICAL_AMOUNT;
					oData.ZE2E_INS_HDR.ZZ_INS_CURR = oResult.__batchResponses[7].data.InsAmount.ZZ_INS_RNMEDICAL_CURR;
					oData.ZE2E_INS_HDR.ZZ_DAY_AMOUNT = oResult.__batchResponses[7].data.InsAmount.ZZ_INS_RMEDICAL_AMOUNT;
					oData.ZE2E_INS_HDR.ZZ_DAY_CURR = oResult.__batchResponses[7].data.InsAmount.ZZ_INS_RMEDICAL_CURR;
					oData.DEPENDENT_TYPE = oResult.__batchResponses[4].data;
					oData.QUESTION = oResult.__batchResponses[5].data;
					//	oThis.prepareDataForModification(oData);

					if (oData.ZZ_TRV_KEY === "VISA") {
						oData.ZZ_TRV_TYP = "VISA";
						oData.ZZ_REINR = oData.ZE2E_BVISA_HDR.ZZ_VISA_REQ;
						oData.ZZ_DATV1 = oData.ZE2E_BVISA_HDR.ZZ_VISA_PSDATE;
						oData.ZZ_DATB1 = oData.ZE2E_BVISA_HDR.ZZ_VISA_PEDATE;
						oData.ZZ_ZDURN = "NA";
						oData.ZZ_LAND1 = oData.ZE2E_BVISA_HDR.ZZ_VISA_TOCNTRY;
					}
					//Start of change_dye5kor
					if (oData.ZE2E_REQ_STATUS.ZZ_NROLE === "03" && oData.ZE2E_REQ_STATUS.ZZ_REASON === "6") {
						oData.ZZ_CAN_TXT = oRequest.ZZ_CAN_TXT;
					}
					//end of change_dye5kor
					var oModel = new sap.ui.model.json.JSONModel();
					var traveller = new sap.ui.model.json.JSONModel();
					var dependents = new sap.ui.model.json.JSONModel();
					oThis.traveller = [];
					oThis.dependents = [];
					setTimeout(function () {
						oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet = oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet.results;
						for (var i = 0; i < oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet.length; i++) {
							oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet[i].ZE2E_INS_ANS = oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet[i].ZE2E_INS_ANS.results;
							if (oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet[i].ZZ_DEPNDT_TYP.trim() === "00") {
								oThis.traveller.push(oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet[i]);
							} else {
								oThis.dependents.push(oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet[i]);
							}
						}
						traveller.setData(oThis.traveller);
						dependents.setData(oThis.dependents);
						oModel.setData(oData);
						traveller.setData(oThis.traveller);
						dependents.setData(oThis.dependents);
						oThis.getView().setModel(oModel, "new");
						oThis.getView().setModel(traveller, "traveller");
						oThis.getView().setModel(dependents, "dependents");
						oThis.TemplateCreation();
						oThis.nonedit_elements();
					}, 10);
					if (oData.ZE2E_REQ_STATUS.ZZ_REASON.trim() !== '') { //Compare version
						//		oThis.getPreviousVersion(oThis);
					}
					//	sap.ui.project.e2etm.util.StaticUtility.getComment(oData.ZZ_TRV_REQ, oData.ZZ_TRV_TYP, "INSR", oThis);
					com.bosch.hr.swift_trv.model.Common.getDocumentList(oThis, oData.ZZ_TRV_REQ, oData.ZZ_DEP_PERNR, 'INS', 'INSR', oData.ZZ_LAND1,
						oThis.oDataModel);
					//					Invisible button SendBack and questionare for VISA travel
					if (currentRole !== "EMP") {
						//Set Text for button Submit
						if (oData.ZE2E_REQ_STATUS.ZZ_REASON.trim() === "5") {
							oThis.getView().byId("btnSubmit").setText("Close");
							oThis.getView().byId("btnSubmit").setVisible(true);
							oThis.getView().byId("btnSendBack").setVisible(false);
						}
					}
					//////////#########Comments ################///////////////
					var commentsModel = new sap.ui.model.json.JSONModel();
					commentsModel.setData(oResult.__batchResponses[8].data.results);
					oThis.getView().setModel(commentsModel, "Comments");
					sap.ui.core.BusyIndicator.hide();
				},
				function (error) {
					sap.ui.core.BusyIndicator.hide();
					sap.m.MessageToast.show("No data found");
				});
		},
		OnChangeDependent: function (evt) {
			/*
						var path = evt.getSource().getParent().getBindingContextPath();
						var idx = parseInt(path.substring(path.lastIndexOf('/') + 1), 10);
						var key = evt.getSource().getSelectedKey();
						if (key !== "Select") {
							for (var i = 0; i < 5; i++) {
								this.dependents[idx].ZE2E_INS_ANS[i].ZZ_DEPNDT_TYP = key;
							}
						}
						sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(this.dependents), "dependents");
						this.getView().getModel("new").refresh();

					*/
		},
		getName: function (oData, sType) {
			var sTypeHR = com.bosch.hr.swift_trv.model.Common.mappingDependent(sType);
			if (sTypeHR === "") { //Self
				return oData.ZZ_DEP_NAME;
			}
			//Dependent
			var iIndex = com.bosch.hr.swift_trv.model.Common.getArrayIndex(oData.EMPtoEMPDEPNDNT.results, "ZZ_DEP_TYP", sTypeHR);
			if (iIndex !== -1) {
				return oData.EMPtoEMPDEPNDNT.results[iIndex].ZZ_DPND_FNAME + " " +
					oData.EMPtoEMPDEPNDNT.results[iIndex].ZZ_DPND_LNAME;
			}
			return "";
		},
		getGender: function (oData, sType) {
			var sTypeHR = com.bosch.hr.swift_trv.model.Common.mappingDependent(sType);
			if (sTypeHR === "") { //Self
				return oData.ZZ_DEP_GENDER;
			}
			//Dependent
			var iIndex = com.bosch.hr.swift_trv.model.Common.getArrayIndex(oData.EMPtoEMPDEPNDNT.results, "ZZ_DEP_TYP", sTypeHR);
			if (iIndex !== -1) {
				return oData.EMPtoEMPDEPNDNT.results[iIndex].ZZ_DEP_GENDER;
			}
			return "";
		},
		doCreate: function () {
			var oThis = this;
			sap.ui.core.BusyIndicator.show(-1);
			var sPernr = sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR;
			var sRequest = this.reqNo;
			var sType = "BUSR";
			try {
				var sVisaPlan = sap.ui.getCore().getModel("global").getData().CurrentRequest.ZZ_VISA_PLAN;
			} catch (err) {
				sVisaPlan = "";
			}
			//	sPernr = "00001095"; // to remove
			//	this.Pernr = "00001095";
			this.Pernr = sPernr;
			var oBatch0 = this.oDataModel.createBatchOperation("TRV_HDRSet(ZZ_PERNR='" + sPernr + "',ZZ_DEP_REQ='" + sRequest +
				"',ZZ_VERSION='',ZZ_TRV_TYP='" + sType +
				"')?$expand=ZE2E_INS_HDR,TRV_HDRtoTRV_travel_Data/ZE2E_INS_DETAIL/ZE2E_INS_ANS/ZE2E_INS_QA", "GET");
			var oBatch1 = this.oDataModel.createBatchOperation("DEP_VISA_PLANSet('" + sVisaPlan + "')?$expand=VISAPLANTOITEM", "GET");
			var oBatch2 = this.oDataModel.createBatchOperation("DEP_PASSPORT_INFOSet('" + sPernr + "')", "GET");
			var oBatch3 = this.oDataModel.createBatchOperation("DEP_EMPSet('" + sPernr + "')?$expand=EMPtoEMPDEPNDNT", "GET");
			var oBatch4 = this.oDataModel.createBatchOperation("GetDomain?DomainName='ZSLFDPD'&$format=json", "GET");
			var oBatch5 = this.oDataModel.createBatchOperation("ZE2E_INS_QASet", "GET");
			var oBatch6 = this.oDataModel.createBatchOperation("GetConstant?CONST='INSR'&SELPAR='TRFR'&$format=json", "GET");
			this.oDataModel.addBatchReadOperations([oBatch0, oBatch1, oBatch2, oBatch3, oBatch4, oBatch5, oBatch6]);
			this.oDataModel.submitBatch(
				function (oResult) {
					var oData = $.extend({}, oResult.__batchResponses[0].data, oResult.__batchResponses[1].data,
						oResult.__batchResponses[2].data, oResult.__batchResponses[3].data);
					oData.DEPENDENT_TYPE = oResult.__batchResponses[4].data;
					oData.QUESTION = oResult.__batchResponses[5].data;
					oData.DAYS = oResult.__batchResponses[6].data.GetConstant.VALUE;
					oThis.prepareDataForCreation(oData, oData.QUESTION);
					var oModel = new sap.ui.model.json.JSONModel();
					var traveller = new sap.ui.model.json.JSONModel();
					var dependents = new sap.ui.model.json.JSONModel();
					oThis.traveller = [];
					oThis.dependents = [];
					oModel.setData(oData);
					//############## 17 March 2020 UCD1KOR ################/////// Start
					for (var i = 0; i < oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet.length; i++) {
						if (oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet[i].ZZ_DEPNDT_TYP.trim() === "00") {
							oThis.traveller.push(oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet[i]);
						} else {
							oThis.dependents.push(oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet[i]);
						}
					}
					if (oThis.dependents.length === 0) {
						oThis.deleteFirstRecord = true;
						oThis.dependents.push({
							"ZZ_DEP_NAME": ""
						});
					}
					traveller.setData(oThis.traveller);
					dependents.setData(oThis.dependents);
					oThis.getView().setModel(oModel, "new");
					oThis.getView().setModel(traveller, "traveller");
					oThis.getView().setModel(dependents, "dependents");

					//	oThis.displayNext();
					//	oThis.getView().byId("iconTabBarId").setSelectedKey(oThis.getView().getId() + "--idIconTabFilter0");
					//TGG1hC
					//	sap.ui.project.e2etm.util.StaticUtility.getDocumentList(oThis, oData.ZZ_TRV_REQ, oData.ZZ_DEP_PERNR, 'INS', 'INSR', oData.ZZ_LAND1);
					//TGG1HC
					sap.ui.core.BusyIndicator.hide(0);
					oThis.TemplateCreation();
					oThis.edit_elements();
				},
				function (error) {
					sap.ui.core.BusyIndicator.hide(0);
					sap.m.MessageToast.show("No data found");
				});

		},
		getPassport: function (oData, sType) {
			var sTypeHR = com.bosch.hr.swift_trv.model.Common.mappingDependent(sType);
			if (sTypeHR === "") { //Self
				if (oData.ZZ_PASSPORT_NO === "N/A") {
					oData.ZZ_PASSPORT_NO = "";
				}
				return oData.ZZ_PASSPORT_NO;
			}
			//Dependent
			var iIndex = com.bosch.hr.swift_trv.model.Common.getArrayIndex(oData.EMPtoEMPDEPNDNT.results, "ZZ_DEP_TYP", sTypeHR);
			if (iIndex !== -1) {
				if (oData.EMPtoEMPDEPNDNT.results[iIndex].ZZ_PASSPORT_NO === "N/A") {
					oData.EMPtoEMPDEPNDNT.results[iIndex].ZZ_PASSPORT_NO = "";
				}
				return oData.EMPtoEMPDEPNDNT.results[iIndex].ZZ_PASSPORT_NO;
			}
			return "";
		},
		getVisaType: function (oData, sType) {
			var sTypeHR = com.bosch.hr.swift_trv.model.Common.mappingDependent(sType);
			if (sTypeHR === "") { //Self
				return oData.ZZ_CURR_VISA_TYP;
			}
			//Dependent
			var iIndex = com.bosch.hr.swift_trv.model.Common.getArrayIndex(oData.VISAPLANTOITEM.results, "ZZ_DEPNDT_TYP", sTypeHR);
			if (iIndex !== -1) {
				return oData.VISAPLANTOITEM.results[iIndex].ZZ_CURR_VISA_TYP;
			}
			return "";
		},

		getDOB: function (oData, sType) {
			var sTypeHR = com.bosch.hr.swift_trv.model.Common.mappingDependent(sType);
			if (sTypeHR === "") { //Self
				return oData.ZZ_DEP_DOB;
			}
			//Dependent
			var iIndex = com.bosch.hr.swift_trv.model.Common.getArrayIndex(oData.EMPtoEMPDEPNDNT.results, "ZZ_DEP_TYP", sTypeHR);
			if (iIndex !== -1) {
				return oData.EMPtoEMPDEPNDNT.results[iIndex].ZZ_DEP_DOB;
			}
			return "";
		},
		//	Initiate node for question in create scenario
		prepareQuestionData: function (oDetail, aQuestion) {
			oDetail.ZE2E_INS_ANS = [];
			for (var i = 0; i < aQuestion.results.length; i++) {
				var oQuestion = {
					ZZ_TRV_REQ: oDetail.ZZ_TRV_REQ,
					ZZ_TRV_KEY: oDetail.ZZ_TRV_KEY,
					ZZ_OWNER: oDetail.ZZ_DEP_PERNR,
					ZZ_VERSION: oDetail.ZZ_VERSION,
					ZZ_DEPNDT_TYP: oDetail.ZZ_DEPNDT_TYP,
					ZZ_QA_KEY: aQuestion.results[i].ZZ_QA_KEY
				};
				oDetail.ZE2E_INS_ANS.push(oQuestion);
			}
		},
		prepareInsuranceDetailData: function (oData, iIndex, iIndex1) {
			var oDetail = {
				ZZ_TRV_REQ: oData.ZZ_REINR,
				ZZ_TRV_KEY: oData.ZZ_TRV_TYP,
				ZZ_OWNER: oData.ZZ_DEP_PERNR,
				ZZ_VERSION: oData.ZZ_VERSION,
				ZZ_DEPNDT_TYP: oData.TRV_HDRtoTRV_travel_Data.results[iIndex].ZZ_ZSLFDPD,
				ZZ_DEP_NAME: this.getName(oData, oData.TRV_HDRtoTRV_travel_Data.results[iIndex].ZZ_ZSLFDPD),
				ZZ_DEP_GENDER: this.getGender(oData, oData.TRV_HDRtoTRV_travel_Data.results[iIndex].ZZ_ZSLFDPD),
				ZZ_VISA_TYPE: this.getVisaType(oData, oData.TRV_HDRtoTRV_travel_Data.results[iIndex].ZZ_ZSLFDPD),
				ZZ_DOB: this.getDOB(oData, oData.TRV_HDRtoTRV_travel_Data.results[iIndex].ZZ_ZSLFDPD),
				ZZ_PASSPORT: this.getPassport(oData, oData.TRV_HDRtoTRV_travel_Data.results[iIndex].ZZ_ZSLFDPD),
				ZZ_BEGDA: oData.TRV_HDRtoTRV_travel_Data.results[iIndex].ZZ_BEGDA,
				ZZ_INS_NO: oData.TRV_HDRtoTRV_travel_Data.results[iIndex].ZZ_INS_NO
			};

			if (oDetail.ZZ_TRV_KEY === "DEPU" && oDetail.ZZ_VISA_TYPE === "TOUR" && oDetail.ZZ_DEPNDT_TYP !== "00" &&
				oData.ZE2E_INS_HDR.ZZ_SPONSOR !== "X") {
				return undefined;
			}

			oDetail = this.setDPNDDetails(oDetail, oData);

			//Only one month for transfer
			if (sap.ui.getCore().getModel("global").getData().ZZ_TRV_CAT === "TRFR" &&
				sap.ui.getCore().getModel("global").getData().ZZ_DEP_TYPE === "INTL") {
				var sEndDate = oData.TRV_HDRtoTRV_travel_Data.results[iIndex1].ZZ_BEGDA;
				var dDate = new Date(sEndDate.substr(0, 4), sEndDate.substr(4, 2) - 1, sEndDate.substr(6, 2));
				dDate.setTime(dDate.getTime() + (parseInt(oData.DAYS, 10) * 1000 * 60 * 60 * 24));
				var yyyy = dDate.getFullYear().toString();
				var mm = (dDate.getMonth() + 1).toString(); // getMonth() is zero-based
				var dd = dDate.getDate().toString();
				oDetail.ZZ_ENDDA = yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]);
			} else {
				//			if( iIndex1 + 1 < oData.TRV_HDRtoTRV_travel_Data.results.length ){
				oDetail.ZZ_ENDDA = oData.TRV_HDRtoTRV_travel_Data.results[iIndex1].ZZ_BEGDA;
				//			}
			}

			return oDetail;
		},
		setDPNDDetails: function (oDetail, oData) {
			//if(oDetail.ZZ_VISA_TYPE == ""||oDetail.ZZ_VISA_TYPE ==" "||!(oDetail.ZZ_VISA_TYPE)){
			switch (oDetail.ZZ_TRV_KEY) {
			case "INFO":
			case "SECO":
			case "BUSR":
				if (oDetail.ZZ_DEPNDT_TYP === "00") {
					oDetail.ZZ_VISA_TYPE = "BUSR";
					oDetail.ZZ_PAY_TYP = "PBRB";
				} else {
					oDetail.ZZ_VISA_TYPE = "TOUR";
					oDetail.ZZ_PAY_TYP = " ";
				}
				break;
			case "DEPU":

				if (oData.ZE2E_INS_HDR.ZZ_SPONSOR === "X") {
					oDetail.ZZ_PAY_TYP = "PBRB";
				} else {
					if (oDetail.ZZ_DEPNDT_TYP === "00") {
						oDetail.ZZ_PAY_TYP = "PBRB";
					} else {
						oDetail.ZZ_PAY_TYP = "PBEM";
					}
				}
				break;
			}
			return oDetail;

		},

		onAfterRendering: function () {

			var Device = sap.ui.Device.system.desktop;

			if (Device === true || sap.ui.Device.system.tablet) {
				this.getView().byId("idTravellingTable").getInfoToolbar().setVisible(true);

				this.getView().byId("idTravellingColumn").setVisible(false);
			} else {
				this.getView().byId("idTravellingTable").getInfoToolbar().setVisible(false);

				this.getView().byId("idTravellingColumn").setVisible(true);
			}

		},

		prepareDataForCreation: function (oData, aQuestion) {
			oData.ZE2E_INS_HDR = {
				ZZ_ASG_TYP: sap.ui.getCore().getModel("global").getData().ZZ_ASG_TYP,
				ZZ_SPONSOR: sap.ui.getCore().getModel("global").getData().ZZ_SP_CMPNY,
				ZZ_TRV_REQ: oData.ZZ_REINR,
				ZZ_TRV_KEY: oData.ZZ_TRV_TYP,
				ZZ_OWNER: oData.ZZ_DEP_PERNR,
				ZZ_VERSION: oData.ZZ_VERSION,
				ZZ_INS_QUE: "X",
				ZZ_LAND1: oData.ZZ_LAND1
			};
			oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet = [];
			var i = 0;
			var j = 0;
			var ZZ_ZSLFDPD = '';

			for (i = 0; i < oData.TRV_HDRtoTRV_travel_Data.results.length; i++) {
				var check = 0;
				ZZ_ZSLFDPD = oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ZSLFDPD;

				// check if rei_detail array  already has this ZZ_ZSLFDPD or not
				if (oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet) {
					for (var n = 0; n < oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet.length; n++) {
						if (oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet[n].ZZ_DEPNDT_TYP === ZZ_ZSLFDPD) {
							check = 1;
							break;
						}
					}
				}
				//if still not have in array
				if (check === 0) {
					for (j = i + 1; j <= oData.TRV_HDRtoTRV_travel_Data.results.length; j++) {

						if (j === oData.TRV_HDRtoTRV_travel_Data.results.length) { // for the last element of array
							var oDetail = this.prepareInsuranceDetailData(oData, i, j - 1);
							if (oDetail) {
								this.prepareQuestionData(oDetail, aQuestion);
								oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet.push(oDetail);
								break;
							}
						} else {
							if (ZZ_ZSLFDPD === oData.TRV_HDRtoTRV_travel_Data.results[j].ZZ_ZSLFDPD) {
								//do nothing
							} else {
								oDetail = this.prepareInsuranceDetailData(oData, i, j - 1);
								if (oDetail) {
									this.prepareQuestionData(oDetail, aQuestion);
									oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet.push(oDetail);
									break;
								}
							}
						}

					}
				}

				//		}
			}
		},

		edit_elements: function () {

			this.getView().getModel("products").getData().editable = true;
			this.getView().getModel("products").refresh();
			this.rebindTable_T(this.oEditableTemplate_T, "Edit");

			setTimeout(function () {
				$(".sapMListTblSubCntRow").css("cssText", "display: block !important;");
				$(".sapMListTbl .sapMLabel").css("cssText", "width: auto !important;");
				$(".sapMListTblSubCntSpr").css("cssText", "display: None !important;");
			}, 100);
			var oObjectPage = this.getView().byId("ObjectPageLayout");
			oObjectPage.setShowFooter(true);

		},
		nonedit_elements: function () {

			this.getView().getModel("products").getData().editable = false;
			this.getView().getModel("products").refresh();
			this.rebindTable_T(this.oReadOnlyTemplate_T, "Navigation");

			var oObjectPage = this.getView().byId("ObjectPageLayout");
			oObjectPage.setShowFooter(false);

			setTimeout(function () {
				$(".sapMListTblSubCntRow").css("cssText", "display: -webkit-box !important;");
				$(".sapMListTbl .sapMLabel").css("cssText", "width: 7.8rem !important;");
				$(".sapMListTblSubCntSpr").css("cssText", "display: .5rem !important;");
				$(".sapUiContentPadding .sapMListTblSubCntRow").css("cssText", "display: block !important;");
				$(".sapUiContentPadding .sapMListTbl .sapMLabel").css("cssText", "width: auto !important;");
				$(".sapUiContentPadding .sapMListTblSubCntSpr").css("cssText", "display: None !important;");
			}, 1);

		},

		onEditToggleButtonPress: function () {
			var oObjectPage = this.getView().byId("ObjectPageLayout").getShowFooter();
			if (oObjectPage === true) {
				this.nonedit_elements();
			} else {
				this.edit_elements();
			}
		},
		validateQuestion: function () {
			var oCarousel = this.getView().byId("carouselQuestionId");
			for (var i = 0; i < oCarousel.getPages().length; i++) {
				var oSelectedPage = oCarousel.getPages()[i];
				var oTable = oSelectedPage.getItems()[1].getContent()[0];
				for (var j = 0; j < oTable.getItems().length; j++) {
					var oRadio = oTable.getItems()[j].getCells()[1];
					var oText = oTable.getItems()[j].getCells()[2];
					if (oRadio.getProperty("selectedIndex") === 2) { //Not selected yet
						oRadio.setValueState("Error");
						if (sap.ui.getCore().getModel("profile").getData().currentRole === "EMP") {
							this.displayNext();
						}
						oCarousel.setActivePage(oSelectedPage);
						oCarousel.focus();
						return "Please select the answer !";
					} else { //Already selected
						if (oRadio.getProperty("selectedIndex") === 0 &&
							oText.getValue().trim() === "") { //Answer = YES and no comment
							oText.setValueState("Error");
							if (sap.ui.getCore().getModel("profile").getData().currentRole === "EMP") {
								this.displayNext();
							}
							oCarousel.setActivePage(oSelectedPage);
							oCarousel.focus();
							return "Please enter comment !";
						} else {
							oText.setValueState("None");
						}
						oRadio.setValueState("None");
					}
				}
			}
		},
		displayNext: function () {
			sap.ui.getCore().getModel("profile").getData().currentRole = "EMP";
			if (sap.ui.getCore().getModel("global").getData().action === "02") { //Open
				this.getView().byId("btnSave").setVisible(false);
				this.getView().byId("btnSubmit").setVisible(false);
				//start of change_dye5kor
				if (this.getView().getModel("new").getData().ZE2E_REQ_STATUS.ZZ_REASON === "5") {
					this.getView().byId("btnSubmit").setVisible(true);
					this.getView().byId("btnSubmit").setText("Close");
				}
				//end of change_dye5kor
			} else {
				this.getView().byId("btnNext").setVisible(sap.ui.getCore().getModel("profile").getData().currentRole === "EMP");
				this.getView().byId("btnSave").setVisible(sap.ui.getCore().getModel("profile").getData().currentRole === "EMP");
				if (sap.ui.getCore().getModel("profile").getData().currentRole === "EMP") {
					this.getView().byId("btnSubmit").setVisible(false);
				} else {
					this.getView().byId("btnSubmit").setVisible(true);
				}
			}
		},
		validateConfirmCheckBox: function (sAction) {
			sap.ui.getCore().getModel("profile").getData().currentRole = "EMP";
			if (sap.ui.getCore().getModel("profile").getData().currentRole === "EMP" && sAction === '01') {
				if (!this.getView().byId("confirmCheckboxId").getSelected()) {
					this.getView().byId("confirmCheckboxId").focus();
					return "Please check on 'I have read and understood the above statement'";
				}
			}
			return "";
		},
		doValidation: function (sAction) {
			var sError = "";
			sError = this.validateQuestion();
			if (sError !== "" && sError !== undefined) {
				sap.m.MessageToast.show(sError);
				return sError;
			}
			sError = this.validateConfirmCheckBox(sAction);
			if (sError !== "" && sError !== undefined) {
				sap.m.MessageToast.show(sError);
				return sError;
			}
			return "";
		},
		////////////////////############################ Save Insurance ########################//////////////////////////////
		onSaveInsurance: function () {

			var sError = this.doValidation();
			if (sError === "") {
				/*this.getModel().setHeaders({
					role: "01",
					action: "00"
				});*/
				this.sendPostRequest("00");
			} else {
				MessageBox.error(sError);
				return;
			}

			this.getView().getModel("products").getData().editable = false;
			this.getView().getModel("products").refresh();
			setTimeout(function () {
				$(".sapMListTblSubCntRow").css("cssText", "display: -webkit-box !important;");
				$(".sapMListTbl .sapMLabel").css("cssText", "width: 7.5rem !important;");
				$(".sapMListTblSubCntSpr").css("cssText", "display: .5rem !important;");
			}, 100);
			var oObjectPage = this.getView().byId("ObjectPageLayout");
			oObjectPage.setShowFooter(false);
			this.rebindTable_T(this.oReadOnlyTemplate_T, "Navigation");

		},
		onSubmitPress: function (oEvent) {
			var sError = this.doValidation("01");
			var oRole = "";
			if (sError === "") {
				if (sap.ui.getCore().getModel("profile").getData().currentRole === "EMP") {
					oRole = "01";
				} else { //Admin
					oRole = "03";
				}
				/*this.getModel().setHeaders({
					role: oRole,
					action: "01"
				});*/
				this.doSubmit(oEvent);
			}
		},
		doSubmit: function (oEvent) {
			if (sap.ui.getCore().getModel("profile").getData().currentRole === "EMP") {
				var sTitle = "Kindly attach a copy of Tickets with this request  if not attached yet. ";
			} else {
				sTitle = "Do you want to submit the request ?";
			}
			var oThis = this;
			var dialog = new sap.m.Dialog({
				title: "Confirm",
				type: "Message",
				content: [
					new sap.m.Text({
						text: sTitle
					}),
					new sap.m.TextArea("submitDialogTextarea", {
						width: "100%",
						placeholder: "Comment (Optional)"
					})
				],
				beginButton: new sap.m.Button({
					text: "Submit",
					enabled: true,
					press: function () {
						var sText = sap.ui.getCore().byId("submitDialogTextarea").getValue();
						var oData = oThis.getView().getModel("new").getData();
						oData.ZE2E_INS_HDR.ZZ_COMMENTS = sText;
						oThis.getView().getModel("new").setData(oData);
						oThis.sendPostRequest("01");
						dialog.close();
					}
				}),
				endButton: new sap.m.Button({
					text: "Cancel",
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});

			dialog.open();
		},
		sendPostRequest: function (sAction) {
			var that = this;
			sap.ui.core.BusyIndicator.show(-1);
			var oData = this.getView().getModel("new").getData().ZE2E_INS_HDR;
			//start of change_dye5kor
			if (sAction !== "00" && sAction !== "01") {
				if (oData.ZE2E_REQ_STATUS.ZZ_REASON === "5") {
					oData.ZE2E_REQ_STATUS.ZZ_REASON = "6";
				}
			}
			this.oDataModel.create("/ZE2E_INS_HDRSet", oData, {
				success: jQuery.proxy(function (mResponse) {
					if (sAction === "00") { //Save
						MessageBox.success("The request has been saved.");
					} else {
						MessageBox.success("The request has been submitted.");
					}
					sap.ui.core.BusyIndicator.hide();
					var sNextLayout = that.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
					that.oRouter.navTo("master", {
						layout: sNextLayout
					});
					
				}, this),
				error: jQuery.proxy(function () {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error("The request has failed.");
				}, this)
			}, true);
		},
		onCancel: function () {
			var oObjectPage = this.getView().byId("ObjectPageLayout"),
				bCurrentShowFooterState = oObjectPage.getShowFooter();
			oObjectPage.setShowFooter(false);
			this.rebindTable_T(this.oReadOnlyTemplate_T, "Navigation");
		},
		_onProductMatched: function (oEvent) {
			this._product = oEvent.getParameter("arguments").product || this._product || "0";
			this.getView().bindElement({
				path: "/ProductCollection/" + this._product,
				model: "products"
			});
		},
		onNextPress: function (oEvent) {
			var sError = this.doValidation();
			if (sError === "") {
				if (this.getView().byId("iconTabBarId").getSelectedKey() !== "Confirm") {
					this.getView().byId("iconTabBarId").setSelectedKey("Confirm");
					this.displaySubmit();
				} else {
					this.displayNext();
				}
			} else {
				sap.m.MessageToast.show(sError);
			}
		},
		displaySubmit: function () {
			if (sap.ui.getCore().getModel("global").getData().action === "02") {
				this.getView().byId("btnNext").setVisible(false);
				this.getView().byId("btnSave").setVisible(false);
				this.getView().byId("btnSubmit").setVisible(false);
			} else {
				this.getView().byId("btnNext").setVisible(false);
				this.getView().byId("btnSave").setVisible(true);
				this.getView().byId("btnSubmit").setVisible(true);
			}
		},
		handleFullScreen: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.oRouter.navTo("detail", {
				layout: sNextLayout,
				product: this._product
			});
		},

		handleExitFullScreen: function () {
			if (this._product === undefined) {
				this._product = 0;
			}
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
			this.oRouter.navTo("detail", {
				layout: sNextLayout,
				product: this._product,
				reqNo: this.reqNo
			});
		},

		handleClose: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
			this.oRouter.navTo("master", {
				layout: sNextLayout
			});
			this.rebindTable_T(this.oReadOnlyTemplate_T, "Navigation");
		},

		onExit: function () {
		//	this.oRouter.getRoute("master").detachPatternMatched(this._onProductMatched, this);
		//	this.oRouter.getRoute("detail").detachPatternMatched(this._onProductMatched, this);
		},
		onComnetButtonPress: function () {
			var oCommentDialog = sap.ui.xmlfragment("com.bosch.hr.swift_trv.fragments.common.Comments", this);
			this.getView().addDependent(oCommentDialog);
			oCommentDialog.open();
		},
		pressDecline: function (oEvent) {
			oEvent.getSource().getParent().getParent().close();
			oEvent.getSource().getParent().getParent().destroy();
		},
		onFileUpload: function (oEvent) {
			var oData = oEvent.getSource().getParent().getModel("new").getData();
			var oFile = oEvent.getParameters("files").files[0];
			com.bosch.hr.swift_trv.model.Common.uploadCollectionFile(this, oData, oFile, this.reqNo, this.Pernr, "INS", this.oDataModel);
		},
		onFileDeleted: function (oEvent) {
			// prepare FileName
			var sFileName = oEvent.getParameters("item").item.getFileName();
			var oData = oEvent.getSource().getParent().getModel("new").getData();
			/*com.bosch.hr.swift_trv.model.Common.deleteUploadCollectionFile(oData, oEvent, oData.ZZ_TRV_REQ, sFileName, "INS", oData.ZZ_DEP_PERNR,
				0,this.oDataModel);
				*/
			com.bosch.hr.swift_trv.model.Common.deleteUploadCollectionFile(this, oEvent, oData.ZZ_TRV_REQ, sFileName, "INS", oData.ZZ_DEP_PERNR,
				0, this.oDataModel);

		},
		onUploadComplete: function (oEvent) {
			this.getView().getModel("new").refresh(true);
		}

	});

});