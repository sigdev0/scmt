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
GET('good-receive', () => {
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
GET('good-receive-datatable', () => {
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
	var data = req('remarks', 'status', 'created_by', 'business_unit_id', 'supplier_id', 'warehouse_id'),
		rule = {
			// number 				: ['required', 'unique:good_receives'],
			remarks 			: ['required'],
			status 				: ['required', 'in:cancel,draft,submitted,approved,rejected'],
			created_by 			: ['required', 'exists:users,id'],
			business_unit_id 	: ['required', 'exists:locations,id'],
			warehouse_id 		: ['required', 'exists:locations,id'],
			supplier_id 		: ['required', 'exists:suppliers,id'],
		};
	
	validate(data, rule, () => {
		data.id 		= GR.max('id') + 1;
		data.number     = `GR-${moment().format('YYYYMMDD-HHmmss')}-${data.created_by}`;
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
			status 				: ['required', 'in:cancel,draft,submitted,approved,rejected'],
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

/*
 *
 * Details
 *
 */

/* GR Details Datatable */
GET('good-receive-details-datatable/:id', () => {
    var data = param(),
        rule = {
            id : ['required', 'exists:good_receives']
        };
    
    validate(data, rule, () => {
        var columnToSelect  = ['good_receive_details.id', 'good_receive_details.serial_number', 'remarks',  'good_receive_details.created_at', 'good_receive_details.updated_at', 'items.item_code as item_code', 'items.serial_number as item_serial_number', 'products.product_code as product_code', 'products.brand as product_brand', 'products.description as product_description']
            columnToSearch  = ['good_receive_details.serial_number', 'remarks', 'items.item_code', 'items.serial_number', 'products.product_code', 'products.brand'],
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

        var recordsTotal    = GRD.instance().count(),
		
            recordsFiltered = query(`SELECT COUNT(*) AS total
                                     FROM dev.good_receive_details
                                     JOIN dev.items 	ON items.id 	= item_id
                                     JOIN dev.products 	ON products.id 	= good_receive_details.product_id
                                     WHERE good_receive_id = '${data.id}'`).first().total,

            rawResult       = query(`SELECT ${columnToSelect.join(', ')}
									 FROM dev.good_receive_details
									 JOIN dev.items 	ON items.id 	= item_id
                                     JOIN dev.products 	ON products.id 	= good_receive_details.product_id
                                     WHERE good_receive_id = '${data.id}' AND (${whereQuery})
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

/* GR Details Update */
PUT('good-receive-details/update/:id', () => {
    var condition 	= param(),
        rule 		= {
            id : ['required', 'exists:good_receive_details']
        };
    
    validate(condition, rule, () => {
        var data = {
            serial_number 		: req('serial_number'),
			remarks 			: req('remarks'),
			updated_at 			: now(true),
			item_id 			: req('item_id'),
			product_id 			: req('product_id'),
			purchase_order_id 	: req('purchase_order_id'),
        };

        var details = GRD.update(data, condition);
        if(details){
            res(details) 
        } else {
            res('Internal server error occured', 500);
        }
    });
});

/* GR Details Delete */
DELETE('good-receive-details/delete/:id', () => {
    var data = param(),
        rule = {
            id: ['required', 'exists:good_receive_details']
        };

    validate(data, rule, () => {
        if (GRD.delete({ id: data.id })) {
            res(`Good Receive Details with ID '${data.id}' successfully deleted`);
        } else {
            res('Internal server error occured', 500);
        }
    });
});
