const 	PO 	= PurchaseOrder,
		POD = PurchaseOrderDetail;

/* PO Details */
GET('purchase-order/:id' 		, () => {
	var data = param(),
		rule = {
			id    : ['required' , 'exists:purchase_orders'],
		};

	validate(data, rule, () => {
		var result = PO.instance();
  
		result 	.select('purchase_orders.id', 'number', 'reference', 'status', 'currency', 'term_of_payment', 
						'processed_date', 'approved_date', 'cancelled_date', 'purchase_orders.created_at', 'purchase_orders.updated_at', 
						'processors.username as processed_by', 'approvers.username as approved_by', 'cancellers.username as cancelled_by', 
						'creators.username as created_by', 'updaters.username as updated_by', 'location_id', 'purchase_contract_id', 'supplier_id')
				.leftJoin('users as processors' , 'processors.id'   , 'purchase_orders.processed_by')
				.leftJoin('users as approvers'  , 'approvers.id'    , 'purchase_orders.approved_by')
				.leftJoin('users as cancellers' , 'cancellers.id'   , 'purchase_orders.cancelled_by')
				.leftJoin('users as creators'   , 'creators.id'     , 'purchase_orders.created_by')
				.leftJoin('users as updaters'   , 'updaters.id'     , 'purchase_orders.updated_by')
				.where('purchase_orders.id' , data.id);
		  
		var 	po 			= result.first(),
				poDetails 	= POD.instance();
				  
		poDetails 	.select('purchase_order_details.id', 'quantity', 'quantity_outstanding', 'purchase_order_details.created_at', 
							'purchase_order_details.updated_at', 'product_code', 'warehouses.location_code', 'business_units.location_code', 'purchase_orders.number')
					.leftJoin('products', 'products.id', 'product_id')
					.leftJoin('locations as business_units', 'business_units.id', 'purchase_order_details.business_unit_id')
					.leftJoin('locations as warehouses', 'warehouses.id', 'purchase_order_details.warehouse_id')
					.leftJoin('purchase_orders', 'purchase_orders.id', 'purchase_order_id')
					.where({purchase_order_id : po.id});
		  
			po.details = poDetails.get();

		res(po);
	});
});

/* PO List */
GET('purchase-orders'    		, () => {
    var result = PO.instance();

    result 	.select('purchase_orders.id', 'number', 'reference', 'status', 'currency', 'term_of_payment', 
					'processed_date', 'approved_date', 'cancelled_date', 'purchase_orders.created_at', 'purchase_orders.updated_at', 
					'processors.username as processed_by', 'approvers.username as approved_by', 'cancellers.username as cancelled_by', 
					'creators.username as created_by', 'updaters.username as updated_by', 'location_id', 'purchase_contract_id', 'supplier_id')
        	.leftJoin('users as processors' , 'processors.id'   , 'purchase_orders.processed_by')
			.leftJoin('users as approvers'  , 'approvers.id'    , 'purchase_orders.approved_by')
			.leftJoin('users as cancellers' , 'cancellers.id'   , 'purchase_orders.cancelled_by')
			.leftJoin('users as creators'   , 'creators.id'     , 'purchase_orders.created_by')
			.leftJoin('users as updaters'   , 'updaters.id'     , 'purchase_orders.updated_by')
    
	var limit   = req('limit'),
		offset  = req('offset'),
		keyword = req('keyword');

    if(!empty(limit))  	result.limit(limit);
    if(!empty(offset))  result.offset(offset);
    if(!empty(keyword)) result.whereLike('number', keyword).orWhereLike('remarks', keyword);

    var purchase_orders = [];
    foreach(result.get(), (indexPO, eachPO) => {
        // var details = POD.instance();

        var details = POD.instance();
            details .select('purchase_order_details.id', 'quantity', 'quantity_outstanding', 'purchase_order_details.created_at', 
            				'purchase_order_details.updated_at', 'product_code', 'warehouses.location_code', 'business_units.location_code', 'purchase_orders.number')
					.leftJoin('products', 'products.id', 'product_id')
					.leftJoin('locations as business_units', 'business_units.id', 'purchase_order_details.business_unit_id')
					.leftJoin('locations as warehouses', 'warehouses.id', 'purchase_order_details.warehouse_id')
					.leftJoin('purchase_orders', 'purchase_orders.id', 'purchase_order_id')
					.where({purchase_order_id : eachPO.id});

            eachPO.details = details.get();
            purchase_orders.push(eachPO);
    });

    res(purchase_orders);
});

