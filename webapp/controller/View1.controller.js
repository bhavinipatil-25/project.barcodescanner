sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ndc/BarcodeScanner",
    "sap/ui/core/Element"
], (Controller, MessageBox, MessageToast, JSONModel, BarcodeScanner, Element) => {
    "use strict";

    var prefixId;
    var oScanResultText;

    return Controller.extend("project.barcodescanner.controller.View1", {
        // onInit() {
        //     var that = this;
        //     var oModel = that.getOwnerComponent().getModel('main');
        //     //  console.log(oModel);
        //     var oKeys = {
        //         MATNR: "",
        //         WERKS: "VC01"
        //     };

        //     var sPath = "/" + oModel.createKey("Mat_Doc_InfoSet", oKeys);
        //     oModel.read(sPath, {
        //         success: function (oData, oResponse) {
        //             console.log("Data retrieved:", oData);
        //         },
        //         error: function (oError) {
        //             console.error("Error reading data:", oError);
        //         }
        //     })


        // },
        onScan() {
            var that = this;
            BarcodeScanner.scan(
                function (mResult) {
                    if (!mResult.cancelled) {
                        //   console.log(mResult);
                        that.getView().byId("materialNumber").setValue(mResult.text);
                        var sInput = "5081928085|461815261143|80.000|VC01|1500596561";
                        var aParts = sInput.split("|");
                        // Accessing individual parts:
                        var sID = aParts[0];      // "5081928085"
                        var sValue = aParts[2];   // "80.000"
                        var sCode = aParts[3];    // "VC01"
                        var oModel = that.getOwnerComponent().getModel('main');
                        var oTable = that.getView().byId("idProductsTable");
                        var oKeys = {
                            MATNR: "",
                            WERKS: "VC01"
                        };
                        var sPath = "/" + oModel.createKey("Mat_Doc_InfoSet", oKeys);
                        oModel.read(sPath, {
                            success: function (oData, oResponse) {
                                var aData = [oData];
                                var oModel = new JSONModel(aData);
                                console.log(oModel);
                                that.getView().byId("idProductsTable").setModel(oModel, "productModel")
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
        onPost() {
            var oTable = this.byId("idProductsTable");
            var aSelectedItems = oTable.getSelectedItems();
            if (aSelectedItems.length === 0) {
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
                var oModel = that.getOwnerComponent().getModel('main');
                oModel.create("/YourEntitySet", oPayload, {
                    success: function (oData) {
                        MessageToast.show("Data Posted Successfully");
                    },
                    error: function (oError) {
                        var sMessage = "An error occurred";
                        if (oError.responseText) {
                            try {
                                var oResponse = JSON.parse(oError.responseText);
                                // Standard SAP Gateway error path
                                sMessage = oResponse.error.message.value;
                            } catch (e) {
                                sMessage = oError.responseText; // Fallback to raw text
                            }

                        } else if (oError.message) {
                            sMessage = oError.message; // Generic UI5 error
                        }
                        sap.m.MessageToast.show(sMessage, {
                            duration: 5000,      // Show for 5 seconds
                            width: "20em"        // Wider toast for long messages
                        });

                    }
                });

            });

        }

    });
});