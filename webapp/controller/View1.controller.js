sap.ui.define([
    'sap/m/library',
    "sap/ui/core/mvc/Controller",
    'sap/m/MessageToast',
    'sap/m/SearchField',
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "pedidos/utils/formatter",
    "sap/m/MessageBox",
    'sap/ui/export/library',
    'sap/ui/export/Spreadsheet',
    'sap/m/TablePersoController'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (mlibrary, Controller, MessageToast, SearchField, Filter, FilterOperator, JSONModel, Fragment, Sorter, formatter, MessageBox, exportLibrary, Spreadsheet, TablePersoController) {
        "use strict";
        var EdmType = exportLibrary.EdmType
        var ResetAllMode = mlibrary.ResetAllMode;

        return Controller.extend("pedidos.controller.View1", {

            formatter: formatter,
            onInit: function () {
               
            },
            onSearch: function () {

                var that = this

                var oModel = this.oView.getModel()

                var oDataFilter = new Array()

                // Format the date
                var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "YYYYMMdd" });
                var desde = dateFormat.format(this.getView().byId("fecha").getDateValue());
                var hasta = dateFormat.format(this.getView().byId("fecha").getSecondDateValue());

                oDataFilter.push(
                    new Filter("OrgVentas", FilterOperator.EQ, this.getView().byId("orgventa").getValue())
                )
                oDataFilter.push(
                    new Filter("StatusPedido", FilterOperator.EQ, this.getView().byId("status").getValue())
                )
                if (desde && hasta) {
                    oDataFilter.push(
                        new Filter("FechaCreacion", FilterOperator.BT, desde, hasta)
                    )
                }


                console.log(oDataFilter)
                let queryFilter = new Array(
                    new Filter({
                        filters: oDataFilter,
                        and: true
                    })
                )

                oModel.read("/SetPedidos", {
                    filters: queryFilter,
                    success: function (data) {
                        MessageToast.show("Cargando datos")

                        if (data.results.length) {
                            that.oView.setModel(new JSONModel({
                                count: data.results.length,
                                datos: data.results
                            }), "datosVarios")

                        } else {
                            MessageToast.show("No hay datos para esta organizacion con este estado")
                            that.oView.setModel(new JSONModel({
                                count: data.results.length,
                                datos: data.results
                            }), "datosVarios")
                        }
                    },
                    error: function () {
                        MessageToast.show("No hay datos")
                    }
                })

            },
            onCleanFilters: function () {
                this.getView().byId("fecha").setValue(null);
                this.getView().byId("status").setValue(null);
                this.getView().byId("orgventa").setValue(null);
            },
            _requiredFieldsCompleted: function () {

                return (
                    this.byId("orgventa").getValue().length &&		//Validate client entry
                    this.byId("status").getValue().length 		//Validate range of dates
                );
            },
            createColumnConfig: function () {
                var aCols = [];

                aCols.push({
                    label: 'Usuario',
                    property: 'Usuario',
                    type: EdmType.String,
                    template: '{0}'
                });

                aCols.push({
                    label: 'Fecha',
                    type: EdmType.Number,
                    property: 'FechaDoc',
                    scale: 0
                });
                aCols.push({
                    label: 'Org Ventas',
                    type: EdmType.String,
                    property: 'OrgVentas',
                    scale: 0
                });
                aCols.push({
                    label: 'Status Pedido',
                    type: EdmType.String,
                    property: 'StatusPedido',
                    scale: 0
                });
                aCols.push({
                    label: 'Valor Neto',
                    type: EdmType.Number,
                    property: 'ValorNeto',
                    scale: 0
                });


                return aCols;
            },

            onExport: function () {
                var aCols, oRowBinding, oSettings, oSheet, oTable;

                if (!this._oTable) {
                    this._oTable = this.byId('idTablaPedidos');
                }

                oTable = this._oTable;
                oRowBinding = oTable.getBinding('items');
                aCols = this.createColumnConfig();

                oSettings = {
                    workbook: {
                        columns: aCols,
                        hierarchyLevel: 'Level'
                    },
                    dataSource: oRowBinding,
                    fileName: 'Table export sample.xlsx',
                    worker: false // We need to disable worker because we are using a MockServer as OData Service
                };

                oSheet = new Spreadsheet(oSettings);
                oSheet.build().finally(function () {
                    oSheet.destroy();
                });
            },
            onPersoButtonPressed: function (oEvent) {
                this._oTPC.openDialog();
            },




        });
    });

