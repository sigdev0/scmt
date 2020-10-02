const 	GR 	= GoodReceive,
		GRD = GoodReceiveDetail;

/* GR Details */
GET('good-receive/:id', () => {
	var data = param(),
		rule = {
			id    : ['required' , 'exists:good_receives'],
		};

	validate(data, rule, () => {
		var goodReceive = GR.select('good_receives.id', 'good_receives.number', 'good_receives.status', 'good_receives.remarks', 
								'good_receives.created_at', 'good_receives.updated_at', 'good_receives.approved_at', 
								'creators.username as created_by', 'updaters.username as updated_by', 'approvers.username as approved_by',
								'business_units.location_code as business_unit', 'warehouses.location_code as warehouse', 'suppliers.supplier_description as supplier')

						.leftJoin('users as creators'	, 'creators.id' , 'good_receives.created_by')
						.leftJoin('users as updaters'	, 'updaters.id' , 'good_receives.updated_by')
						.leftJoin('users as approvers'	, 'approvers.id', 'good_receives.approved_by')

						.leftJoin('locations as business_units' , 'business_units.id'	, 'good_receives.business_unit_id')
						.leftJoin('locations as warehouses'		, 'warehouses.id' 		, 'good_receives.warehouse_id')
						.leftJoin('suppliers'					, 'suppliers.id' 		, 'good_receives.supplier_id')

						.where('good_receives.id' , data.id)
						.first();
		  
		var grDetails 	= GRD.instance();
				  
			grDetails 	.select('good_receive_details.id', 'good_receive_details.serial_number', 'remarks', 
								'good_receive_details.created_at', 'good_receive_details.updated_at',
								'items.item_code as item_code', 'items.serial_number as item_serial_number',
								'products.product_code as product_code', 'products.brand as product_brand', 'products.description as product_description')
						.leftJoin('items', 'items.id', 'item_id')
						.leftJoin('products', 'products.id', 'good_receive_details.product_id')
						.where({good_receive_id : goodReceive.id});
		  
			goodReceive.details = grDetails.get();

		res(goodReceive);
	});
});

/* GR List */
GET('good-receives', () => {
	var result = GR.select( 'good_receives.id', 'good_receives.number', 'good_receives.status', 'good_receives.remarks',
							'good_receives.created_at', 'good_receives.updated_at', 'good_receives.approved_at', 
							'creators.username as created_by', 'updaters.username as updated_by', 'approvers.username as approved_by',
							'business_units.location_code as business_unit', 'warehouses.location_code as warehouse', 'suppliers.supplier_description as supplier')

					.leftJoin('users as creators'	, 'creators.id' , 'good_receives.created_by')
					.leftJoin('users as updaters'	, 'updaters.id' , 'good_receives.updated_by')
					.leftJoin('users as approvers'	, 'approvers.id', 'good_receives.approved_by')

					.leftJoin('locations as business_units' , 'business_units.id'	, 'good_receives.business_unit_id')
					.leftJoin('locations as warehouses'		, 'warehouses.id' 		, 'good_receives.warehouse_id')
					.leftJoin('suppliers'					, 'suppliers.id' 		, 'good_receives.supplier_id');

	var limit   = req('limit'),
		offset  = req('offset'),
		keyword = req('keyword');

    if(!empty(limit))  	result.limit(limit);
    if(!empty(offset))  result.offset(offset);
	if(!empty(keyword)) result.whereLike('good_receives.number', keyword).orWhereLike('good_receives.remarks', keyword);
	
	var goodReceives = [];
	foreach(result.get(), (indexGR, eachGR) => {
        var details = GRD.instance();
			details .select('good_receive_details.id', 'good_receive_details.serial_number', 'remarks', 
							'good_receive_details.created_at', 'good_receive_details.updated_at',
							'items.item_code as item_code', 'items.serial_number as item_serial_number',
							'products.product_code as product_code', 'products.brand as product_brand', 'products.description as product_description')
					.leftJoin('items', 'items.id', 'item_id')
					.leftJoin('products', 'products.id', 'good_receive_details.product_id')
					.where({good_receive_id : eachGR.id});

            eachGR.details = details.get() || {};
            goodReceives.push(eachGR);
    });

    res(goodReceives);
});

