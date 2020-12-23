POST('purchase-order/insert' 	, function(){
	var data = req( 'reference', 'status', 'currency', 'term_of_payment', 'purchase_mode',
					'business_unit_id', 'purchase_contract_id', 'created_by'),
		rule = {
			// number                  : ['required' , 'unique:purchase_orders'],
			reference               : ['required'],
			status      			: ['required', 'in:cancel,draft,submitted,approved,rejected'],
			purchase_mode  			: ['required', 'in:consigment,regular'],
			currency                : ['required'],
			term_of_payment         : ['required'],
			created_by              : ['required' , 'exists:users,id'],
			business_unit_id        : ['required' , 'exists:locations,id'],
			purchase_contract_id    : ['required' , 'exists:purchase_contracts,id'],
			// supplier_id             : ['required' , 'exists:suppliers,id'],
		};

    validate(data, rule, () => {
		data.id 		= PurchaseOrder.max('id') + 1;
		data.number     = `PO-${moment().format('YYYYMMDD-HHmmss')}-${data.created_by}`;
		data.created_at = now();
		data.updated_at = now();

		var purchaseOrder =  PurchaseOrder.insert(data);
		
        if(!purchaseOrder){
            res('Internal server error occured', 500);
        } else {
            for(var i = 0 ; i < count(req('details')); i++){
				var poDetails                     				= PurchaseOrderDetail.instance();
					poDetails.id 								= PurchaseOrderDetail.max('id') + 1;
					poDetails.quantity 							= req('details')[i]['quantity'];
					poDetails.quantity_outstanding 				= req('details')[i]['quantity_outstanding'];
					poDetails.created_at 						= now();
					poDetails.product_id 						= req('details')[i]['product_id'];
					// poDetails.business_unit_id 			= req('details')[i]['business_unit_id'];
					// poDetails.warehouse_id 				= req('details')[i]['warehouse_id'];
					poDetails.purchase_requisition_id			= req('details')[i]['purchase_requisition_id'];
					poDetails.purchase_contract_detail_id		= req('details')[i]['purchase_contract_detail_id'];
					poDetails.purchase_requisition_detail_id	= req('details')[i]['purchase_requisition_detail_id'];
					poDetails.purchase_order_id 				= purchaseOrder.id;

				poDetails.insert();

				PurchaseRequisitionQuantityStock.insert({
					purchase_requisition_detail_id 	: req(`details.${i}.purchase_requisition_detail_id`),
					purchase_order_detail_id 		: poDetails.props('id'),
					quantity_fulfilled 				: req(`details.${i}.quantity`),
					created_at 						: now(true)
				});

				PurchaseContractQuantityStock.insert({
					purchase_contract_detail_id 	: req(`details.${i}.purchase_contract_detail_id`),
					purchase_order_detail_id 		: poDetails.props('id'),
					quantity_taken 					: req(`details.${i}.quantity`),
					created_at 						: now(true)
				});
			}
			
			
            res(purchaseOrder);
        }
    });
});
