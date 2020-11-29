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
  
		result 	.select('purchase_orders.id', 'purchase_orders.number', 'purchase_orders.reference', 'purchase_orders.status', 'currency', 'term_of_payment', 'sap_reference' ,
						'processed_date', 'approved_date', 'cancelled_date', 'purchase_orders.created_at', 'purchase_orders.updated_at', 
						'processors.username as processed_by', 'approvers.username as approved_by', 'cancellers.username as cancelled_by', 
						'creators.username as created_by', 'updaters.username as updated_by', 'location_id', 'locations.location_code', 'purchase_contract_id', 'purchase_contracts.number as purchase_contract_number', 'purchase_orders.supplier_id', 'suppliers.supplier_description')
				.leftJoin('users as processors' , 'processors.id'   , 'purchase_orders.processed_by')
				.leftJoin('users as approvers'  , 'approvers.id'    , 'purchase_orders.approved_by')
				.leftJoin('users as cancellers' , 'cancellers.id'   , 'purchase_orders.cancelled_by')
				.leftJoin('users as creators'   , 'creators.id'     , 'purchase_orders.created_by')
				.leftJoin('users as updaters'   , 'updaters.id'     , 'purchase_orders.updated_by')
				.leftJoin('locations', 'locations.id', 'location_id')
				.leftJoin('suppliers', 'suppliers.id', 'supplier_id')
				.leftJoin('purchase_contracts', 'purchase_contracts.id', 'purchase_contract_id')
				.where('purchase_orders.id' , data.id);
		  
		var 	po 			= result.first(),
				poDetails 	= POD.instance();
				  
		poDetails 	.select('purchase_order_details.id', 'purchase_order_details.quantity', 'purchase_order_details.quantity_outstanding', 'purchase_order_details.created_at', 
							'purchase_order_details.updated_at', 'brand', 'products.id as product_id', 'products.product_code as product_code', 'products.description as product_description', 'warehouses.id as warehouse_id', 'warehouses.location_code as warehouse', 'business_units.id as business_id', 'business_units.location_code as business_unit', 'purchase_requisition_id', 'purchase_requisitions.number')
					.leftJoin('products', 'products.id', 'product_id')
					.leftJoin('locations as business_units', 'business_units.id', 'purchase_order_details.business_unit_id')
					.leftJoin('locations as warehouses', 'warehouses.id', 'purchase_order_details.warehouse_id')
					.leftJoin('purchase_requisitions', 'purchase_requisitions.id', 'purchase_requisition_id')
					.leftJoin('purchase_orders', 'purchase_orders.id', 'purchase_order_id')
					.where({purchase_order_id : po.id});
		  
			po.details = poDetails.get();

		res(po);
	});
});