/* GR List Datatable */
GET('good-receives-datatable', () => {
    var instance 		= GR.instance(),
        columnToSelect 	= [ 'good_receives.id', 'good_receives.number', 'good_receives.status', 'good_receives.remarks',
							'good_receives.created_at', 'good_receives.updated_at', 'good_receives.approved_at', 
							'creators.username as created_by', 'updaters.username as updated_by', 'approvers.username as approved_by',
							'business_units.location_code as business_unit', 'warehouses.location_code as warehouse', 'suppliers.supplier_description as supplier'],
        columnToSearch 	= ['good_receives.number', 'good_receives.remarks'];

    instance.leftJoin('users as creators'	, 'creators.id' , 'good_receives.created_by')
			.leftJoin('users as updaters'	, 'updaters.id' , 'good_receives.updated_by')
			.leftJoin('users as approvers'	, 'approvers.id', 'good_receives.approved_by')

			.leftJoin('locations as business_units' , 'business_units.id'	, 'good_receives.business_unit_id')
			.leftJoin('locations as warehouses'		, 'warehouses.id' 		, 'good_receives.warehouse_id')
			.leftJoin('suppliers'					, 'suppliers.id' 		, 'good_receives.supplier_id');

    res(instance.datatable(columnToSelect, columnToSearch));
});

/* GR Insert */
POST('good-receive/insert', () => {
	var data = req('number', 'remarks', 'status', 'created_by', 'business_unit_id', 'supplier_id', 'warehouse_id'),
		rule = {
			number 				: ['required', 'unique:good_receives'],
			remarks 			: ['required'],
			status 				: ['required'],
			created_by 			: ['required', 'exists:users,id'],
			business_unit_id 	: ['required', 'exists:locations,id'],
			warehouse_id 		: ['required', 'exists:locations,id'],
			supplier_id 		: ['required', 'exists:suppliers,id'],
		};
	
	validate(data, rule, () => {
		data.id 		= GR.max('id') + 1;
		data.created_at = now(true);
		data.updated_at = now(true);

		var goodReceive = GR.insert(data);
		if(goodReceive){

			for(var i = 0; i < count(req('details')); i++){
				var detailsData = {
					id 					: GRD.max('id') + 1,
					serial_number 		: req('details')[i]['serial_number'],
					remarks 			: req('details')[i]['remarks'],

					created_at 			: now(true),
					updated_at 			: now(true),

					item_id 			: req('details')[i]['item_id'],
					product_id 			: req('details')[i]['product_id'],
					purchase_order_id 	: req('details')[i]['purchase_order_id'],
					good_receive_id		: goodReceive.id,
				};

				GRD.insert(detailsData);
			}

			res(goodReceive);
		} else {
			res('Internal server error', 500);
		}
	});
});

/* GR Update */
PUT('good-receive/update', () => {
	var data = req('id', 'number', 'remarks', 'status', 'updated_by', 'business_unit_id', 'supplier_id', 'warehouse_id'),
		rule = {
			number 				: ['required', 'unique:good_receives,number,' + data.id],
			remarks 			: ['required'],
			status 				: ['required'],
			updated_by 			: ['required', 'exists:users,id'],
			business_unit_id 	: ['required', 'exists:locations,id'],
			warehouse_id 		: ['required', 'exists:locations,id'],
			supplier_id 		: ['required', 'exists:suppliers,id'],
		};
	
	validate(data, rule, () => {
		var condition = {id : data.id};
		
		delete data.id;
		data.updated_at = now();
		
		var goodReceive = GR.update(data, condition);
		if(goodReceive){

			for(var i = 0; i < count(req('details')); i++){
				var detailsData = {
					serial_number 		: req('details')[i]['serial_number'],
					remarks 			: req('details')[i]['remarks'],

					// created_at 		: now(true),
					updated_at 			: now(true),

					item_id 			: req('details')[i]['item_id'],
					product_id 			: req('details')[i]['product_id'],
					purchase_order_id 	: req('details')[i]['purchase_order_id'],
					good_receive_id 	: goodReceive.id,
				};

				GRD.update(detailsData, {id : req('details')[i]['id']});
			}

			res(goodReceive);
		} else {
			res('Internal server error', 500);
		}
	});
});

/* GR Delete */
DELETE('good-receive/delete/:id'  , () => {
	var data = param(),
		rule = {
			id : ['required' , 'exists:good_receives']
		};

    validate(data, rule, () => {
		var detailsDeleted  = GRD.where('good_receive_id' , data.id).delete(),
			mainDeleted     = GR.where('id' , data.id).delete();

        if(detailsDeleted && mainDeleted){
            res(`Good Receive with ID '${data.id}' successfully deleted`);
        } else {
            res('Internal server error occured', 500);
        }
    });
});
