/* * global hpe * */
jQuery.sap.declare("com.bosch.hr.swift_trv.model.Common");
jQuery.sap.require("sap.m.MessageBox");

com.bosch.hr.swift_trv.model.Common = {};

/**
 * Show an error dialog with information from the oData response object.
 *
 * @param	 {object}
 *            oParameter The object containing error information
 * @return {void}
 * @public
 */
com.bosch.hr.swift_trv.model.Common.checTravelCategoryDuration = function (sTravelCat, iDuration, dep_type, toCountry) {
	var err = "";
	try {
		var selectedDesc = "Business meetings/conference";
	} catch (exc) {
		selectedDesc = "";
	}
	// Start
	if (dep_type === "INTL" && sTravelCat === "BUSR") {
		var globalData = sap.ui.getCore().getModel("global").getData();
		var durationData = globalData.busrDuration;
		for (var i = 0; i < durationData.length; i++) {
			if (durationData[i].CONST === "BUSR_DURATION" && durationData[i].SELPAR === toCountry) {
				if (parseInt(iDuration, 10) > parseInt(durationData[i].VALUE, 10))
					return "Maximum duration for Business Travels to " + durationData[i].DESCRIPTION + " is " + durationData[i].VALUE +
						" days. Please check the duration";
				else
					return "";
			}
		}
	}
	// End
	var oGlobalData = sap.ui.getCore().getModel("global").getData().visaType;
	for (i = 0; i < oGlobalData.length; i++) {
		if (sTravelCat === oGlobalData[i].ZZ_VKEY && dep_type === oGlobalData[i].ZZ_ZZ_SMODID) {
			if (sTravelCat === "WRKP" && dep_type === "DOME") {
				if (selectedDesc !== null && selectedDesc !== "") {
					if (selectedDesc.indexOf(oGlobalData[i].ZZ_VISA_DESC) !== -1) {
						if (parseInt(iDuration, 10) > parseInt(oGlobalData[i].ZZ_MAX, 10) || parseInt(iDuration, 10) < parseInt(oGlobalData[i].ZZ_MIN, 10)) {
							return err = "As per policy, " + oGlobalData[i].ZZ_VISA_DESC + " category between " + oGlobalData[i].ZZ_MIN + " - " + oGlobalData[
								i].ZZ_MAX + " day(s).";
						}
					}
				}
			} else {
				if (parseInt(iDuration, 10) > parseInt(oGlobalData[i].ZZ_MAX, 10) || parseInt(iDuration, 10) < parseInt(oGlobalData[i].ZZ_MIN, 10)) {
					if (sTravelCat === "HOME" || sTravelCat === "EMER") {
						return err = "As per policy, " + oGlobalData[i].ZZ_VISA_DESC + " category between " + oGlobalData[i].ZZ_MIN + " - " + oGlobalData[
							i].ZZ_MAX + " day(s) for yourself.";
					} else {
						if (sTravelCat !== "TRFR") {
							return err = "As per policy, " + oGlobalData[i].ZZ_VISA_DESC + " category between " + oGlobalData[i].ZZ_MIN + " - " + oGlobalData[
								i].ZZ_MAX + " day(s).";
						}
					}
				}
			}
		}
	}
	return "";

};

com.bosch.hr.swift_trv.model.Common.checkDateInPast = function (date) {
	// Check date in the past
	var dCurrentDate = new Date();
	dCurrentDate = new Date(dCurrentDate.toDateString());
	var dInputDate = new Date(date.substr(0, 4), date.substr(4, 2) - 1, date.substr(6, 2));
	if (dInputDate < dCurrentDate) {
		return true;
	} else {
		return false;
	}
};
// Check existing in an array
com.bosch.hr.swift_trv.model.Common.checkExistingArray = function (aArray, sColumn, sValue) {
	try {
		for (var i = 0; i < aArray.length; i++) {
			if (aArray[i][sColumn] === sValue) {
				return true;
			}
		}
	} catch (ex) {
		return false;
	}
	return false;
};
//////////////######################## General //////////////////////////////#################################

