sap.ui.define([], function () {
	"use strict";
	return {
		StatusFormatter: function (sValue) {
			if (sValue !== "" && sValue !== null) {
				if (sValue.indexOf("Approv") !== -1 || sValue.indexOf("Closed") !== -1) {
					return "Success";
				} else if (sValue.indexOf("Reject") !== -1 || sValue.indexOf("Sent back") !== -1) {
					return "Error";
				} else if (sValue.indexOf("Saved") !== -1 || sValue.indexOf("Submitted") !== -1) {
					return "Warning";
				} else {
					return "Information";
				}
			}
		},
		ButtonVisibilityFormatter_Save: function (sValue, dateChange) {
			if (sValue === null || sValue === "" || sValue === null || sValue === undefined) {
				return true;
			}
			if (dateChange === true || sValue.indexOf("Approv") !== -1 || sValue.indexOf("Reject") !== -1 || sValue.indexOf("Submitted") !== -1) {
				return false;
			} else if (sValue.indexOf("Sent back") !== -1 || sValue.indexOf("Saved") !== -1) {
				return true;
			}
		},
		ButtonVisibilityFormatter_Submit: function (sValue) {
			if (sValue === null || sValue === "" || sValue === null || sValue === undefined) {
				return true;
			}
			if (sValue.indexOf("Approv") !== -1 || sValue.indexOf("Reject") !== -1 || sValue.indexOf("Submitted") !== -1) {
				return false;
			} else if (sValue.indexOf("Sent back") !== -1 || sValue.indexOf("Saved") !== -1) {
				return true;
			}
		},
		ButtonVisibilityFormatter_Delete: function (sValue) {

			if (sValue !== null && sValue.indexOf("000") !== -1) {
				return true;
			} else {
				return false;
			}
		},
		/*VisiblePendngWith:function(sValue){
			 if(sValue === "FF001"){
				return false;
			}
			else{
				return true;
			}
		},*/

		EditButtonVisibility: function (sValue, reqNo) {
			if (reqNo === "--" || reqNo === "" || reqNo === null || reqNo === undefined) {
				return false;
			} else {
				if (sValue !== null && (sValue.indexOf("000") !== -1 || sValue.indexOf("008") !== -1)) {
					return true;
				} else {
					return false;
				}
			}
		},
		VisaAvailabilityText: function (val) {
			if (val === "X" | val === "x") {
				return "Zip and upload Passport and Visa";
			} else {
				return "No Valid Visa";
			}
		},
		ActionButtonVisibility: function (reqNo, isUpdate) {
			if (reqNo === "--" || reqNo === "" || reqNo === undefined || reqNo === null || isUpdate === true) {
				return false;
			} else {
				return true;
			}
		},
		deviceVisible: function (sValue) {
			if (sValue === null || sValue === false) {
				return false;
			} else {
				return true;
			}
		},
		onDateChange: function (dateChange, editable, StartDateEditable) {
			if (StartDateEditable === false) {
				return false;
			}
			if (editable === true || dateChange === true) {
				return true;
			} else {
				return false;
			}
		},
		CostAssignmentRemove: function (editMode, Selected) {

			if (editMode === true && Selected === true) {
				return true;
			} else {
				return false;
			}

		},
		TravelDetailRemove: function (editMode, Selected) {

			if (editMode === true && Selected === true) {
				return true;
			} else {
				return false;
			}

		},
		AccomRemove: function (editMode, Selected) {

			if (editMode === true && Selected === true) {
				return true;
			} else {
				return false;
			}

		},
		AdvRemove: function (editMode, Selected) {

			if (editMode === true && Selected === true) {
				return true;
			} else {
				return false;
			}
		},
		pendingWith: function (status, name) {
			if (name === "" || name === undefined || name === null || status === "FF001") {
				return "-";
			} else {
				return name.substr(0, 1) + name.substr(1).toLocaleLowerCase();
			}
		},
		pendingWithInsurance: function (name) {
			if (name === "" || name === undefined || name === null) {
				return "-";
			} else {
				return name.substr(0, 1) + name.substr(1).toLocaleLowerCase();
			}
		},
		sapDate: function (value) {
			if (value !== null && value !== "" && value !== "00000000" && value !== "0.0000000 ") {
				var oDateFormat = sap.ui.core.format.DateFormat
					.getDateTimeInstance({
						pattern: "dd/MM/yyyy"
					});
				return oDateFormat.format(new Date(value.substr(0, 4), value
					.substr(4, 2) - 1, value.substr(6, 2)));
			}
			return "NA";
		},
		onSmCardRequired: function (sim) {
			if (sim === "P" || sim === "N" || sim === "") {
				return "No";
			} else {
				return "Yes";
			}
		},
		onSmCardRequiredKey: function (sim) {
			if (sim === "P" || sim === "N" || sim === "") {
				return "N";
			} else {
				return "Y";
			}
		},
		onSmCardType: function (type) {
			if (type === "P" || type === "") {
				return "-";
			} else if (type === "NO") {
				return "Normal";
			} else if (type === "MI") {
				return "Micro";
			} else if (type === "NA") {
				return "Nano";
			} else {
				return type;
			}
		},
		onInternetRequired: function (internet) {
			if (internet === "P" || internet === "N" || internet === "") {
				return "No";
			} else {
				return "Yes";
			}
		},
		onVisibleSimTypeInternet: function (sim) {
			if (sim === "P" || sim === "N" || sim === "") {
				return false;
			} else {
				return true;
			}

		},
		onMealPreference: function (meal, MealList) {
			if (meal === "" || meal === undefined) {
				return "Not specified";
			} else {
				if (MealList !== undefined) {
					for (var i = 0; i < MealList.results.length; i++) {
						if (meal === MealList.results[i].DOMVALUE_L) {
							return MealList.results[i].DDTEXT;
						}
					}
				} else {
					return "Not specified";
				}
			}
		},
		onMobile: function (mobile) {
			if (mobile === "" || mobile === undefined) {
				return "Not specified";
			} else {
				return mobile;
			}
		},
		onWBSElement: function (wbs) {
			if (wbs === "" || wbs === undefined) {
				return "-";
			} else {
				return wbs;
			}
		},
		TravellerName: function (value) {
			if (value === "00") {
				return "Self";
			} else if (value === "01") {
				return "Spouse";
			} else if (value === "02") {
				return "Child 1";
			} else if (value === "90") {
				return "Child 2";
			} else if (value === "03") {
				return "Child 3";
			} else if (value === "04") {
				return "Child 4";
			} else if (value === "05") {
				return "Child 5";
			}
		},
		onTransport: function (value) {
			if (value === "A") {
				return "Air";
			} else if (value === "T") {
				return "Train";
			} else if (value === "B") {
				return "Bus";
			} else if (value === "X") {
				return "Taxi";
			} else if (value === "O") {
				return "Own arrangements";
			}
		},
		onInsurance: function (insurance) {
			if (insurance === "A") {
				return "Only for the first Month";
			} else if (insurance === "B") {
				return "For the entire period of stay";
			} else {
				return "None";
			}
		},
		onDateFormat: function (date) {
			if (date !== "" && date !== "00000000" && date !== undefined && date !== null) {
				return date.substring(6, 8) + "/" + date.substring(4, 6) + "/" + date.substring(0, 4);
			} else {
				return "-";
			}
		},
		onTravelTo: function (travel) {
			if (travel === "GLOB") {
				return "Global Customer";
			} else if (travel === "INBO") {
				return "Within Bosch";
			} else if (travel === "INRB") {
				return "Within RBEI";
			} else {
				return "None";
			}
		},
		onAddInfoColumnVisible: function (fund) {
			for (var i = 0; i < fund.length; i++) {
				if (fund[i].ZZ_GEBER === "F03") {
					return true;
				} else {
					return false;
				}
			}
		},
		CountryName: function (from, list) {
			if (from !== undefined && from !== "" && list !== undefined) {
				for (var i = 0; i < list.length; i++) {
					if (from === list[i].MOLGA) {
						return list[i].LTEXT;
						break;
					}
				}
			}
		},
		onVisibleVisaItems: function (val) {
			if (val === "X") {
				return true;
			} else {
				return false;
			}
		},
		DomeVisible: function (val) {
			if (val === "DOME") {
				return false;
			} else {
				return true;
			}
		},
		onVisaCategory: function (value) {
			if (value === "1") {
				return "Domestic travel";
			} else if (value === "2") {
				return "Business Visa";
			} else if (value === "3") {
				return "Work Permit";
			} else if (value === "4") {
				return "Training Visa";
			} else if (value === "5") {
				return "International Visa";
			}
		},
		getEndorsement: function (value) {
			switch (value) {
			case '':
				return "New";
			case '1':
				return 'Travel Extended';
			case '2':
				return 'Travel Shortened';
			case '3':
				return 'Change in dependents';
			case '4':
				return 'Dependent date change';
			case '5':
				return 'Cancelled';
			}
		},
		getInsuranceFamilyStatus: function (sType) {
			switch (sType) {
			case "1":
				return "Single";
			case "2":
				return "Couple";
			case "3":
				return "Family";
			case "4":
				return "Single Parent";
			}
		},
		getQuestion: function (sKey, oData) {
			//	var oView = com.bosch.hr.swift_trv.model.Common.findView(this);
			//var oData = oView.getModel("new").getData();
			var iIndex = com.bosch.hr.swift_trv.model.Common.getArrayIndex(oData.results, "ZZ_QA_KEY", sKey);
			if (iIndex !== -1) {
				return oData.results[iIndex].ZZ_QA_ANS;
			}
			return "";
		},
		QuestionnaireName: function (name, value) {
			var type = "";
			if (value === "00") {
				type = "Self";
			} else if (value === "01") {
				type = "Spouse";
			} else if (value === "02") {
				type = "Child 1";
			} else if (value === "90") {
				type = "Child 2";
			} else if (value === "03") {
				type = "Child 3";
			} else if (value === "04") {
				type = "Child 4";
			} else if (value === "05") {
				type = "Child 5";
			}

			if (name === undefined || name === "") {
				name = "";
			}

			if (type === "") {
				return "";
			} else {
				return name + " ( " + type + " ) ";
			}
		},
		getFileType: function (sExtension) {
			switch (sExtension) {
			case ".gif":
			case ".jpeg":
			case ".png":
			case ".jpg":
				return "image/jpg";
			case ".doc":
			case ".docx":
				return "application/msword";
			case ".xls":
			case ".xlsx":
				return "application/msexcel";
			case ".pdf":
				return "application/pdf";
			}
			return "text/plain";
		},
		ChargeText: function (value) {
			if (value === "01") {
				return "Reissuance charges";
			} else if (value === "02") {
				return "Cancellation charges";
			} else if (value === "03") {
				return "Side trip ticket";
			} else if (value === "04") {
				return "Others";
			} else {
				return "-";
			}
		},
		formatTicketCommentsDate: function (value) {
			if (value == "") {
				return "NA";
			} else {
				try {
					var date = value.split("T");
					return date[0].split("-").reverse().join("/");
				} catch (exc) {
					return "";
				}
			}
		},
		formatInsuranceCommentsDate: function (value) {

			if (value == "") {
				return "NA";
			} else {
				try {
					var date = value.substring(6, 8) + "/" + value.substring(4, 6) + "/" + value.substring(0, 4);
					return date;
				} catch (exc) {
					return "";
				}
			}

		},
		getRadioIndex: function (val) {
			if (val !== "" && val !== undefined) {
				return parseInt(val, 10);
			} else {
				return 1;
			}
		},
		editableEmployee: function (value) {
			if (value === '02') { // Open
				return false;
			} else if (value === '00') { // Create
				return true;
			} else { //Change
				if (sap.ui.getCore().getModel("profile").getData().currentRole === "EMP") {
					return true;
				} else {
					return false;
				}
			}
		},
		setAcknowledgementCheck: function (value) {
			return value === '02' || sap.ui.getCore().getModel("profile").getData().currentRole !== "EMP";
		},
		VisiblePersonalTrip: function (trvtype, smodid) {
			if (trvtype === "BUSR" && smodid === "INTL") {
				return true;

			} else {
				return false;
			}
		},
		VisiblePersonalTripDates: function (PersFlag) {
			if (PersFlag === "X") {
				return true;
			} else {
				return false;
			}
		},
		PersFlagSelectedKey: function (PersFlag) {
			if (PersFlag === "X") {
				return "01";
			} else {
				return "02";
			}
		},
		PersFlagSelectedKeyText: function (PersFlag) {
			if (PersFlag === "X") {
				return "Yes";
			} else {
				return "No";
			}
		}

	};
});