/* PO List */
GET('purchase-order'    		, () => {
    var result = PO.instance();

    result 	.select('purchase_orders.id', 'purchase_orders.number', 'purchase_orders.reference', 'purchase_orders.status', 'currency', 'term_of_payment', 'sap_reference', 
					'processed_date', 'approved_date', 'cancelled_date', 'purchase_orders.created_at', 'purchase_orders.updated_at', 
					'processors.username as processed_by', 'approvers.username as approved_by', 'cancellers.username as cancelled_by', 
					'creators.username as created_by', 'updaters.username as updated_by', 'location_id', 'locations.location_code', 'purchase_contract_id', 'purchase_contracts.number as purchase_contract_number', 'purchase_orders.supplier_id', 'suppliers.supplier_description')
        	.leftJoin('users as processors' , 'processors.id'   , 'purchase_orders.processed_by')
			.leftJoin('users as approvers'  , 'approvers.id'    , 'purchase_orders.approved_by')
			.leftJoin('users as cancellers' , 'cancellers.id'   , 'purchase_orders.cancelled_by')
			.leftJoin('users as creators'   , 'creators.id'     , 'purchase_orders.created_by')
			.leftJoin('users as updaters'   , 'updaters.id'     , 'purchase_orders.updated_by')
			.leftJoin('locations', 'locations.id', 'location_id')
			.leftJoin('suppliers', 'suppliers.id', 'supplier_id')
			.leftJoin('purchase_contracts', 'purchase_contracts.id', 'purchase_contract_id')
    
	var limit   = req('limit'),
		offset  = req('offset'),
		keyword = req('keyword');

    if(!empty(limit))  	result.limit(limit);
    if(!empty(offset))  result.offset(offset);
    if(!empty(keyword)) result.whereLike('purchase_orders.number', keyword).orWhereLike('purchase_orders.reference', keyword);

    var purchase_orders = [];
    foreach(result.get(), (indexPO, eachPO) => {
        // var details = POD.instance();

        var details = POD.instance();
            details .select('purchase_order_details.id', 'purchase_order_details.quantity', 'purchase_order_details.quantity_outstanding', 'purchase_order_details.created_at', 
            				'purchase_order_details.updated_at', 'brand', 'products.id as product_id', 'products.product_code as product_code', 'products.description as product_description', 'warehouses.id as warehouse_id', 'warehouses.location_code as warehouse', 'business_units.id as business_id', 'business_units.location_code as business_unit', 'purchase_requisitions.id as purchase_requisitions_id', 'purchase_requisitions.number')
					.leftJoin('products', 'products.id', 'product_id')
					.leftJoin('locations as business_units', 'business_units.id', 'purchase_order_details.business_unit_id')
					.leftJoin('locations as warehouses', 'warehouses.id', 'purchase_order_details.warehouse_id')
					.leftJoin('purchase_requisitions', 'purchase_requisitions.id', 'purchase_requisition_id')
					.leftJoin('purchase_orders', 'purchase_orders.id', 'purchase_order_id')
					.where({purchase_order_id : eachPO.id});

            eachPO.details = details.get() || {};
            purchase_orders.push(eachPO);
    });

    res(purchase_orders);
});

/* PO List Datatable */
GET('purchase-order-datatable', () => {
    var instance 		= PO.instance(),
        columnToSelect 	= [ 'purchase_orders.id', 'purchase_orders.number', 'purchase_orders.reference', 'purchase_orders.status', 'currency', 'term_of_payment', 'sap_reference',
							'processed_date', 'approved_date', 'cancelled_date', 'purchase_orders.created_at', 'purchase_orders.updated_at', 
							'processors.username as processed_by', 'approvers.username as approved_by', 'cancellers.username as cancelled_by', 
							'creators.username as created_by', 'updaters.username as updated_by', 'location_id', 'locations.location_code', 'purchase_contract_id', 'purchase_contracts.number as purchase_contract_number', 'purchase_orders.supplier_id', 'suppliers.supplier_description'],
        columnToSearch 	= ['purchase_orders.number', 'purchase_orders.reference'];

    instance.leftJoin('users as processors' , 'processors.id'   , 'purchase_orders.processed_by')
			.leftJoin('users as approvers'  , 'approvers.id'    , 'purchase_orders.approved_by')
			.leftJoin('users as cancellers' , 'cancellers.id'   , 'purchase_orders.cancelled_by')
			.leftJoin('users as creators'   , 'creators.id'     , 'purchase_orders.created_by')
			.leftJoin('users as updaters'   , 'updaters.id'     , 'purchase_orders.updated_by')
			.leftJoin('locations', 'locations.id', 'location_id')
			.leftJoin('suppliers', 'suppliers.id', 'supplier_id')
			.leftJoin('purchase_contracts', 'purchase_contracts.id', 'purchase_contract_id');

    res(instance.datatable(columnToSelect, columnToSearch));
});