/* PO Insert */
POST('purchase-order/insert' 	, function(){
	var data = req( 'number', 'reference', 'status', 'currency', 'term_of_payment', 
					'location_id', 'purchase_contract_id', 'supplier_id', 'created_by'),
		rule = {
			number                  : ['required' , 'unique:purchase_orders'],
			reference               : ['required'],
			status                  : ['required'],
			currency                : ['required'],
			term_of_payment         : ['required'],
			created_by              : ['required' , 'exists:users,id'],
			location_id             : ['required' , 'exists:locations,id'],
			purchase_contract_id    : ['required' , 'exists:purchase_contracts,id'],
			supplier_id             : ['required' , 'exists:suppliers,id'],
		};

    validate(data, rule, () => {
		data.created_at = now();
		data.updated_at = now();

        var purchaseOrder =  PO.insert(data);

        if(!purchaseOrder){
            res('Internal server error occured', 500);
        } else {
            for(var i = 0 ; i < count(req('details')); i++){
                var poDetails                     		= POD.instance();
					poDetails.quantity 					= req('details')[i]['quantity'];
					poDetails.quantity_outstanding 		= req('details')[i]['quantity_outstanding'];
					poDetails.created_at 				= now();
					poDetails.product_id 				= req('details')[i]['product_id'];
					poDetails.business_unit_id 			= req('details')[i]['business_unit_id'];
					poDetails.warehouse_id 				= req('details')[i]['warehouse_id'];
					poDetails.purchase_order_id 	= req('details')[i]['purchase_order_id'];
					poDetails.purchase_order_id 		= purchaseOrder.id;

				poDetails.insert();

                // validate(details, {
                //     quantity                     : 'required',
                //     quantity_outstanding         : 'required',
                //     product_id                   : 'required' , 'exists:products,id',
                //     business_unit_id             : 'required' , 'exists:locations,id',
                //     warehouse_id                 : 'required' , 'exists:locations,id',
                //     purchase_order_id      : 'required' , 'exists:purchase_orders,id',
                // }).success( () => {
                // });
            }
            res(purchaseOrder);
        }
    });
});

/* PO Update */
PUT('purchase-order/update' 	, function(){
	var data = req('id', 'number', 'reference', 'status', 'currency', 'term_of_payment', 'updated_by', 'location_id', 'purchase_contract_id', 'supplier_id'),
		rule = {
			number                  : ['required' , 'unique:purchase_orders,number,' + data.id],
			reference               : ['required'],
			status                  : ['required'],
			currency                : ['required'],
			term_of_payment         : ['required'],
			updated_by              : ['required' , 'exists:users,id'],
			location_id             : ['required' , 'exists:locations,id'],
			purchase_contract_id    : ['required' , 'exists:purchase_contracts,id'],
			supplier_id             : ['required' , 'exists:suppliers,id'],
		};

    validate(data, rule, () => {
		var condition = {id : data.id};
		
		delete data.id;
		data.updated_at = now();
		
		var purchaseOrder = PO.update(data, condition);
		
        if(!purchaseOrder){
            res('Internal server error occured', 500);
        } else {
            for(var i = 0 ; i < count(req('details')); i++){
				var poDetails                     		= POD.find(req('details')[i]['id']);

					poDetails.quantity                 	= req('details')[i]['quantity'];
					poDetails.quantity_outstanding 		= req('details')[i]['quantity_outstanding'];
					poDetails.updated_at               	= now();
					poDetails.product_id               	= req('details')[i]['product_id'];
					poDetails.business_unit_id         	= req('details')[i]['business_unit_id'];
					poDetails.warehouse_id             	= req('details')[i]['warehouse_id'];
					poDetails.purchase_order_id 	= req('details')[i]['purchase_order_id'];
					poDetails.purchase_order_id        	= purchaseOrder.id

				poDetails.update();
                // validate(details, {
                //     quantity                     : 'required',
                //     quantity_outstanding         : 'required',
                //     product_id                   : 'required' , 'exists:products,id',
                //     business_unit_id             : 'required' , 'exists:locations,id',
                //     warehouse_id                 : 'required' , 'exists:locations,id',
                //     purchase_order_id      : 'required' , 'exists:purchase_orders,id',
                // }).success( () => {
                // });

                res(purchaseOrder);
            }
            
        }
    });    
});

/* PO Delete */
DELETE('purchase-order/:id'  , () => {
	var data = param(),
		rule = {
			id : ['required' , 'exists:purchase_orders']
		};

    validate(data, rule, () => {
		var detailsDeleted  = POD.where('purchase_order_id' , data.id).delete(),
			mainDeleted     = PO.where('id' , data.id).delete();

        if(detailsDeleted && mainDeleted){
            res(`Purchase Order with ID '${data.id}' successfully deleted`);
        } else {
            res('Internal server error occured', 500);
        }
    });
});

/* Set Approval, Cancel and Process */
PUT('purchase-order/:action/:id', () => {
	var data = Object.assign(param(), req().all()),
		rule = {
			id 		: ['required', 'exists:purchase_orders'],
			action 	: ['required', 'in:approve,cancel,process'],
			user 	: ['required', 'exists:users,id']
		};
	
	validate(data, rule, () => {
		var purchaseOrder 	= PO.find(data.id),
			action 			= '';
		
		purchaseOrder.approved_date 	= null;
		purchaseOrder.approved_by 		= null;
		purchaseOrder.cancelled_date 	= null;
		purchaseOrder.cancelled_by 		= null;
		purchaseOrder.processed_date 	= null;
		purchaseOrder.processed_by 		= null;

		if(data.action === 'approve'){
			action 							= 'approved';
			purchaseOrder.approved_date 	= now(true);
			purchaseOrder.approved_by 		= data.user;
		} else if(data.action === 'cancel'){
			action 							= 'cancelled';
			purchaseOrder.cancelled_date 	= now(true);
			purchaseOrder.cancelled_by 		= data.user;
		} else if(data.action === 'process'){
			action 							= 'processed';
			purchaseOrder.processed_date 	= now(true);
			purchaseOrder.processed_by 		= data.user;
		}

		if(purchaseOrder.update()){
			res(`Purchase Order with ID '${data.id}' successfully '${action}'`);
		} else {
			res('Internal server error occured', 500);
		}
	});
});
