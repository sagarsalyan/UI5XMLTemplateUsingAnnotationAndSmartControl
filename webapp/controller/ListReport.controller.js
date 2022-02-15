sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("app.SmartControlXMLTemplate.controller.ListReport", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf app.SmartControlXMLTemplate.view.ListReport
		 */
		onInit: function () {

		},
		onClickTableRow: function (oEvent) {
			var sId = oEvent.getSource().getBindingContext().getProperty("Id");
			this.getOwnerComponent().getRouter().navTo("ObjectPage", {
				Id: sId
			});
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf app.SmartControlXMLTemplate.view.ListReport
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf app.SmartControlXMLTemplate.view.ListReport
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf app.SmartControlXMLTemplate.view.ListReport
		 */
		//	onExit: function() {
		//
		//	}

	});

});