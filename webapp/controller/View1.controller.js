sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ndc/BarcodeScanner",
    "sap/ui/core/Element",
    'sap/base/util/deepExtend',
    'sap/m/ColumnListItem',
    'sap/m/Input',
    'sap/m/Text'
], (Controller, MessageBox, MessageToast, JSONModel, BarcodeScanner, Element, deepExtend, ColumnListItem, Input, Text) => {
    "use strict";

    var prefixId;
    var oScanResultText;

    return Controller.extend("project.barcodescanner.controller.View1", {
        onInit() {
        },
        onScan() {
            var that = this;
            BarcodeScanner.scan(
                function (mResult) {
                    if (!mResult.cancelled) {
                        that.getView().byId("materialNumber").setValue(mResult.text);
                        var sInput = mResult.text;
                        var aParts = sInput.split("|");
                        var sID = aParts[0];
                        var sValue = aParts[2];
                        var sCode = aParts[3];
                        var oModel = that.getOwnerComponent().getModel('main');
                        var oTable = that.getView().byId("idProductsTable");

                        oModel.read("/Mat_Doc_InfoSet", {
                            filters: [new sap.ui.model.Filter("MATNR", "EQ", "000000261118010417"),
                            new sap.ui.model.Filter("WERKS", "EQ", "VC01")
                            ],
                            success: function (oData) {
                                console.log(oData);
                                var oModel = new JSONModel(oData.results);
                                that.getView().byId("idProductsTable").setModel(oModel, "productModel")
                                that.oReadOnlyTemplate = that.getView().byId("idProductsTable").removeItem(0);
                                that.rebindTable(that.oReadOnlyTemplate, "Navigation");
                                that.oEditableTemplate = new ColumnListItem({
                                    cells: [
                                        new Text({
                                            text: "{productModel>WERKS}",
                                        }), new Text({
                                            text: "{productModel>RSNUM}"
                                        }), new Text({
                                            text: "{productModel>RSPOS}"
                                        }), new Text({
                                            text: "{productModel>MATNR}"
                                        }), new Text({
                                            text: "{productModel>MEINS}"
                                        }), new Input({
                                            value: "{productModel>BDMNG}"
                                        }), new Text({
                                            text: "{productModel>ENMNG}"
                                        }), new Input({
                                            value: "{productModel>LGORT}"
                                        }), new Input({
                                            value: "{productModel>CHARG}"
                                        }),

                                    ]
                                })
                            },
                            error: function (oError) {
                                console.error("Error reading Table data:", oError);
                            }
                        })

                        that.getView().byId("idProductsTable").setVisible(true)
                    }
                },
                function (Error) {
                    alert("Scanning failed: " + Error);
                }
            );

        },
        onSelectionChange: function (oEvent) {
            var oTable = oEvent.getSource();
            var aSelectedContexts = oTable.getSelectedContexts(); // Get data pointers
            var aSelectedItems = oTable.getSelectedItems();     // Get UI elements

            aSelectedContexts.forEach(function (oContext) {
                console.log(oContext.getObject()); // The actual data record
            });
        },
        rebindTable: function (oTemplate, sKeyboardMode) {
            var that = this;
            that.getView().byId("idProductsTable").bindItems({
                path: "productModel>/",
                template: oTemplate,
                templateShareable: true,
                key: "WERKS"
            });
        },
        onEdit() {
            var that = this;
            this.aProductCollection = deepExtend([], that.getView().byId("idProductsTable").getModel("productModel").getProperty("/"));
            // console.log(that.aProductCollection);
            this.byId("editButton").setVisible(false);
            this.byId("saveButton").setVisible(true);
            this.byId("cancelButton").setVisible(true);
            this.rebindTable(this.oEditableTemplate, "Edit");
        },
        onCancel() {
            var that = this;
            this.byId("cancelButton").setVisible(false);
            this.byId("saveButton").setVisible(false);
            this.byId("editButton").setVisible(true);
            that.getView().byId("idProductsTable").getModel("productModel").setProperty("/", this.aProductCollection);
            this.rebindTable(this.oReadOnlyTemplate, "Navigation");

        },
        onPost() {
            var that = this;
            var oTable = this.byId("idProductsTable");
            var aSelectedItems = oTable.getSelectedItems();
            if (aSelectedItems.length === 0) {
                this.byId("saveButton").setVisible(true);
                this.byId("cancelButton").setVisible(true);
                this.byId("editButton").setVisible(false);
                return MessageToast.show("Please select at least one row");

            }
            aSelectedItems.forEach(function (oItem) {
                var oData = oItem.getBindingContext("productModel").getObject();
                // Map row data to your OData Entity properties
                var oPayload = {
                    "BANFN": oData.BANFN,
                    "WERKS": oData.WERKS,
                    "BDMNG": oData.BDMNG,
                    "BNFPO": oData.BNFPO,
                    "CHARG": oData.CHARG,
                    "ENMNG": oData.ENMNG,
                    "LGORT": oData.LGORT,
                    "MATNR": oData.MATNR,
                    "MEINS": oData.MEINS,
                    "RSART": oData.RSART,
                    "RSNUM": oData.RSNUM
                };
                that.byId("saveButton").setVisible(false);
                that.byId("cancelButton").setVisible(false);
                that.byId("editButton").setVisible(true);
                that.rebindTable(that.oReadOnlyTemplate, "Navigation");
                console.log(oPayload);
                // var oModel = this.getOwnerComponent().getModel('main');
                // oModel.create("/YourEntitySet", oPayload, {
                //     success: function (oData) {
                //         MessageToast.show("Data Posted Successfully");
                //     },
                //     error: function (oError) {
                //         var sMessage = "An error occurred";
                //         if (oError.responseText) {
                //             try {
                //                 var oResponse = JSON.parse(oError.responseText);
                //                 // Standard SAP Gateway error path
                //                 sMessage = oResponse.error.message.value;
                //             } catch (e) {
                //                 sMessage = oError.responseText; // Fallback to raw text
                //             }

                //         } else if (oError.message) {
                //             sMessage = oError.message; // Generic UI5 error
                //         }
                //         sap.m.MessageToast.show(sMessage, {
                //             duration: 5000,      // Show for 5 seconds
                //             width: "20em"        // Wider toast for long messages
                //         });

                //     }
                // });

            });

        }

    });
});