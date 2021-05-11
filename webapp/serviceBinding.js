function initModel() {
	var sUrl = "/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}