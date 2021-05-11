sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/bosch/hr/swift_trv/model/formatter",
	"sap/m/MessageBox",
	"sap/m/PDFViewer"
], function (Controller, formatter, MessageBox, PDFViewer) {
	"use strict";

	return Controller.extend("com.bosch.hr.swift_trv.controller.Ticketing", {
		formatter: formatter,
		onInit: function () {
			this.oOwnerComponent = this.getOwnerComponent();

			this.oRouter = this.oOwnerComponent.getRouter();
			this.oModel = this.oOwnerComponent.getModel();

			this.oRouter.getRoute("Ticketing").attachPatternMatched(this._onProductMatched, this);
			//	this.nonedit_Elements();
		},
		_onProductMatched: function (oEvent) {
			var that = this;
			sap.ui.core.BusyIndicator.show(-1);
			this.sServiceUrl = "/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/";
			this.oDataModel = new sap.ui.model.odata.ODataModel(this.sServiceUrl);
			this._product = oEvent.getParameter("arguments").product || this._product || "0";
			this.reqNo = oEvent.getParameter("arguments").reqNo;
			var profile = sap.ui.getCore().getModel("profile").getData();

			this.Perner = profile.employeeDetail.ZZ_DEP_PERNR;
			this.level = profile.employeeDetail.ZZ_DEP_LEVEL;
			//	this.Perner = "00001095"; // to remove
			//	this.level = "51"; /// to remove

			var tckUrl = "TicketWorklistSet()?$filter=LoginRole eq 'EMP' and EmpNo eq '" + this.Perner +
				"'" + " and TravelType eq 'BUSR' and TravelPlan eq '" + this.reqNo + "'&$format=json";
			this.oDataModel.read(tckUrl, null, null, true,
				function (oData, response) {
					var result = JSON.parse(response.body);
					if (result.d.results.length !== 0) {
						var ticket = result.d.results[0];
						var model = new sap.ui.model.json.JSONModel();
						model.setData(ticket);
						that.getView().setModel(model, "ticketModel");
					} else {
						ticket = {};
						model = new sap.ui.model.json.JSONModel();
						model.setData(ticket);
						that.getView().setModel(model, "ticketModel");
					}
					//	that.createPdf();
					that.fetchGeneralData();
					that.setProperties();
				},
				function (error) {
					sap.m.MessageToast.show("Internal Server Error");
					sap.ui.core.BusyIndicator.hide();
				});
		},
		onAfterRendering: function () {
			var Device = sap.ui.Device.system.desktop;
			if (Device === true) {
				this.getView().byId("txtarea5").setValue("");
				this.getView().byId("txtarea5").setWidth("30%");
			}
			this.nonedit_Elements();
		},
		onExpandPdf: function () {
			this.createPdf();
		},
		createPdf: function () {
			//	var html = sap.ui.getCore().byId("html1");
			var ticket = this.getView().getModel("ticketModel").getData();
			var fileUrl;
			if (window.location.hostname == "localhost")
				fileUrl = "proxy/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/TravelPdfSet(EmpNo='" + ticket.EmpNo + "',TrNo='" + ticket.TravelPlan +
				"',TrvKey='" + ticket.TravelType + "',Module='REQ')/$value";
			else
				fileUrl = "/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/TravelPdfSet(EmpNo='" + ticket.EmpNo + "',TrNo='" + ticket.TravelPlan +
				"',TrvKey='" + ticket.TravelType + "',Module='REQ')/$value";
			///// Set to Html Content
			/*  
						html.setContent(" ");
						html.setContent("<div><object data=\""
								+ fileUrl
								+ "\" type=\"application/pdf\" width=\"100%\" height=\"1250px\"></object></div>");*/
			///// Using PDF Viewer				
			/*var opdfViewer = new PDFViewer();
			this.getView().addDependent(opdfViewer);
			var sServiceURL = this.getView().getModel().sServiceUrl;
			var sSource = fileUrl;
			opdfViewer.setSource(sSource);
			opdfViewer.setTitle( "TravelPlan PDF");
			opdfViewer.open();	*/

			window.open(fileUrl);
		},
		fetchGeneralData: function () {
			var oThis = this;
			var fileModel = new sap.ui.model.json.JSONModel();
			fileModel.setData({
				Files: []
			});
			this.getView().setModel(fileModel, "new");
			var ticket = oThis.getView().getModel("ticketModel").getData();
			if (ticket.AgreeToPay === 'X') {
				oThis.getView().byId("c5").setSelected(true);
			} else {
				oThis.getView().byId("c5").setSelected(false);
			}
			var batchOperation3 = oThis.oDataModel.createBatchOperation(
				"DmsDocsSet?$filter=DepReq+eq+'" + ticket.TravelPlan + "'+and+EmpNo+eq+'" + ticket.EmpNo + "'+and+Module+eq+'TCKT'" +
				"+and+Country+eq+'" + ticket.ToCountry + "'", "GET");
			var tpno = ticket.TravelPlan;
			var batchOperation4 = oThis.oDataModel.createBatchOperation(
				"DmsDocsSet?$filter=DepReq+eq+'" + tpno + "'+and+EmpNo+eq+'" + ticket.EmpNo + "'+and+DocType+eq+'TCK'", "GET");
			var batchOperation5 = oThis.oDataModel.createBatchOperation(
				"TravelItenarySet?$filter=Pernr+eq+'" + ticket.EmpNo + "'+and+TravelPlan+eq+'" + ticket.TravelPlan + "'+and+Trvltype+eq+'" +
				ticket.TravelType + "'", "GET");
			var batchOperation6 = oThis.oDataModel.createBatchOperation(
				"TicketingCommSet?$filter=Pernr+eq+'" + ticket.EmpNo + "'+and+Reinr+eq+'" + ticket.TravelPlan + "'+and+Trvky+eq+'" + ticket.TravelType +
				"'", "GET");
			///############ UCD1KOR 18 May 2020 Passport Copy changes ##########//////
			var batchOperation7 = oThis.oDataModel.createBatchOperation("DmsDocsSet?$filter=DepReq+eq+'999999999'+and+EmpNo+eq+'" + this.Perner +
				"'+and+DocType+eq+'PS'", "GET");
			oThis.oDataModel.addBatchReadOperations([batchOperation3, batchOperation4, batchOperation5, batchOperation6, batchOperation7]);
			oThis.oDataModel.submitBatch(
				function (oResult) {
					try {
						//attachments
						oThis.getView().byId("UploadCollection").aItems = [];
						var filesAll = $.merge(oResult.__batchResponses[0].data.results,
							oResult.__batchResponses[1].data.results);
						//#######UCD1KOR 18 May 2020 Passport Copy added########////////
						var passportCopy = oResult.__batchResponses[4].data.results;
						filesAll.unshift(passportCopy[passportCopy.length - 1]);
						var uploadData = oThis.getView().getModel("new").getData();
						uploadData.Files = filesAll;
						oThis.getView().getModel("new").setData(uploadData);
						oThis.getView().getModel("new").refresh(true);

						var Option1Array = [];
						var Option2Array = [];
						var Option3Array = [];
						var Option4Array = [];

						for (var i = 0; i < oResult.__batchResponses[2].data.results.length; i++) {

							if (oResult.__batchResponses[2].data.results[i].Seqno === "1") {
								Option1Array.push(oResult.__batchResponses[2].data.results[i]);
								var itenaryModel = new sap.ui.model.json.JSONModel();
								itenaryModel.setData({
									collection1: Option1Array[Option1Array.length - 1]
								});
								oThis.getView().setModel(itenaryModel, "itenary1");

								if (oResult.__batchResponses[2].data.results[i].Options === "X") {
									oThis.getView().byId("c1").setSelected(true);
									oThis.getView().byId("idTicketingAmount").setText(oResult.__batchResponses[2].data.results[i].Tfare + " " + "INR");
									//objhdr.setNumber(oResult.__batchResponses[2].data.results[i].Tfare);
									var status = oThis.getView().byId("status1");
									status.setNumber("Option1");
								} else {
									oThis.getView().byId("c1").setSelected(false);
								}

							} else if (oResult.__batchResponses[2].data.results[i].Seqno === "2") {
								Option2Array.push(oResult.__batchResponses[2].data.results[i]);
								itenaryModel = new sap.ui.model.json.JSONModel();
								if (oResult.__batchResponses[2].data.results[i].Optionpnr === "")
									oResult.__batchResponses[2].data.results[i].Optionpnr = "No PNR";
								itenaryModel.setData({
									collection2: Option2Array[Option2Array.length - 1]
								});
								oThis.getView().setModel(itenaryModel, "itenary2");

								if (oResult.__batchResponses[2].data.results[i].Options === "X") {
									oThis.getView().byId("c2").setSelected(true);
									//	objhdr.setNumber(oResult.__batchResponses[2].data.results[i].Tfare);
									oThis.getView().byId("idTicketingAmount").setText(oResult.__batchResponses[2].data.results[i].Tfare + " " + "INR");
									status = oThis.getView().byId("status1");
									status.setNumber("Option2");
								} else {
									oThis.getView().byId("c2").setSelected(false);
								}

							} else if (oResult.__batchResponses[2].data.results[i].Seqno === "3") {
								Option3Array.push(oResult.__batchResponses[2].data.results[i]);
								itenaryModel = new sap.ui.model.json.JSONModel();
								if (oResult.__batchResponses[2].data.results[i].Optionpnr === "")
									oResult.__batchResponses[2].data.results[i].Optionpnr = "No PNR";
								itenaryModel.setData({
									collection3: Option3Array[Option3Array.length - 1]
								});
								oThis.getView().setModel(itenaryModel, "itenary3");

								if (oResult.__batchResponses[2].data.results[i].Options === "X") {
									oThis.getView().byId("c3").setSelected(true);
									//		objhdr.setNumber(oResult.__batchResponses[2].data.results[i].Tfare);
									oThis.getView().byId("idTicketingAmount").setText(oResult.__batchResponses[2].data.results[i].Tfare + " " + "INR");
									status = oThis.getView().byId("status1");
									status.setNumber("Option3");
								} else {
									oThis.getView().byId("c3").setSelected(false);
								}
							} else if (oResult.__batchResponses[2].data.results[i].Seqno === "4") {
								Option4Array.push(oResult.__batchResponses[2].data.results[i]);
								itenaryModel = new sap.ui.model.json.JSONModel();
								itenaryModel.setData({
									collection4: Option4Array[Option4Array.length - 1]
								});
								oThis.getView().setModel(itenaryModel, "itenary4");

								if (oResult.__batchResponses[2].data.results[i].Options === "X" && oResult.__batchResponses[2].data.results[i].Seqno === "4") {
									status = oThis.getView().byId("status1");
									status.setNumber("Option4");
									//	objhdr.setNumber(oResult.__batchResponses[2].data.results[i].Tfare);
									oThis.getView().byId("idTicketingAmount").setText(oResult.__batchResponses[2].data.results[i].Tfare + " " + "INR");
									oThis.getView().byId("c4").setSelected(true);
									oThis.getView().byId("c5").setVisible(true);
									oThis.getView().byId("c4").setVisible(true);
									oThis.getView().byId("idOption4Panel").setVisible(true);
								} else {
									oThis.getView().byId("c5").setVisible(false);
									oThis.getView().byId("c4").setSelected(false);
									oThis.getView().byId("idOption4Panel").setVisible(false);
								}

							}
						}
						//////////#########Comments ################///////////////
						var commentsModel = new sap.ui.model.json.JSONModel();
						commentsModel.setData(oResult.__batchResponses[3].data.results);
						oThis.getView().setModel(commentsModel, "Comments");
						oThis.Tfare1 = oThis.getView().getModel("itenary1").getData().collection1.Tfare;
						oThis.Tfare2 = oThis.getView().getModel("itenary2").getData().collection2.Tfare;
						oThis.Tfare3 = oThis.getView().getModel("itenary3").getData().collection3.Tfare;
						oThis.Tfare4 = oThis.getView().getModel("itenary4").getData().collection4.Tfare;
						if (oThis.Tfare1 === "" || oThis.Tfare1 === undefined) {
							oThis.Tfare1 = "0.00";
						}
						if (oThis.Tfare2 === "" || oThis.Tfare2 === undefined) {
							oThis.Tfare2 = "0.00";
						}
						if (oThis.Tfare3 === "" || oThis.Tfare3 === undefined) {
							oThis.Tfare3 = "0.00";
						}
						if (oThis.Tfare4 === "" || oThis.Tfare4 === undefined) {
							oThis.Tfare4 = "0.00";
						}
						oThis.AChargeAmt1 = oThis.getView().getModel("itenary1").getData().collection1.AChargeAmt;
						oThis.AChargeAmt2 = oThis.getView().getModel("itenary2").getData().collection2.AChargeAmt;
						oThis.AChargeAmt3 = oThis.getView().getModel("itenary3").getData().collection3.AChargeAmt;
						oThis.AChargeAmt4 = oThis.getView().getModel("itenary4").getData().collection4.AChargeAmt;
						if (oThis.AChargeAmt4 === undefined || oThis.AChargeAmt4 === "") {
							oThis.AChargeAmt4 = "0.00";
						}
						if (oThis.AChargeAmt1 === undefined || oThis.AChargeAmt1 === "") {
							oThis.AChargeAmt1 = "0.00";
						}
						if (oThis.AChargeAmt2 === undefined || oThis.AChargeAmt2 === "") {
							oThis.AChargeAmt2 = "0.00";
						}
						if (oThis.AChargeAmt3 === undefined || oThis.AChargeAmt3 === "") {
							oThis.AChargeAmt3 = "0.00";
						}
						if (ticket.RequestAppr === 'X') {
							sap.ui.getCore().byId("switch").setState(true);
						} else {
							sap.ui.getCore().byId("switch").setState(false);
						}
						sap.ui.core.BusyIndicator.hide();
					} catch (err) {
						sap.ui.core.BusyIndicator.hide();
					}
				},
				function (error) {
					sap.ui.core.BusyIndicator.hide();
				}, true);

		},
		onCheckBoxSelect: function (evt) {
			var checkBox1 = this.getView().byId("c1");
			var checkBox2 = this.getView().byId("c2");
			var checkBox3 = this.getView().byId("c3");
			var checkBox4 = this.getView().byId("c4");
			if (evt.getSource().getText() === "Option 1" && checkBox1.getSelected() === true) {
				checkBox2.setSelected(false);
				checkBox3.setSelected(false);
				checkBox4.setSelected(false);
			} else if (evt.getSource().getText() === "Option 2" && checkBox2.getSelected() === true) {
				checkBox1.setSelected(false);
				checkBox3.setSelected(false);
				checkBox4.setSelected(false);
			} else if (evt.getSource().getText() === "Option 3" && checkBox3.getSelected() === true) {
				checkBox2.setSelected(false);
				checkBox1.setSelected(false);
				checkBox4.setSelected(false);
			} else if (evt.getSource().getText() === "Option 4" && checkBox4.getSelected() === true) {
				checkBox2.setSelected(false);
				checkBox3.setSelected(false);
				checkBox1.setSelected(false);
			}
		},
		setProperties: function () {
			var oThis = this;
			var profile = sap.ui.getCore().getModel("profile").getData();
			var ticket = oThis.getView().getModel("ticketModel").getData();
			oThis.getView().byId("sendback").setVisible(false);
			oThis.getView().byId("accept").setVisible(false);
			profile.currentRole = "EMP";
			if (profile.currentRole === "EMP" && ticket.Role === "03" &&
				(ticket.Action === "10" || ticket.Action === "02")) {
				oThis.getView().byId("empinfo").setVisible(true);
			} else {
				oThis.getView().byId("empinfo").setVisible(false);
			}

			var properties = {};

			if (profile.currentRole === "EMP") {
				properties = {
					txteditable: false,
					radeditable: true,
					swteditable: false,
					comtxteditbl: true
				};
				oThis.getView().byId("c4").setVisible(false);
				oThis.getView().byId("idOption4Panel").setVisible(false);
			} else {
				properties = {
					txteditable: true,
					radeditable: false,
					swteditable: true,
					comtxteditbl: true
				};
				oThis.getView().byId("idOption4Panel").setVisible(true);
				oThis.getView().byId("c4").setVisible(true);
				oThis.getView().byId("empinfo").setVisible(false);
			}
			//		Accept						
			if (ticket.Action === "12") {
				properties = {
					txteditable: false,
					radeditable: false,
					chkeditable: false,
					swteditable: false,
					comtxteditbl: false
				};
			}
			var propertyModel = new sap.ui.model.json.JSONModel();
			propertyModel.setData(properties);
			oThis.getView().setModel(propertyModel, "properties");
			var nxtAction = ticket.EmpNo;
			if (nxtAction === ticket.NextAction) {
				switch (ticket.Action) {
				case "10":
					oThis.getView().byId("sendback").setVisible(true);
					oThis.getView().byId("accept").setVisible(true);
					break;

				case "02":
					oThis.getView().byId("sendback").setVisible(true);
					oThis.getView().byId("accept").setVisible(true);
					break;

				case "":
				}
			}
		},
		nonedit_Elements: function () {
			var objPage = this.getView().byId("idTicketPage");
			objPage.removeAllBlocks();
			objPage.addBlock(sap.ui.xmlfragment("com.bosch.hr.swift_trv.fragments.ticketing.DisplayTicketForm", this));
			var oObjectPage = this.getView().byId("ObjectPageTicketLayout");
			oObjectPage.setShowFooter(true);
			var check = this.getView().byId("idOption1Panel").getContent().length;
			if (check === "" || check === undefined || check === 0) {
				this.getView().byId("idOption1Panel").addContent(sap.ui.xmlfragment(
					"com.bosch.hr.swift_trv.fragments.ticketing.DisplayTicketDetailsOptionsForm1", this));
				this.getView().byId("idOption2Panel").addContent(sap.ui.xmlfragment(
					"com.bosch.hr.swift_trv.fragments.ticketing.DisplayTicketDetailsOptionsForm2", this));
				this.getView().byId("idOption3Panel").addContent(sap.ui.xmlfragment(
					"com.bosch.hr.swift_trv.fragments.ticketing.DisplayTicketDetailsOptionsForm3", this));
				this.getView().byId("idOption4Panel").addContent(sap.ui.xmlfragment(
					"com.bosch.hr.swift_trv.fragments.ticketing.DisplayTicketDetailsOptionsForm4", this));
			}
			setTimeout(function () {
				$(".sapMListTblSubCntRow").css("cssText", "display: -webkit-box !important;");
				$(".sapMListTbl .sapMLabel").css("cssText", "width: 7.8rem !important;");
				$(".sapMListTblSubCntSpr").css("cssText", "display: .5rem !important;");
			}, 100);
		},
		edit_Elements: function () {

			var objPage = this.byId("idTicketPage");
			objPage.removeAllBlocks();
			objPage.addBlock(sap.ui.xmlfragment("com.bosch.hr.swift_trv.fragments.ticketing.ChangeTicket", this));
			this.destroy();
			setTimeout(function () {
				$(".sapMListTblSubCntRow").css("cssText", "display: block !important;");
				$(".sapMListTbl .sapMLabel").css("cssText", "width: auto !important;");
				$(".sapMListTblSubCntSpr").css("cssText", "display: None !important;");
			}, 100);

		},
		handleFullScreen: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.oRouter.navTo("detail", {
				layout: sNextLayout,
				product: this._product,
				reqNo: this.reqNo
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
		////////######################### Sendback ###########################////////////////////////
		onPressSendBack: function () {
			var that = this;
			var txtarea5 = that.getView().byId("txtarea5").getValue();
			if (txtarea5 === "") {
				MessageBox.error("Please provide comments");
				that.getView().byId("txtarea5").setValueState("Error");
			} else {
				sap.m.MessageBox.confirm("Are you sure you want to send back?", {
					icon: MessageBox.Icon.INFORMATION,
					title: "Success",
					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
					onClose: function (oAction) {
						if (oAction === "YES") {
							var val = "SendBack";
							that.onSaveAccept(val);
						}
					}
				});
			}
		},
		//////////####################### Post Call for SendBack and Accept ####################/////////////////
		onSaveAccept: function (action) {
			sap.ui.core.BusyIndicator.show(-1);
			var oThis = this;
			var profileData = sap.ui.getCore().getModel("profile").getData();
			var role = profileData.currentRole;
			var txtarea1 = sap.ui.getCore().byId("txtarea1").getText();
			var txtarea2 = sap.ui.getCore().byId("txtarea2").getText();
			var txtarea3 = sap.ui.getCore().byId("txtarea3").getText();
			var txtarea4 = sap.ui.getCore().byId("txtarea4").getText();

			var txtarea5 = oThis.getView().byId("txtarea5").getValue();
			//var t1 = sap.ui.getCore().byId("t1").getValue();
			var t2 = sap.ui.getCore().byId("t2").getText();
			//	var t3 = sap.ui.getCore().byId("t3").getValue();
			var t4 = sap.ui.getCore().byId("t4").getText();
			//	var t5 = sap.ui.getCore().byId("t5").getValue();
			var t6 = sap.ui.getCore().byId("t6").getText();
			//	var t7 = sap.ui.getCore().byId("t7").getValue();
			var t8 = sap.ui.getCore().byId("t8").getText();
			//	var t9 = sap.ui.getCore().byId("t9").getValue();
			var t10 = sap.ui.getCore().byId("t10").getText();
			//	var t11 = sap.ui.getCore().byId("t11").getValue();
			var t12 = sap.ui.getCore().byId("t12").getText();
			//	var t13 = sap.ui.getCore().byId("t13").getValue();
			var t14 = sap.ui.getCore().byId("t14").getText();
			//	var t15 = sap.ui.getCore().byId("t15").getValue();
			var t16 = sap.ui.getCore().byId("t16").getText();
			var t17 = sap.ui.getCore().byId("t17").getText();
			var ch1Value = sap.ui.getCore().byId("ch1Value").getText();
			try {
				var ch1 = oThis.getView().getModel("itenary1").getData().colletion1.AddCharge;
			} catch (err) {
				ch1 = "";
			}
			var ch2Value = sap.ui.getCore().byId("ch2Value").getText();
			try {
				var ch2 = oThis.getView().getModel("itenary2").getData().collection2.AddCharge;
			} catch (err) {
				ch2 = "";
			}
			var ch3Value = sap.ui.getCore().byId("ch3Value").getText();
			try {
				var ch3 = oThis.getView().getModel("itenary3").getData().collection3.AddCharge;
			} catch (err) {
				ch3 = "";
			}
			var ch4Value = sap.ui.getCore().byId("ch4Value").getText();
			try {
				var ch4 = oThis.getView().getModel("itenary4").getData().collection4.AddCharge;
			} catch (err) {
				ch4 = "";
			}
			var Comments = oThis.getView().byId("txtarea5").getValue();
			// Conditions are mandatory
			if (Comments !== "") {

				var c1, c2, c3, c4, c5;
				if (oThis.getView().byId("c1").getSelected()) {
					c1 = "X";
				} else {
					c1 = "";
				}
				if (oThis.getView().byId("c2").getSelected()) {
					c2 = "X";
				} else {
					c2 = "";
				}
				if (oThis.getView().byId("c3").getSelected()) {
					c3 = "X";
				} else {
					c3 = "";
				}
				if (oThis.getView().byId("c4").getSelected()) {
					c4 = "X";
				} else {
					c4 = "";
				}
				if (oThis.getView().byId("c5").getSelected()) {
					c5 = "X";
				} else {
					c5 = "";
				}
				if (t17 === "") {
					t17 = 0.00;
				}
				if (t2 === "") {
					t2 = 0.00;
				}
				if (t6 === "") {
					t6 = 0.00;
				}
				if (t10 === "") {
					t10 = 0.00;
				}
				if (t14 === "") {
					t14 = 0.00;
				}
				var ticket = oThis.getView().getModel("ticketModel").getData();
				var result = {};
				result.Pernr = ticket.EmpNo;
				result.TravelPlan = ticket.TravelPlan;
				result.Trvltype = ticket.TravelType;
				result.Ryamt = t17; // t17;
				result.Ryamc = "";
				result.Comments = txtarea5;

				result.Appry = "";
				result.Agrpy = "";
				result.Status = "";
				result.Rfamt = "0.00";
				result.Rfamc = "";
				result.Vresn = ticket.VersionReason;
				result.Tckno = ticket.Tckno;
				result.Dummy = ticket.Dummy;
				result.Rtdat = ticket.Rtdat;

				if (action === "Accept") {
					result.Action = "11";
					result.Role = "01";
				} else if (action === "SendBack") {
					result.Action = "02";
					if (role === "EMP")
						result.Role = "01";
					else
						result.Role = "03";
				}
				result.TravelItenarySet = [];
				result.TravelItenarySet.push({
					Pernr: ticket.EmpNo,
					TravelPlan: ticket.TravelPlan,
					Trvltype: ticket.TravelType,
					Optiontxt: txtarea1,
					Optionpnr: "",
					Tfare: t2,
					Tlimit: "",
					Spnotes: t4,
					Options: c1,
					AddCharge: ch1,
					AChargeAmt: ch1Value,
					Tfarec: "",
					Seqno: "1"
				});

				result.TravelItenarySet.push({
					Pernr: ticket.EmpNo,
					TravelPlan: ticket.TravelPlan,
					Trvltype: ticket.TravelType,
					Optiontxt: txtarea2,
					Optionpnr: "",
					Tfare: t6,
					Tlimit: "",
					Spnotes: t8,
					Options: c2,
					AddCharge: ch2,
					AChargeAmt: ch2Value,
					Tfarec: "",
					Seqno: "2"
				});

				result.TravelItenarySet.push({
					Pernr: ticket.EmpNo,
					TravelPlan: ticket.TravelPlan,
					Trvltype: ticket.TravelType,
					Optiontxt: txtarea3,
					Optionpnr: "",
					Tfare: t10,
					Tlimit: "",
					Spnotes: t12,
					Options: c3,
					AddCharge: ch3,
					AChargeAmt: ch3Value,
					Tfarec: "",
					Seqno: "3"
				});

				if (c4 === "X") {
					var switchState;
					var switch1 = sap.ui.getCore().byId("switch");
					if (switch1.getState())
						switchState = "X";
					else
						switchState = "";
					if (oThis.getView().byId("c5").getSelected())
						c5 = "X";
					else
						c5 = "";

					result.TravelItenarySet.push({
						Pernr: ticket.EmpNo,
						TravelPlan: ticket.TravelPlan,
						Trvltype: ticket.TravelType,
						Optiontxt: txtarea4,
						Optionpnr: "",
						// Appry : switchState,
						// Agrpy : c5,
						Tfare: t14,
						Tlimit: "",
						Spnotes: t16,
						Options: c4,
						AddCharge: ch4,
						AChargeAmt: ch4Value,
						Tfarec: "",
						Seqno: "4"
					});
					result.Appry = switchState;
					result.Agrpy = c5;
				} else {
					result.TravelItenarySet.push({
						Pernr: ticket.EmpNo,
						TravelPlan: ticket.TravelPlan,
						Trvltype: ticket.TravelType,
						Options: c4,
						Seqno: "4"
					});
				}
				// result.Comments = content;
				this.oDataModel.create(
					"/TicketingTrnsSet", result, null,
					function (oData, response) {
						//oThis.uploadFiles();
						sap.ui.core.BusyIndicator.hide();
						sap.ui.getCore().getModel("products").getData().butonVisible = true;
						sap.ui.getCore().getModel("products").getData().busy = false;
						sap.ui.getCore().getModel('products').refresh();
						oThis.getView().byId("txtarea5").setValue("");
						sap.m.MessageBox.success("Saved Successfully");
						//	var sNextLayout = oThis.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
						oThis.oRouter.navTo("detail", {
							layout: "TwoColumnsMidExpanded",
							product: oThis._product,
							reqNo: oThis.reqNo
						});

					},
					function (error) {
						sap.ui.core.BusyIndicator.hide();
						sap.m.MessageBox.error("Internal Server error");
					});
			} else {
				sap.ui.core.BusyIndicator.hide();
				sap.m.MessageToast.show("Please provide comments");
				oThis.getView().byId("txtarea5").setValueState("Error");
			}
		},
		////////////######################### On Accept ######################///////////////////
		onPressAccept: function () {
			var oThis = this;
			var c1 = oThis.getView().byId("c1").getSelected();
			var c2 = oThis.getView().byId("c2").getSelected();
			var c3 = oThis.getView().byId("c3").getSelected();
			var c4 = oThis.getView().byId("c4").getSelected();
			if (!c1 && !c2 && !c3 && !c4)
				sap.m.MessageBox.alert("Please select any one option");
			else {
				if (c3 || c2) {
					sap.m.MessageBox.show("Information mail will go to manager. Are you sure you want to continue? ",
						sap.m.MessageBox.Icon.NONE, "Confirm", [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
						function (event) {
							if (event === "YES") {
								var val = "Accept";
								oThis.onSaveAccept(val);
							}
						});
				} else {
					var val = "Accept";
					oThis.onSaveAccept(val);
				}
			}
		},
		onChangeComments: function () {
			var comment = this.getView().byId("txtarea5");
			if (comment.getValue() !== "") {
				comment.setValueState("None");
			}
		},
		onFileUpload: function (evt) {
			var oThis = this;
			var file = evt.getParameters("files").files[0];
			var oData = evt.getSource().getParent().getModel("ticketModel").getData();
			var sModule = "TCK";
			var tpno;

			if (oData.TravelType === "VISA")
				tpno = "00" + oData.TravelPlan;
			else
				tpno = oData.TravelPlan;
			//oData.EmpNo
			com.bosch.hr.swift_trv.model.Common.uploadCollectionFile(oThis, oData, file, tpno, this.Perner, sModule, this.oDataModel);

		},
		//// Event has to rename onFileDeleted
		onFileDeleted: function (oEvent) {
			var oThis = this;
			// prepare FileName
			var sFileName = oEvent.getParameters("item").item.getFileName();

			// prepare DocType
			var oData = oEvent.getSource().getParent().getModel("ticketModel").getData();
			var sDocType;
			sDocType = "TCK";

			// prepare travel request number
			var sDepReq = oData.TravelPlan;

			// prepare employee number
			var sEmpNo = oData.EmpNo;

			// prepare index
			var sIndex = 0;

			com.bosch.hr.swift_trv.model.Common.deleteUploadCollectionFile(oThis, oEvent, sDepReq, sFileName, sDocType, sEmpNo, sIndex, this.oDataModel);
		},
		onUploadComplete: function (oEvent) {

			this.getView().getModel("new").refresh(true);
			//	oEvent.oSource.setUploadUrl("");
		}
	});

});