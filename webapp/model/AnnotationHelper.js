sap.ui.define([],
	function () {
		"use strict";

		/**
		 * exclude annotationPath and entitySet
		 * for further functionality
		 * @private
		 */
		var _getAnnotationPath = function (oAnnotationPathContext) {
			var oAnnotationObj = oAnnotationPathContext.getObject(),
				sAnnotationPath, sEntitySet, sAnnotationHeadPath;

			if (typeof oAnnotationObj === "string") {
				sAnnotationPath = oAnnotationObj;
			} else {
				sAnnotationPath = oAnnotationObj.path;
				sEntitySet = oAnnotationObj.entitySet;
				sAnnotationHeadPath = oAnnotationObj.headerPath;
			}
			return {
				entitySet: sEntitySet,
				path: sAnnotationPath,
				headerPath: sAnnotationHeadPath
			};
		};

		/**
		 * get annotation binding context for object page
		 * content OR header
		 * @private
		 */
		var _resolveObjectPagePath = function (oAnnotationPathContext, sPathPropertyName) {
			var oModel = oAnnotationPathContext.getModel(),
				oData = _getAnnotationPath(oAnnotationPathContext);

			if (!oData.entitySet) {
				oData.entitySet = oModel.getProperty("/tempData/entitySet");
			}

			var oAnnotationByPath = getAnnotationByPath(oData[sPathPropertyName], oData.entitySet, oModel),
				oBindingPath = _createBindingContext(oAnnotationPathContext, sPathPropertyName);

			if (!oAnnotationByPath) {
				var splittedAnno = oData[sPathPropertyName].split("#"),
					sQualifier = splittedAnno[1],
					sNewAnnoPath = splittedAnno[0],
					oContextObject = oAnnotationPathContext.getObject();

				sQualifier = sQualifier.slice(0, sQualifier.lastIndexOf("_"));
				if (typeof oContextObject === "string") {
					oModel.setProperty("/annotationPath", sNewAnnoPath + "#" + sQualifier);
				} else {
					oModel.setProperty("/annotationPath/" + sPathPropertyName, sNewAnnoPath + "#" + sQualifier);
				}
				oBindingPath = _createBindingContext(oAnnotationPathContext, sPathPropertyName);
			}
			return oBindingPath;
		};

		/**
		 * create context binding based on annotation path
		 * context from metadata model
		 * @private
		 */
		var _createBindingContext = function (oAnnotationPathContext, sPathPropertyName) {
			var oAnnotationObj = oAnnotationPathContext.getObject(),
				oData = _getAnnotationPath(oAnnotationPathContext);

			var oModel = oAnnotationPathContext.getModel();
			var oMetaModel = oModel.getProperty("/metaModel");
			var oEntitySet = oMetaModel.getODataEntitySet(oData.entitySet ? oData.entitySet : oModel.getProperty("/tempData/entitySet"));
			var oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
			return oMetaModel.createBindingContext(oEntityType.$path + "/" + oData[sPathPropertyName]);
		};

		/**
		 * resolve annotation path saved in JsonModel
		 * @public
		 */
		var resolveModelPath = function (oAnnotationPathContext) {
			return _createBindingContext(oAnnotationPathContext, "path");
		};

		/**
		 * get annotation context by qualifier with splitter "_"
		 * for object page header content
		 * checks if there are annoations available or not
		 * @public
		 */
		var resolveObjectHeaderPath = function (oAnnotationPathContext) {
			return _resolveObjectPagePath(oAnnotationPathContext, "headerPath");
		};

		/**
		 * get annotation context by qualifier with splitter "_"
		 * for object page content
		 * checks if there are annoations available or not
		 * @public
		 */
		var resolveObjectContentPath = function (oAnnotationPathContext) {
			return _resolveObjectPagePath(oAnnotationPathContext, "path");
		};

		/**
		 * get property name from path
		 * @public
		 */
		var getPathName = function (oInterface) {
			return oInterface ? oInterface.Path : undefined;
		};

		/**
		 * get entityType name from path
		 * for setting smartField property name
		 * @public
		 */
		var getSmartFieldName = function (oInterface) {
			var sPathName = getPathName(oInterface);
			return sPathName ? "id" + sPathName : undefined;
		};

		/**
		 * get SmartTable parameter from Json Model "templateProperties" 
		 * @param oParams - path /Configs/Tables
		 * @param sId - ID of annotation qualifier/longdescription
		 * @param sKey - prameter name of SmartTable
		 * @public
		 */
		var getSectionsTableParam = function (sKey, oParams, sId) {
			var params = oParams[sId];
			if (params) {
				var sRefrenze = params.REFERENCE;
				if (params[sKey]) {
					return params[sKey];
				} else if (sRefrenze) {
					return getSectionsTableParam(sKey, oParams, sRefrenze);
				}
			}
			return "";
		};

		var getAnnotationByPath = function (sAnnotationPath, sEntitySet, oModel) {
			var oMetaModel = oModel.getMetaModel() || oModel.getProperty("/metaModel"),
				oEntitySet = oMetaModel.getODataEntitySet(sEntitySet),
				oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
			return oEntityType[sAnnotationPath];
		};

		/**
		 * get from SmartTable annotations SortOrder 
		 * Only for responsive tables
		 */
		var getDefaultTableSorter = function (oSource, oModel) {
			var sEntitiySet = oSource.getEntitySet(),
				oMetaModel = oModel.getMetaModel(),
				oEntitySet = oMetaModel.getODataEntitySet(sEntitiySet),
				oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType),
				aPresentVariant = oEntityType["com.sap.vocabularies.UI.v1.PresentationVariant"],
				aSorter = [];

			if (!aPresentVariant) {
				aPresentVariant = oEntityType["UI.PresentationVariant"];
			}
			if (!aPresentVariant) {
				return aSorter;
			}

			if (aPresentVariant.SortOrder) {
				var aSortOrder = aPresentVariant.SortOrder;
				aSortOrder.forEach(function (item) {
					if (item.RecordType === "com.sap.vocabularies.Common.v1.SortOrderType" || item.RecordType === "Common.SortOrderType") {
						var bSortDesc = false;
						if (item.Descending) {
							bSortDesc = item.Descending.Bool === "true";
						}
						if (item.Property) {
							aSorter.push(new sap.ui.model.Sorter(item.Property.PropertyPath || item.Property.Path, bSortDesc));
						}
					}
				});
			}
			return aSorter;
		};

		/**
		 * RequestAtleast from annotations are not joined automatic in some cases
		 * So will add manually them before table fetch new data
		 * @param oSource {Object} SmartTable
		 * @param oModel {Object} oData Model
		 * @param oBindingParams {Object} table binding parameters
		 */
		var getDefaultTableSelects = function (oSource, oModel, oBindingParams) {
			var sEntitiySet = oSource.getEntitySet(),
				oMetaModel = oModel.getMetaModel(),
				oEntitySet = oMetaModel.getODataEntitySet(sEntitiySet),
				oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType),
				aPresentVariant = oEntityType["com.sap.vocabularies.UI.v1.PresentationVariant"],
				sCurrSelects = oBindingParams.parameters.select,
				aSelects = [];

			if (sCurrSelects && sCurrSelects !== "") {
				aSelects = sCurrSelects.split(",");
			}
			if (!aPresentVariant) {
				aPresentVariant = oEntityType["UI.PresentationVariant"];
			}
			if (!aPresentVariant) {
				return aSelects.join(",");
			}

			if (aPresentVariant.RequestAtleast) {
				var aRequestAtleast = aPresentVariant.RequestAtleast;
				aRequestAtleast.forEach(function (item) {
					if (aSelects.indexOf(item.PropertyPath) < 0) {
						aSelects.push(item.PropertyPath);
					}
				});
			}
			return aSelects.join(",");
		};

		/**
		 * checks if an value is in templateProp Json Model navigation links
		 */
		var isInNavLinks = function (sValue, mNavLinks) {
			if (mNavLinks.hasOwnProperty(sValue)) {
				return true;
			}
			return null;
		};

		/**
		 * checks if an annotation Description has a string of "longText"
		 */
		var isLongTextTab = function (sDescription) {
			if (sDescription && sDescription === "longText") {
				return true;
			}
			return false;
		};

		/**
		 * checks if annotation description has tab name inside
		 */
		var hasTabNameInDescription = function (sValue, sAnnotation, sLongAnnotation) {
			if (sAnnotation.indexOf(sValue) >= 0 || sLongAnnotation.indexOf(sValue) >= 0) {
				return true;
			}
			return false;
		};

		var _getLineItems = function (oMetaModel, sEntitySet) {
			var oEntitySet = oMetaModel.getODataEntitySet(sEntitySet);
			if (!oEntitySet) {
				return [];
			}
			var oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
			if (oEntityType["com.sap.vocabularies.UI.v1.LineItem"]) {
				return oEntityType["com.sap.vocabularies.UI.v1.LineItem"];
			}
			return [];
		};

		/**
		 * for create form can be also a splitted view with left side tree and right side selection list
		 * when it has CollectionFacet inside then it is single view with form
		 * 
		 * check in annotation tab infos an entitySet is defined
		 * When entitySet is defined and lineItems are found in MetaModel then test is true
		 * and in JsonModel templateProperties are lineItems are saved
		 * 
		 */
		var isSplittedViewCheck = function (aContentTabs, oTempModelData) {
			var oMetaModel = oTempModelData.metaModel,
				isSplittedView = false;

			for (var i = 0; i < aContentTabs.length; i++) {
				var oTabInfos = aContentTabs[i];
				if (oTabInfos.RecordType === "com.sap.vocabularies.UI.v1.CollectionFacet") {
					isSplittedView = false;
				} else {
					isSplittedView = true;
					oTempModelData.tempData.isSplittedView = isSplittedView;
					var longDescAnno = oTabInfos["Org.OData.Core.V1.LongDescription"] || oTabInfos["Core.LongDescription"],
						descAnno = oTabInfos["Org.OData.Core.V1.Description"] || oTabInfos["Core.Description"];

					//get entitySet lineItems
					if (longDescAnno) {
						var sEntitySet = longDescAnno.String,
							sTabName = descAnno.String,
							aLineItems = _getLineItems(oMetaModel, sEntitySet),
							tempTableData = oTempModelData.tempData.splittedViewTableConfigs;

						if (tempTableData) {
							tempTableData.forEach(function (mTableConfig) {
								if (mTableConfig.tabName === sTabName) {
									mTableConfig.entitySet = sEntitySet;
									mTableConfig.lineItems = aLineItems;
								}
							});
						}
					}
				}
			}
			return isSplittedView;
		};

		/**
		 * get extension point name for field group before and after
		 * in SmartFormTemplate fragment
		 */
		var getFieldExtPoint = function (oTarget, oField, oAnnoPath, sAddString) {
			var sExtPointName = "FormExtP";
			if (oAnnoPath.path) {
				sExtPointName += "|" + oAnnoPath.path.split("#")[1];
			}
			if (oTarget.Target) {
				var sTargetPath = oTarget.Target.AnnotationPath.split("#");
				sExtPointName += "|" + sTargetPath[1];
			}
			if (oField.Path) {
				sExtPointName += "|" + oField.Path;
			}
			sExtPointName = sAddString ? sExtPointName + "|" + sAddString : sExtPointName;
			return sExtPointName;
		};

		/**
		 * get extension point name for field group before and after
		 * in SmartFormTemplate fragment
		 */
		var getFieldGroupExtPoint = function (oTarget, oField, oAnnoPath, sAddString) {
			var sExtPointName = "FormExtP";
			if (typeof oAnnoPath === "string") {
				sExtPointName += "|" + oAnnoPath.split("#")[1];
			} else if (oAnnoPath.path) {
				sExtPointName += "|" + oAnnoPath.path.split("#")[1];
			}
			if (oTarget.Target) {
				var sTargetPath = oTarget.Target.AnnotationPath.split("#");
				sExtPointName += "|" + sTargetPath[1];
			}
			if (typeof oField === "string") {
				sExtPointName += "|" + oField;
			} else if (oField.Path) {
				sExtPointName += "|" + oField.Path;
			}
			sExtPointName = sAddString ? sExtPointName + "|" + sAddString : sExtPointName;
			return sExtPointName;
		};

		var getEntitySet = function (sEntitySet, sDesc, sLongText) {
			return sEntitySet || sDesc || sLongText;
		};

		/**
		 * get extension point name for dynamic SmartTables
		 */
		var getExtPoint = function (sTabName, sEntitySet, sDesc, sLongText, sAddString) {
			var sExtPointName = "TableExtP";

			if (sTabName) {
				sExtPointName += "|" + sTabName;
			}
			var sEntitySetName = getEntitySet(sEntitySet, sDesc, sLongText);
			if (sEntitySetName) {
				sExtPointName += "|" + sEntitySetName;
			}
			sExtPointName = sAddString ? sExtPointName + "|" + sAddString : sExtPointName;
			return sExtPointName;
		};

		/**
		 * checks if a special property is allowed for create
		 * and set field details also to JsonModel
		 */
		var isFieldCreatableAndSetMetaData = function (mLineItem, mTableDetails, oTempModelData) {
			var oMetaModel = oTempModelData.metaModel,
				oEntitySet = oMetaModel.getODataEntitySet(mTableDetails.entitySet),
				oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType),
				sFieldName = mLineItem.Value.Path;

			var oProperty = oMetaModel.getODataProperty(oEntityType, sFieldName);
			//check if key is creatable true
			if (oProperty && (!oProperty.hasOwnProperty("sap:creatable") || oProperty["sap:creatable"] === "true")) {
				mLineItem.Property = oProperty;
				return true;
			}
			return false;
		};

		return {
			resolveModelPath: resolveModelPath,
			resolveObjectHeaderPath: resolveObjectHeaderPath,
			resolveObjectContentPath: resolveObjectContentPath,
			getPathName: getPathName,
			getSmartFieldName: getSmartFieldName,
			getSectionsTableParam: getSectionsTableParam,
			getAnnotationByPath: getAnnotationByPath,
			getDefaultTableSorter: getDefaultTableSorter,
			getDefaultTableSelects: getDefaultTableSelects,
			isInNavLinks: isInNavLinks,
			isLongTextTab: isLongTextTab,
			hasTabNameInDescription: hasTabNameInDescription,
			isSplittedView: isSplittedViewCheck,
			getEntitySet: getEntitySet,
			isFieldCreatableAndSetMetaData: isFieldCreatableAndSetMetaData,
			getFieldExtPoint: getFieldExtPoint,
			getFieldGroupExtPoint: getFieldGroupExtPoint,
			getExtPoint: getExtPoint
		};

	},
	/* bExport= */
	true);