com.bosch.hr.swift_trv.model.Common.checkGeneral = function (oData) {

	if (oData.ZZ_KUNDE === null || oData.ZZ_KUNDE === "" || oData.ZZ_KUNDE === undefined) {
		//oData.view.ZZ_KUNDE_ERROR = "Error";
		return "Enter Purpose of Travel";
	} else {
		//oData.view.ZZ_KUNDE_ERROR = "None";
	}
	if (oData.ZZ_CATID === null || oData.ZZ_CATID === "" || oData.ZZ_CATID === undefined) {
		//oData.view.ZZ_CATID_ERROR = "Error";
		return "Please Select Travel To";
	} else {
		//oData.view.ZZ_CATID_ERROR = "None";
	}
	if (oData.ZZ_MOBILE === null || oData.ZZ_MOBILE === "" || oData.ZZ_MOBILE === undefined || oData.ZZ_MOBILE.trim().length < 8) {
		//oData.view.ZZ_MOBILE_ERROR = "Error";
		return "Please enter number in following format +91987654321 or 0987654321";
	} else {
		//oData.view.ZZ_MOBILE_ERROR = "None";
	}
	if (oData.ZZ_TRV_TYP === "BUSR" && oData.ZZ_SMODID === "INTL" && parseInt(oData.ZZ_ZDURN, 10) <= 31) {
		if (oData.ZZ_SIM_REQ_KEY === "" || oData.ZZ_SIM_REQ_KEY === "P") {
			//oData.view.ZZ_SIM_REQ_KEY_ERROR = "Error";
			return "Please select the the option SIM card Required or not";
		} else {
			//oData.view.ZZ_SIM_REQ__KEY_ERROR = "None";
		}
		if (oData.ZZ_SIM_REQ_KEY === "Y" && (oData.ZZ_SIM_TYP_KEY === "" || oData.ZZ_SIM_TYP_KEY === "P")) {
			return "Please select the the option SIM card Type ";
		} else if (oData.ZZ_SIM_REQ_KEY === "Y" && (oData.ZZ_SIM_DATA_KEY === "" || oData.ZZ_SIM_DATA_KEY === "P")) {
			if (oData.ZZ_SIM_DATA_KEY === "") {
				return "";
			}
			return "Please select the the option SIM card Data";
		}
	}
	return "";
};
//////// ###################### checkCostAssignment ##################################///////////////////////
com.bosch.hr.swift_trv.model.Common.checkCostAssignment = function (oData) {

	var iPercent = 0;
	if (oData.TRV_HDRtoTRV_COST_ASGN.results.length === 0) {
		return "Please enter cost assigment";
	}
	for (var i = 0; i < oData.TRV_HDRtoTRV_COST_ASGN.results.length && oData.TRV_HDRtoTRV_ACCOM !== undefined; i++) {
		if (oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_PERCENT === null || oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_PERCENT === "" ||
			oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_PERCENT === "0") {
			//oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_PERCENT_ERROR = "Error";
			return "Enter required field(s)";
		} else {
			//	oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_PERCENT_ERROR = "None";
		}
		iPercent += parseFloat(oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_PERCENT);
		if (oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_GEBER === null || oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_GEBER === "") {
			//oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_GEBER_ERROR = "Error";
			return "Enter required field(s)";
		} else {
			//	oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_GEBER_ERROR = "None";
		}
		if (oData.fund && !com.bosch.hr.swift_trv.model.Common.checkExistingArray(oData.fund, "fincode", oData.TRV_HDRtoTRV_COST_ASGN.results[
				i].ZZ_GEBER)) {
			//	oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_GEBER_ERROR = "Error";
			return this.getView().getModel("i18n").getProperty("Invalid Fund");
		} else {
			//oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_GEBER_ERROR = "None";
		}
		if (oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FISTL === null || oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FISTL === "") {
			//	oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FISTL_ERROR = "Error";
			return "Enter required field(s)";
		} else {
			//	oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FISTL_ERROR = "None";
		}
		if (oData.BudgetCenter && !com.bosch.hr.swift_trv.model.Common.checkExistingArray(oData.BudgetCenter, "ZzFundC", oData.TRV_HDRtoTRV_COST_ASGN
				.results[i].ZZ_FISTL)) {
			//	oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FISTL_ERROR = "Error";
			return "Invalid Budget Center";
		} else {
			//	oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FISTL_ERROR = "None";
		}
		/*if (oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FIPEX_ERROR === "Error") {
			return "Invalid Budget Code";
		}*/
		if (oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FIPEX === null || oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FIPEX === "") {
			//	oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FIPEX_ERROR = "Error";
			return "Enter required field(s)";
		} else {
			//	oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FIPEX_ERROR = "None";
		}
		if (oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FIPOS === undefined) {
			oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FIPOS = "";
		}
		if (oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_KOSTL === undefined) {
			oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_KOSTL = "";
		}
		if (oData.WBSF4Help && !com.bosch.hr.swift_trv.model.Common.checkExistingArray(oData.WBSF4Help, "ZZ_POSKI", oData.TRV_HDRtoTRV_COST_ASGN
				.results[i].ZZ_FIPOS) && oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FIPOS !== "") {
			//	oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FIPOS_ERROR = "Error";
			return "Invalid WBS Element";
		} else {
			//	oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FIPOS_ERROR = "None";
		}
		if (oData.CostCenterF4Help && !com.bosch.hr.swift_trv.model.Common.checkExistingArray(oData.CostCenterF4Help, "KOSTL", oData.TRV_HDRtoTRV_COST_ASGN
				.results[i].ZZ_KOSTL) && oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_KOSTL !== "") {
			//	oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_KOSTL_ERROR = "Error";
			return "Invalid Cost Center";
		} else {
			//	oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_KOSTL_ERROR = "None";
		}
		if (oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_KOSTL === "" && oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_GEBER === "F01") {
			//	oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_KOSTL_ERROR = "Error";
			return "Cost center is required for F01 Fund";
		} else {
			//	oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_KOSTL_ERROR = "None";
		}
		if (oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_GEBER === "F04" && oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FIPOS === "") {
			//	oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FIPOS_ERROR = "Error";
			return "Please enter WBS Element for F04 Fund";
		} else {
			//	oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FIPOS_ERROR = "None";
		}
		// fund validation sidd code start
		if (oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_GEBER === "F02") {
			if (oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FIPOS === "") {
				//	oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FIPOS_ERROR = "Error";
				return "Please enter WBS Element for F02 Fund";
			} else {
				//	oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FIPOS_ERROR = "None";
			}
			if (Number(oData.ZZ_REINR) < Number(sap.ui.getCore().getModel("global").getProperty("/VKM_TR")) && sap.ui.getCore().getModel(
					"global").getProperty("/VKM_TR") !== 0) {
				if (oData.vkm && !com.bosch.hr.swift_trv.model.Common.checkExistingArray(oData.vkm, "VKMCode", oData.ZZ_VKM)) {
					return "Invalid VKM";
				} else {
					oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_VKM = oData.ZZ_VKM;
				}
			}
		}
		// UCD1KOR WBS mandatory for F08 Fund 17 Jun 2020
		if (oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_GEBER === "F08") {
			if (oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FIPOS === "") {
				//	oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FIPOS_ERROR = "Error";
				return "Please enter WBS Element for F08 Fund";
			} else {
				//	oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FIPOS_ERROR = "None";
			}
		}

		if (oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_GEBER === "F03") {
			if (oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FIPOS === "") {
				//	oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FIPOS_ERROR = "Error";
				return "Please enter WBS Element for F03 Fund";
			} else {
				//	oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FIPOS_ERROR = "None";
			}
		}
		if (oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_GEBER === "F04") {
			/*Start- No validation if TP < Tp specified in Swift Constants table*/
			if ((oData.ZZ_REINR === "0000000000") ||
				(Number(oData.ZZ_REINR) >= Number(sap.ui.getCore().getModel("global").getProperty("/VKM_TR")) && Number(sap.ui.getCore().getModel(
					"global").getProperty("/VKM_TR")) !== 0)
			) {
				/*End-No validation if TP < Tp specified in Swift Constants table*/
				if (oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FIPOS === "") {
					//		oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FIPOS_ERROR = "Error";
					return "Please enter WBS Element for F04 Fund";
				} else {
					//	oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FIPOS_ERROR = "None";
				}
			}
		}
		if ((oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FIPOS === "" && oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_KOSTL === "") || (oData
				.TRV_HDRtoTRV_COST_ASGN
				.results[i].ZZ_FIPOS !== "" && oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_KOSTL !== "")) {
			if (oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FIPOS !== "" && oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_KOSTL !== "") {
				oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_KOSTL = "";
				return "";
			}
			//	oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FIPOS_ERROR = "Error";
			//	oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_KOSTL_ERROR = "Error";
			return "Please enter either WBS Element or Cost Center";
		} else {
			//	oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FIPOS_ERROR = "None";
			//	oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_KOSTL_ERROR = "None";
		}
	}
	if (iPercent !== 100) {
		//	oData.TRV_HDRtoTRV_COST_ASGN.results[0].ZZ_PERCENT_ERROR = "Error";
		return "Total percent must be 100";
	} else {
		//	oData.TRV_HDRtoTRV_COST_ASGN.results[0].ZZ_PERCENT_ERROR = "None";
	}
	return "";

};
//////############################# checkTravelDetail#######################/////////////
com.bosch.hr.swift_trv.model.Common.checkTravelDetail = function (oData) {

	if (oData.TRV_HDRtoTRV_travel_Data.results.length === 0) {
		return "Please enter travel details";
	}
	var trvlCount = 0;
	for (var i = 0; i < oData.TRV_HDRtoTRV_travel_Data.results.length && oData.TRV_HDRtoTRV_travel_Data !== undefined; i++) {

		if (oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_TRVCAT === oData.ZZ_TRV_TYP) {

			if (oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ZSLFDPD === "00") {
				//start of changes uml6kor 28/8/2019 ticketing: transfer case restricting to one way
				/*UCD1OR 14 Jan 2020 transfer case removed restriction*/
				trvlCount++;
				if (trvlCount > 1 && oData.ZZ_SMODID === "INTL" && oData.ZZ_TRV_CAT === "TRFR" && oData.ZZ_ASG_TYP !== "STX") {
					//	oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ZSLFDPD_ERROR = "Error";
					var err =
						"For international transfers, only one way tickets are provided(i.e only one entry per traveler is allowed). Please enter the data accordingly";
					return err;
				}
			}
			if (oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ZSLFDPD === null || oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ZSLFDPD === "") {
				//	oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ZSLFDPD_ERROR = "Error";
				return "Enter required field(s)";
			} else {
				//	oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ZSLFDPD_ERROR = "None";
			}
			if (oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ZFRPLACE === null || oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ZFRPLACE === "") {
				//	oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ZFRPLACE_ERROR = "Error";
				return "Enter required field(s)";
			} else {
				//	oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ZFRPLACE_ERROR = "None";
			}
			if (oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ZTOPLACE === null || oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ZTOPLACE === "") {
				//	oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ZTOPLACE_ERROR = "Error";
				return "Enter required field(s)";
			} else {
				//	oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ZTOPLACE_ERROR = "None";
			}
			if (oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_BEGDA === null || oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_BEGDA === "") {
				//	oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_BEGDA_ERROR = "Error";
				return "Please check Depart Date";
			}
			if (oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ENDDA !== "00000000" && oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ENDDA !== "" &&
				parseInt(oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_BEGDA, 10) >
				parseInt(oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ENDDA, 10)) {
				//	oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_BEGDA_ERROR = "Error";
				//	oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ENDDA_ERROR = "Error";
				return "Depart Date must be less than or equal to Arrival Date";
			} else {
				//	oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ENDDA_ERROR = "None";
				//	oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_BEGDA_ERROR = "None";
				if (oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_BEGDA === oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ENDDA && oData.TRV_HDRtoTRV_travel_Data
					.results[i].ZZ_BEGUR >= oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ENDUZ && oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_BEGUR !==
					"" && oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ENDUZ !== "") {
					//		oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_BEGUR_ERROR = "Error";
					//		oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ENDUZ_ERROR = "Error";
					return "Depart Time must be less than Arrival Time";
				} else {
					//	oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_BEGUR_ERROR = "None";
					//	oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ENDUZ_ERROR = "None";
				}
				if ((oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ENDDA === null || oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ENDDA === "") &&
					oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ENDUZ !== "" && oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ENDUZ !== null && oData.TRV_HDRtoTRV_travel_Data
					.results[i].ZZ_ENDUZ !== "000000") {
					//	oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ENDDA_ERROR = "Error";
					return "Please enter Arrival Date";
				} else {
					//	oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ENDDA_ERROR = "None";
				}
			}
			if (oData.ZZ_TRV_CAT !== "TRFR") {
				if (oData.ZZ_MODID == 'BUSR' && oData.ZZ_SMODID == "INTL" && oData.PersFlag == "X") {
					if (parseInt(oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_BEGDA,0) < parseInt(oData.minPDate,0) || parseInt(oData.TRV_HDRtoTRV_travel_Data
							.results[i].ZZ_BEGDA,0) > parseInt(oData.maxPDate,0)) {
						oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_BEGDA_ERROR = 'Error';
						return "Depart Date must be between Start Date and End Date";
					} else {
						oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_BEGDA_ERROR = 'None';
					}
				} else {
					if (parseInt(oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_BEGDA, 10) < parseInt(oData.ZZ_DATV1, 10) || parseInt(oData.TRV_HDRtoTRV_travel_Data
							.results[i].ZZ_BEGDA, 10) > parseInt(oData.ZZ_DATB1, 10)) {
						//	oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_BEGDA_ERROR = "Error";
						return "Depart Date must be between Start Date and End Date";
					} else {
						//	oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_BEGDA_ERROR = "None";
					}
				}

			} else {
				if (parseInt(oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_BEGDA, 10) < parseInt(oData.ZZ_DATV1, 10) || parseInt(oData.TRV_HDRtoTRV_travel_Data
						.results[i].ZZ_BEGDA, 10) > parseInt(oData.ZZ_DATB1, 10)) {
					//	oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_BEGDA_ERROR = "Error";
					return "Depart Date must be between Start Date and End Date";
				} else {
					//	oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_BEGDA_ERROR = "None";
				}
			}
			//////////// ############## UCD1KOR 12 Feb 2020 arrival date +3 added ###################//////////
			if (oData.ZZ_TRV_CAT !== "TRFR") {

				var tripEndDate = oData.ZZ_DATB1;
				var tripEndDateValue = new Date(parseInt(tripEndDate.substr(0, 4), 10), parseInt(tripEndDate.substr(4, 2), 10) - 1, parseInt(
					tripEndDate.substr(6, 2), 10) + 3);

				var arrivalDate = oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ENDDA;
				try {
					var arrivalDateValue = new Date(parseInt(arrivalDate.substr(0, 4), 10), parseInt(arrivalDate.substr(4, 2), 10) - 1, parseInt(
						arrivalDate.substr(6, 2), 10));
				} catch (err) {

				}
				if ((parseInt(oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ENDDA, 10) < parseInt(oData.ZZ_DATV1, 10) || arrivalDateValue >
						tripEndDateValue) && oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ENDDA !== "" && oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ENDDA !==
					"00000000") {
					//	oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ENDDA_ERROR = "Error";
					return "Depart Date/Arrival Date must be between Start Date and End Date";
				} else {
					//	oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ENDDA_ERROR = "None";
				}
			}
			if (oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ZMODE === null || oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ZMODE === "") {
				//	oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ZMODE_ERROR = "Error";
				return "Enter required field(s)";
			} else {
				//	oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ZMODE_ERROR = "None";
			}
		}
	}

	return "";

};
/////////////////////////////////###################### checkAccomodation #####################////////////////////
com.bosch.hr.swift_trv.model.Common.checkAccomodation = function (oData) {

	for (var i = 0; i < oData.TRV_HDRtoTRV_ACCOM.results.length && oData.TRV_HDRtoTRV_ACCOM !== undefined && oData.TRV_HDRtoTRV_ACCOM.results[
			0].ZZ_BEGDA !== undefined && oData.TRV_HDRtoTRV_ACCOM.results[0].ZZ_BEGDA !== "00000000"; i++) {
		if (oData.TRV_HDRtoTRV_ACCOM.results[i].ZZ_ZPLACE === null || oData.TRV_HDRtoTRV_ACCOM.results[i].ZZ_ZPLACE === "") {
			//	oData.TRV_HDRtoTRV_ACCOM.results[i].ZZ_ZPLACE_ERROR = "Error";
			return "Enter required field(s)";
		} else {
			//	oData.TRV_HDRtoTRV_ACCOM.results[i].ZZ_ZPLACE_ERROR = "None";
		}
		if (oData.TRV_HDRtoTRV_ACCOM.results[i].ZZ_BEGDA === null || oData.TRV_HDRtoTRV_ACCOM.results[i].ZZ_BEGDA === "") {
			//	oData.TRV_HDRtoTRV_ACCOM.results[i].ZZ_BEGDA_ERROR = "Error";
			return "Please check From Date";
		} else {
			//	oData.TRV_HDRtoTRV_ACCOM.results[i].ZZ_BEGDA_ERROR = "None";
		}
		if (oData.TRV_HDRtoTRV_ACCOM.results[i].ZZ_ENDDA === null || oData.TRV_HDRtoTRV_ACCOM.results[i].ZZ_ENDDA === "") {
			//	oData.TRV_HDRtoTRV_ACCOM.results[i].ZZ_ENDDA_ERROR = "Error";
			return "Please check To Date";
		} else {
			//	oData.TRV_HDRtoTRV_ACCOM.results[i].ZZ_ENDDA_ERROR = "None";
		}
		if (parseInt(oData.TRV_HDRtoTRV_ACCOM.results[i].ZZ_BEGDA, 10) < parseInt(oData.ZZ_DATV1, 10)) {
			//	oData.TRV_HDRtoTRV_ACCOM.results[i].ZZ_BEGDA_ERROR = "Error";
			return "Accomodation From Date must be greater than or equal to Trip Start Date";
		} else {
			//	oData.TRV_HDRtoTRV_ACCOM.results[i].ZZ_BEGDA_ERROR = "None";
		}
		if (parseInt(oData.TRV_HDRtoTRV_ACCOM.results[i].ZZ_ENDDA, 10) > parseInt(oData.ZZ_DATB1, 10)) {
			//	oData.TRV_HDRtoTRV_ACCOM.results[i].ZZ_ENDDA_ERROR = "Error";
			return "Accomodation To Date must be less than or equal to Trip End Date";
		} else {
			//	oData.TRV_HDRtoTRV_ACCOM.results[i].ZZ_ENDDA_ERROR = "None";
		}
		if (parseInt(oData.TRV_HDRtoTRV_ACCOM.results[i].ZZ_BEGDA, 10) > parseInt(oData.TRV_HDRtoTRV_ACCOM.results[i].ZZ_ENDDA, 10)) {
			//	oData.TRV_HDRtoTRV_ACCOM.results[i].ZZ_BEGDA_ERROR = "Error";
			//	oData.TRV_HDRtoTRV_ACCOM.results[i].ZZ_ENDDA_ERROR = "Error";
			return "To Date must be greater than or equal to From Date";
		} else {
			//	oData.TRV_HDRtoTRV_ACCOM.results[i].ZZ_BEGDA_ERROR = "None";
			//	oData.TRV_HDRtoTRV_ACCOM.results[i].ZZ_ENDDA_ERROR = "None";
		}
	}
	// Check date overlapping GIANG BEGIN
	for (i = 0; i < oData.TRV_HDRtoTRV_ACCOM.results.length && oData.TRV_HDRtoTRV_ACCOM !== undefined && oData.TRV_HDRtoTRV_ACCOM.results[
			0].ZZ_BEGDA !== undefined; i++) {
		var stDate = oData.TRV_HDRtoTRV_ACCOM.results[i].ZZ_BEGDA;
		var enDate = oData.TRV_HDRtoTRV_ACCOM.results[i].ZZ_ENDDA;
		var checkStartDate = new Date(stDate.substr(0, 4), stDate.substr(4, 2) - 1, stDate.substr(6, 2));
		var checkEndDate = new Date(enDate.substr(0, 4), enDate.substr(4, 2) - 1, enDate.substr(6, 2));
		for (var j = i + 1; j < oData.TRV_HDRtoTRV_ACCOM.results.length && oData.TRV_HDRtoTRV_ACCOM !== undefined; j++) {
			var curStDate = oData.TRV_HDRtoTRV_ACCOM.results[j].ZZ_BEGDA;
			var curEnDate = oData.TRV_HDRtoTRV_ACCOM.results[j].ZZ_ENDDA;
			var curStartDate = new Date(curStDate.substr(0, 4), curStDate.substr(4, 2) - 1, curStDate.substr(6, 2));
			var curEndDate = new Date(curEnDate.substr(0, 4), curEnDate.substr(4, 2) - 1, curEnDate.substr(6, 2));
			if (checkEndDate < curStartDate || checkStartDate > curEndDate) {
				//	oData.TRV_HDRtoTRV_ACCOM.results[j].ZZ_BEGDA_ERROR = "None";
				//	oData.TRV_HDRtoTRV_ACCOM.results[j].ZZ_ENDDA_ERROR = "None";
				continue;
			} else {
				//	oData.TRV_HDRtoTRV_ACCOM.results[j].ZZ_BEGDA_ERROR = "Error";
				//	oData.TRV_HDRtoTRV_ACCOM.results[j].ZZ_ENDDA_ERROR = "Error";
				return "Date is overlapping";
			}
		}
	}
	// Check date overlapping GIANG END
	return "";
};

