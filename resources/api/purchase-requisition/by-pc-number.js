GET('purchase-requisition/by-purchase-contract/:number', () => {
    var data = param(),
        rule = {
            number : ['exists:purchase_contracts,number']
        };
    
    validate(data, rule, () => {
        var pr =PurchaseRequisition .select('purchase_requisitions.id', 'purchase_requisitions.number', 'purchase_requisitions.remarks', 'business_unit.id as business_unit_id', 'business_unit.location_code as business_unit_code', 'business_unit.description as business_unit_description')

                                    .join('purchase_requisition_details', 'purchase_requisition_id'                     , 'purchase_requisitions.id')
                                    .join('purchase_contract_details'   , 'purchase_contract_details.product_id'        , 'purchase_requisition_details.product_id')
                                    .join('purchase_contracts'          , 'purchase_contracts.id'                       , 'purchase_contract_id')
                                    .join('locations as business_unit'  , 'purchase_requisitions.business_unit_id'      , 'business_unit.id')

                                    .where('purchase_contracts.number', data.number)
                                    .groupBy('purchase_requisitions.id', 'purchase_requisitions.number', 'purchase_requisitions.remarks', 'business_unit.id', 'business_unit.location_code', 'business_unit.description')
                                    .get();

        foreach(pr, (index, each) => {
            var details = PurchaseRequisitionDetail     .select('purchase_requisition_details.id as purchase_requisition_detail_id', 'purchase_contract_details.id as purchase_contract_detail_id', 'products.id as product_id', 'products.brand', 'products.product_code', 'products.type', 'products.description', 'purchase_contract_details.price', 'purchase_contract_details.quantity', 'warehouse.id as warehouse_id', 'warehouse.location_code as warehouse_code', 'warehouse.description as warehouse_description')

                                                    // .join('purchase_requisition_details'    , 'purchase_requisition_id'                     , 'purchase_requisitions.id')
                                                    .join('products'                        , 'products.id'                                 , 'purchase_requisition_details.product_id')
                                                    .join('purchase_contract_details'       , 'purchase_contract_details.product_id'        , 'purchase_requisition_details.product_id')
                                                    .join('purchase_contracts'              , 'purchase_contracts.id'                       , 'purchase_contract_id')
                                                    .join('locations as warehouse'          , 'purchase_requisition_details.location_id'    , 'warehouse.id')

                                                    .where('purchase_requisition_id', each.id)
                                                    .where('purchase_contracts.number', data.number)
                                                    .get();

            foreach(details, (index, eachDetails) => {
                eachDetails.quantity_fulfilled = PurchaseRequisitionQuantityStock.where('purchase_requisition_detail_id', eachDetails.purchase_requisition_detail_id).sum('quantity_fulfilled');
                eachDetails.quantity_left 		= eachDetails.quantity - eachDetails.quantity_fulfilled; 
            });

            each.details = details;
        });

        res(pr);
    });
});
