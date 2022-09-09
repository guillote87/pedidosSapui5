sap.ui.define([
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
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageToast, SearchField, Filter, FilterOperator, JSONModel,Fragment,Sorter,formatter,MessageBox) {
        "use strict";

        return Controller.extend("pedidos.controller.View1", {
			formatter: formatter,
            onInit: function () {

            },
            onSearch: function () {
                if (!this._requiredFieldsCompleted()){
                    MessageBox.error("Debes completar todos los filtros");
                    return;
                }
                var that = this		
                
				var oModel = this.oView.getModel()

                var oDataFilter = new Array()
               
                oDataFilter.push(
                    new Filter("OrgVentas", FilterOperator.EQ, this.getView().byId("orgventa").getValue())
                )
                oDataFilter.push(
                    new Filter("StatusPedido", FilterOperator.EQ, this.getView().byId("status").getValue())
                )
               
                        new Filter("I_FECHA_DESDE", FilterOperator.EQ, this.getView().byId("desdehasta").getDateValue()),
                        new Filter("I_FECHA_HASTA", FilterOperator.EQ, this.getView().byId("desdehasta").getSecondDateValue())
                

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
					
						if (data.results.length){
							that.oView.setModel(new JSONModel({
								count: data.results.length,
								datos: data.results}), "datosVarios")
							
						}else{
								MessageToast.show("No hay datos para esta organizacion con este estado")
								that.oView.setModel(new JSONModel({
									count: data.results.length,
									datos: data.results}), "datosVarios")
						}
                    },
                    error: function () {
                        MessageToast.show("No hay datos")
                    }
                })
           
            },
            _requiredFieldsCompleted: function(){

                return (
             this.byId("orgventa").getValue().length &&		//Validate client entry
                      this.byId("status").getValue().length 		//Validate range of dates
                );
            },
	});
});
     