//////////////////////############################### checkAdvance ###################////////////////////////
com.bosch.hr.swift_trv.model.Common.checkAdvance = function (oData) {};

com.bosch.hr.swift_trv.model.Common.noBudgetCheck = function (sStatus, sHasBudget, sDepProfile, sDepCost, sFund, sType) {
	if (sHasBudget === "T" || sFund.trim() === "F03" || sType === "DOME") {
		return true;
	} else {
		if (sHasBudget === "X" && // No budget
			(sStatus.substr(2, 5) !== "003" && sStatus !== "HH006" && sStatus !== "CC006")) { // Not
			// fist
			// approval,
			// not
			// from
			// tax
			// or
			// DH
			return true;
		} else {
			var aDep = sDepCost.split("/");
			var aFund = sFund.split("/");
			for (var i = 0; i < aDep.length; i++) {
				if (sDepProfile.indexOf(aDep[i].trim()) !== -1 && aFund[i].trim() === "F03") {
					return true;
				}
			}
		}
	}
	return false;
};
//////////////////###################### File Upload ##################################//////////////////
com.bosch.hr.swift_trv.model.Common.uploadFileDeputation = function (oController, oControl, sDepReq, sEmpNo, Model, sMsg) {
	sap.ui.core.BusyIndicator.show(-1);
	var sFileName;
	sFileName = "CL_VISA_COPY_SELF_" + "BUSR" + oControl.getProperty("value")
		.substr(oControl.getProperty("value").lastIndexOf("."));
	var file = oControl.oFileUpload.files[0];
	sDepReq = sDepReq === null || sDepReq === "" ? "999999999" : sDepReq;
	sEmpNo = sEmpNo === null || sEmpNo === "" ? sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR : sEmpNo;
	var sSlung = sDepReq + "," + sEmpNo + "," + sFileName + "," + "L4";

	var oHeaders = {
		"X-Requested-With": "XMLHttpRequest",
		"Accept": "application/json",
		"DataServiceVersion": "2.0",
		"Content-Type": "application/atom+xml",
		"slug": sSlung
	};
	Model.setHeaders(oHeaders);
	Model.create("DmsDocsSet", file, null, jQuery.proxy(function (oData, response) {
		if (sMsg === undefined) {
			sap.m.MessageToast.show("Uploaded Successfully");
		}
		sap.ui.getCore().getModel("products").getData().href = oData.FileUrl;
		sap.ui.getCore().getModel("products").refresh();
		sap.ui.core.BusyIndicator.hide();
		//	oData.FileUrl
	}, this), jQuery.proxy(function (error) {
		sap.m.MessageToast.show("Internal Server Error on File Uploading");
	}, true));
};
/////////////////////////	
com.bosch.hr.swift_trv.model.Common.mappingDependent = function (sType) {
	switch (sType) {
	case "00": // SELF
		return "";
		break;
	case "01": // Spouse
		return "Spouse";
		break;
	case "02": // Child 1
		return "C1";
		break;
	case "90": // Child 2
		return "C2";
		break;
	case "03": // Child 3
		return "C3";
		break;
	case "04": // Child 4
		return "C4";
		break;
	case "05": // Child 5
		return "C5";
		break;
	}
};
com.bosch.hr.swift_trv.model.Common.getArrayIndex = function (aArray, sColumn, sValue) {
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
};

