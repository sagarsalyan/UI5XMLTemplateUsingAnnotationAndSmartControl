function initModel() {
	var sUrl = "/sap/opu/odata/sap/EPM_REF_APPS_SHOP_SRV/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}