/* PO Insert */
POST('purchase-order/insert' 	, function(){
	var data = req( 'reference', 'status', 'currency', 'term_of_payment', 'sap_reference',
					'location_id', 'purchase_contract_id', 'supplier_id', 'created_by'),
		rule = {
			// number                  : ['required' , 'unique:purchase_orders'],
			reference               : ['required'],
			status      			: ['required', 'in:cancel,draft,submitted,approved,rejected'],
			currency                : ['required'],
			term_of_payment         : ['required'],
			created_by              : ['required' , 'exists:users,id'],
			location_id             : ['required' , 'exists:locations,id'],
			purchase_contract_id    : ['required' , 'exists:purchase_contracts,id'],
			supplier_id             : ['required' , 'exists:suppliers,id'],
		};

    validate(data, rule, () => {
		data.id 		= PO.max('id') + 1;
		data.number     = `PO-${moment().format('YYYYMMDD-HHmmss')}-${data.created_by}`;
		data.created_at = now();
		data.updated_at = now();

        var purchaseOrder =  PO.insert(data);

        if(!purchaseOrder){
            res('Internal server error occured', 500);
        } else {
            for(var i = 0 ; i < count(req('details')); i++){
				var poDetails                     		= POD.instance();
					poDetails.id 						= POD.max('id') + 1;
					poDetails.quantity 					= req('details')[i]['quantity'];
					poDetails.quantity_outstanding 		= req('details')[i]['quantity_outstanding'];
					poDetails.created_at 				= now();
					poDetails.product_id 				= req('details')[i]['product_id'];
					poDetails.business_unit_id 			= req('details')[i]['business_unit_id'];
					poDetails.warehouse_id 				= req('details')[i]['warehouse_id'];
					poDetails.purchase_requisition_id	= req('details')[i]['purchase_requisition_id'];
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
	var data = req('id', 'number', 'reference', 'status', 'currency', 'term_of_payment', 'sap_reference', 'updated_by', 'location_id', 'purchase_contract_id', 'supplier_id'),
		rule = {
			number                  : ['required' , 'unique:purchase_orders,number,' + data.id],
			reference               : ['required'],
			status      			: ['required', 'in:cancel,draft,submitted,approved,rejected'],
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
					poDetails.purchase_requisition_id 	= req('details')[i]['purchase_requisition_id'];
					// poDetails.purchase_order_id        	= purchaseOrder.id;

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

            }
			res(purchaseOrder);
            
        }
    });    
});

/* PO Delete */
DELETE('purchase-order/delete/:id'  , () => {
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
PUT('purchase-order/set-status/:action/:id', () => {
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

/*
 *
 * Details
 *
 */

/* PO Details Datatable */
GET('purchase-order-details-datatable/:id', () => {
    var data = param(),
        rule = {
            id : ['required', 'exists:purchase_orders']
        };
    
    validate(data, rule, () => {
        var columnToSelect  = ['purchase_order_details.id', 'quantity', 'quantity_outstanding', 'purchase_order_details.created_at', 'purchase_order_details.updated_at', 'products.description as product_description', 'warehouses.location_code as warehouse', 'business_units.location_code as business_unit', 'purchase_orders.number']
            columnToSearch  = ['products.description as product_description', 'warehouses.location_code as warehouse', 'business_units.location_code as business_unit'],
            keyword         = req('search').value,
            length          = req('length'),
            start           = req('start'),
            orderBy         = i(req('order')[0].column),
            orderType       = req('order')[0].dir;
            // keyword         = '',
            // length          = 10,
            // start           = 0,
            // orderBy         = '-',
            // orderType       = '-';

        var whereQuery  = '',
            orderQuery  = '',
            limitQuery  = `LIMIT ${length} OFFSET ${start}`;

        foreach(columnToSearch, (index, each) => {
            whereQuery += (i(index) === 0 ? '' : ' OR ') + `${each} LIKE '%${keyword}%'`;
        });

        if(orderBy !== '-' && orderType !== '-'){
            orderQuery = `ORDER BY ${columnToSelect[orderBy]} ${orderType}`;
        }

        var recordsTotal    = POD.instance().count(),
		
            recordsFiltered = query(`SELECT COUNT(*) AS total
                                     FROM dev.purchase_order_details
                                     JOIN dev.products  					ON products.id  		= product_id
                                     JOIN dev.locations AS business_units  	ON business_units.id  	= purchase_order_details.business_unit_id
                                     JOIN dev.locations AS warehouses  		ON warehouses.id  		= purchase_order_details.warehouse_id
                                     JOIN dev.purchase_orders 				ON purchase_orders.id 	= purchase_order_id
                                     WHERE purchase_order_id = '${data.id}'`).first().total,

            rawResult       = query(`SELECT ${columnToSelect.join(', ')}
                                     FROM dev.purchase_order_details
                                     JOIN dev.products  					ON products.id  		= product_id
                                     JOIN dev.locations AS business_units  	ON business_units.id  	= purchase_order_details.business_unit_id
                                     JOIN dev.locations AS warehouses  		ON warehouses.id  		= purchase_order_details.warehouse_id
                                     JOIN dev.purchase_orders 				ON purchase_orders.id 	= purchase_order_id
                                     WHERE purchase_order_id = '${data.id}' AND (${whereQuery})
                                     ${orderQuery}
                                     ${limitQuery}`).get();

        var result = [];
        foreach(rawResult, (index, row) => {
            row.index = (i(length)) * i(start) + (i(index) + 1);
			result.push(row);
        });
        
        res({
            draw 			: req('draw'),
			recordsTotal 	: recordsTotal,
			recordsFiltered : recordsFiltered,
			data 			: result
        });
    });
});

/* PO Details Update */
PUT('purchase-order-details/update/:id', () => {
    var condition 	= param(),
        rule 		= {
            id : ['required', 'exists:purchase_order_details']
        };
    
    validate(condition, rule, () => {
        var data = {
            quantity 				: req('quantity'),
			quantity_outstanding 	: req('quantity_outstanding'),
			updated_at 				: now(),
			product_id 				: req('product_id'),
			business_unit_id 		: req('business_unit_id'),
			warehouse_id 			: req('warehouse_id'),
			purchase_order_id 		: req('purchase_order_id'),
        };

        var details = POD.update(data, condition);
        if(details){
            res(details) 
        } else {
            res('Internal server error occured', 500);
        }
    });
});

/* PO Details Delete */
DELETE('purchase-order-details/delete/:id', () => {
    var data = param(),
        rule = {
            id: ['required', 'exists:purchase_order_details']
        };

    validate(data, rule, () => {
        if (POD.delete({ id: data.id })) {
            res(`Purchase Order Details with ID '${data.id}' successfully deleted`);
        } else {
            res('Internal server error occured', 500);
        }
    });
});


/* 
 * Serial & Mac Uploads
 */
GET('purchase-order/list-csv/:purchase_order_number', () => {
	var data = param(),
		rule = {
			"purchase_order_number" : ['required', 'exists:purchase_orders,number']
		};
	
	validate(data, rule, () => {
		res(PurchaseOrderSerial.where(data).get());
	});
});

POST('purchase-order/import-csv', () => {
	var data = req(`purchase_order_number`, 'csv'),
		rule = {
			purchase_order_number 	: [`required`, `exists:purchase_orders,number`],
			csv 					: [`required`, `is:file`]
		};

	validate(data, rule, () => {
		var total 		= 0,
			imported 	= 0;

		foreach(split(data.csv.getContent(), '\n'), (index, each) => {
			var serial = {
				purchase_order_number 	: data.purchase_order_number,
				serial_number 			: split(each, ';')[0],
				mac_address 			: split(each, ';')[1].replace('\r', ''),
				created_at 				: now(true)
			}
			
			total++;
			if(PurchaseOrderSerial.insert(serial)) imported++;
		});

		res(`Total item : ${total}, successfully imported : ${imported}`);
	});
});