com.bosch.hr.swift_trv.model.Common.checkInsrStartDate = function (date) {
	// Check date in the past
	var dCurrentDate = new Date();
	dCurrentDate = new Date(dCurrentDate.toDateString());
	var dInputDate = new Date(date.substr(0, 4), date.substr(4, 2) - 1, date.substr(6, 2));
	if (dInputDate >= dCurrentDate) {
		return true;
	} else {
		return false;
	}
};

com.bosch.hr.swift_trv.model.Common.uploadCollectionFile = function (oController, oData, fFile, sDepReq, sEmpNo, sModule, Model) {
	var aFiles = oData.Files;
	var bExisted = false;
	if (aFiles) {
		bExisted = this.checkExistingArray(aFiles, "FileName", fFile.name);
	}
	// if file existed
	if (bExisted) {
		sap.m.MessageToast.show("File " + fFile.name + " existed. Please delete it or rename your file before uploading again.");
		// oController.getView().byId("UploadCollection").removeAllItems();
	} else {
		var sFileName = fFile.name;
		var sUrl = "DmsDocsSet";
		sDepReq = sDepReq === null || sDepReq === "" ? '999999999' : sDepReq;
		sEmpNo = sEmpNo === null || sEmpNo === "" ? sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR : sEmpNo;
		var sSlung = sDepReq + "," + sEmpNo + "," + sFileName + "," + sModule;
		var oHeaders = {
			'X-Requested-With': "XMLHttpRequest",
			'DataServiceVersion': "2.0",
			'Content-Type': "application/atom+xml",
			"slug": sSlung
		};
		//fFile.type,
		Model.setHeaders(oHeaders);
		Model.create("DmsDocsSet", fFile, null, jQuery.proxy(function (data, response) {
			var oData = oController.getView().getModel("new").getData();
			var oItem = {};
			oItem = {
				Country: "",
				// DepReq: oData.ZZ_REINR,
				DepReq: sDepReq,
				DocType: sModule,
				EmpNo: "",
				FileContent: "",
				FileMimeType: data.FileMimeType,
				FileName: data.FileName,
				FileUrl: data.FileUrl,
				Index: data.Index,
				Module: data.Module
			};
			try {
				if (oData.Files.constructor.name === "Object") {
					var tempArray = [];
					oData.Files = tempArray;
				}
			} catch (error) {}
			if (oData.Files === undefined) {
				oData.Files = [];
			}
			oData.Files.unshift(oItem);
			oController.getView().byId("UploadCollection").getBinding("items").update();
			oController.getView().byId("UploadCollection").aItems = [];
			oController.getView().getModel("new").refresh(true);

			sap.m.MessageToast.show("Upload Succesfully");
		}, this), jQuery.proxy(function (error) {
			sap.m.MessageToast.show("Internal Server Error");
		}, true));
	} // end if existed
}; // end uploadCollectionFile
com.bosch.hr.swift_trv.model.Common.getDocumentList = function (oController, sRequest, sEmployee, sDocType, sModule, sCountry, Model) {

	var aaVendorFlag = false;
	var s1stUrl = "DmsDocsSet?$filter=DepReq+eq+'{0}'+and+EmpNo+eq+'{1}'+and+Module+eq+'{2}'+and+Country+eq+'{3}'";
	s1stUrl = s1stUrl.replace("{0}", sRequest);
	s1stUrl = s1stUrl.replace("{1}", sEmployee);
	s1stUrl = s1stUrl.replace("{2}", sModule);
	s1stUrl = s1stUrl.replace("{3}", sCountry);
	var s2ndUrl = "DmsDocsSet?$filter=DepReq+eq+'{0}'+and+EmpNo+eq+'{1}'+and+DocType+eq+'{2}'";
	s2ndUrl = s2ndUrl.replace("{0}", sRequest);
	s2ndUrl = s2ndUrl.replace("{1}", sEmployee);
	s2ndUrl = s2ndUrl.replace("{2}", sDocType);
	// s2ndUrl = s2ndUrl.replace("{2}", "INS");
	var oBatch0 = Model.createBatchOperation(s1stUrl, "GET");
	var oBatch1 = Model.createBatchOperation(s2ndUrl, "GET");
	try {
		if (sModule === "INSR" || sModule === "ACOM") {
			var s3rdUrl = "DmsDocsSet?$filter=DepReq+eq+'{0}'+and+EmpNo+eq+'{1}'+and+DocType+eq+'{2}'";
			var sRequestNoZero = sRequest.replace(/^0+/, '');
			s3rdUrl = s3rdUrl.replace("{0}", sRequestNoZero);
			s3rdUrl = s3rdUrl.replace("{1}", sEmployee);
			s3rdUrl = s3rdUrl.replace("{2}", "TCK");
			var oBatch2 = Model.createBatchOperation(s3rdUrl, "GET");
			Model.addBatchReadOperations([oBatch0, oBatch1, oBatch2]);
		} else if (sModule === "CARG") {
			if (oController.getView().getModel("new").getData().ZZ_CAR_TYP === "V" ||
				oController.getView().getModel("new").getData().ZZ_CAR_TYP === "S") {
				aaVendorFlag = true;
				s3rdUrl = "DmsDocsSet?$filter=DepReq+eq+'{0}'+and+EmpNo+eq+'{1}'+and+DocType+eq+'{2}'+and+Role+eq+'{3}'";
				sRequestNoZero = sRequest.replace(/^0+/, '');
				s3rdUrl = s3rdUrl.replace("{0}", sRequestNoZero);
				s3rdUrl = s3rdUrl.replace("{1}", sEmployee);
				if (sDocType === 'CAO')
					s3rdUrl = s3rdUrl.replace("{2}", "CDO"); //Cargo Airfreight Document
				else if (sDocType === 'CAR')
					s3rdUrl = s3rdUrl.replace("{2}", "CDR"); //Cargo Airfreight Document
				s3rdUrl = s3rdUrl.replace("{3}", sap.ui.getCore().getModel("profile").getData().currentRole);
				oBatch2 = Model.createBatchOperation(s3rdUrl, "GET");

				var s4Url = "DmsDocsSet?$filter=DepReq+eq+'{0}'+and+DocType+eq+'{1}'";
				sRequestNoZero = sRequest.replace(/^0+/, '');
				s4Url = s4Url.replace("{0}", "121212121");
				s4Url = s4Url.replace("{1}", "CAX");

				//s3rdUrl = s3rdUrl.replace("{3}", sap.ui.getCore().getModel("profile").getData().currentRole);
				var oBatch3 = Model.createBatchOperation(s4Url, "GET");

				Model.addBatchReadOperations([oBatch0, oBatch1, oBatch2, oBatch3]);
			} else {
				Model.addBatchReadOperations([oBatch0, oBatch1]);
			}
		} else {
			Model.addBatchReadOperations([oBatch0, oBatch1]);
		}
	} catch (ex) {
		Model.addBatchReadOperations([oBatch0, oBatch1]);
	}
	Model.submitBatch(function (oResult) {
		var aData = oController.getView().getModel("new").getData();
		// aData.Files = {};
		aData.Files = [];
		if (Array.isArray(oResult.__batchResponses[0].data.results)) {
			// aData.Files = $.extend([],
			// oResult.__batchResponses[0].data.results,
			// oResult.__batchResponses[1].data.results);
			aData.Files = aData.Files.concat(oResult.__batchResponses[0].data.results, oResult.__batchResponses[1].data.results);
		} else {
			// aData.Files = $.extend([],
			// oResult.__batchResponses[1].data.results);
			aData.Files = oResult.__batchResponses[1].data.results;
		}
		try {
			if (sModule === "INSR" || sModule === "ACOM" || (sModule === "CARG" && aaVendorFlag === true)) {
				// aData.Files = $.extend([], aData.Files,
				// oResult.__batchResponses[2].data.results);
				aData.Files = aData.Files.concat(oResult.__batchResponses[2].data.results);
				if (sModule === "CARG") {
					aData.Files = aData.Files.concat(oResult.__batchResponses[3].data.results);
				}
			}
		} catch (ex) {}
		// aData.Files = $.extend([],
		// oResult.__batchResponses[0].data.results,
		// oResult.__batchResponses[1].data.results);
		oController.getView().byId("UploadCollection").aItems = [];
		oController.getView().byId("UploadCollection").removeAllItems();
		oController.getView().getModel("new").setData(aData);
		oController.getView().getModel("new").refresh(true);
	}, function (error) {
		sap.m.MessageToast.show("Internal Server Error");
	});
};
com.bosch.hr.swift_trv.model.Common.deleteUploadCollectionFile = function (oController, oEvent, sDepReq, sFileName, sDocType, sEmpNo,
	sIndex, Model) {
	var sUrl = "DmsDocsSet(DepReq='" + sDepReq + "',FileName='" + sFileName + "',DocType='" + sDocType + "',EmpNo='" +
		sEmpNo + "',Index=" + sIndex + ",Module='',Country='')";
	Model.remove(sUrl, null, jQuery.proxy(function (oData, response) {
		sap.m.MessageToast.show("Deleted Succesfully");
		var aFiles = oController.getView().getModel("new").getData().Files;
		var iFileIndex = com.bosch.hr.swift_trv.model.Common.getArrayIndex(aFiles, "FileName", sFileName);
		aFiles.splice(iFileIndex, 1);
		oController.getView().byId("UploadCollection").getBinding("items").update();
		oController.getView().getModel("new").refresh(true);
	}, this), jQuery.proxy(function (error) {
		sap.m.MessageToast.show("Deleted Failed");
	}, true));
};