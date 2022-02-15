sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/View",
], function (Controller, View) {
	"use strict";

	return Controller.extend("app.SmartControlXMLTemplate.controller.ObjectPage", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf app.SmartControlXMLTemplate.view.ObjectPage
		 */
		onInit: function () {
			this.getOwnerComponent().getRouter().attachRouteMatched(this.onRouteMatched.bind(this));
		},
		onRouteMatched: function (oEvent) {
			debugger;
			var oPage = this.getView().byId("objectPage"),
				oModel = this.getView().getModel(),
				oMetaModel = oModel.getMetaModel(),
				sId = oEvent.getParameter('arguments').Id,
				sPath=`/Products('${sId}')`;
			oMetaModel.loaded().then(function () {
				debugger;
				var entitySet = oMetaModel.getODataEntitySet("Products"),
					annotation = oMetaModel.getODataEntityType(entitySet.entityType);
				console.log(annotation);

				var oCreateContent = View.create({
					preprocessors: {
						xml: {
							bindingContexts: {
								meta: oMetaModel.getMetaContext("/Products")
							},
							models: {
								meta: oMetaModel
							}
						}
					},
					type: sap.ui.core.mvc.ViewType.XML,
					viewName: "app.SmartControlXMLTemplate.view.Detail"
						// controller: oController
				});
				oCreateContent.then(function (oView) {
					oPage.removeAllContent();
					oPage.addContent(oView);
					oView.bindElement({
						path:sPath,
						change:function(oEvent){
							debugger;
						}.bind(this),
						dataRequested:function(oEvt){
							debugger;
						}.bind(this),
						dataReceived:function(oData){
							debugger;
						}.bind(this)
					});
				}.bind(this));

			}.bind(this));
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf app.SmartControlXMLTemplate.view.ObjectPage
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf app.SmartControlXMLTemplate.view.ObjectPage
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf app.SmartControlXMLTemplate.view.ObjectPage
		 */
		//	onExit: function() {
		//
		//	}

	});

});