const 	GD 	= GoodDelivery,
		GDD = GoodDeliveryDetail;

/* GD Details */
GET('good-delivery/:id', () => {
	var data = param(),
		rule = {
			id    : ['required' , 'exists:good_deliveries'],
		};

	validate(data, rule, () => {
		var goodDelivery = GD.select( 'good_deliveries.id', 'good_deliveries.number', 'good_deliveries.status', 'good_deliveries.remarks', 'good_deliveries.package_count', 
								'good_deliveries.created_at', 'good_deliveries.updated_at', 'good_deliveries.approved_at', 
								'creators.username as created_by', 'updaters.username as updated_by', 'approvers.username as approved_by',
								'business_units.location_code as business_unit', 'warehouses.location_code as warehouse', 'suppliers.supplier_description as supplier', 'purchase_order_id', 'purchase_orders.number as purchase_order_number')

						.leftJoin('users as creators'	, 'creators.id' , 'good_deliveries.created_by')
						.leftJoin('users as updaters'	, 'updaters.id' , 'good_deliveries.updated_by')
						.leftJoin('users as approvers'	, 'approvers.id', 'good_deliveries.approved_by')

						.leftJoin('locations as business_units' , 'business_units.id'	, 'good_deliveries.business_unit_id')
						.leftJoin('locations as warehouses'		, 'warehouses.id' 		, 'good_deliveries.warehouse_id')
						.leftJoin('suppliers'					, 'suppliers.id' 		, 'good_deliveries.supplier_id')
						.leftJoin('purchase_orders' 			, 'purchase_orders.id' 	, 'good_deliveries.purchase_order_id')

						.where('good_deliveries.id' , data.id)
						.first();
		  
		var gdDetails 	= GDD.instance();
				  
			gdDetails 	.select('good_delivery_details.id', 'package_number', 'serial_number', 'package_count', 'remarks', 
								'good_delivery_details.created_at', 'good_delivery_details.updated_at',
								'products.product_code as product_code', 'products.brand as product_brand', 'products.description as product_description')
						.leftJoin('products', 'products.id', 'product_id')
						.where({good_delivery_id : goodDelivery.id});
		  
			goodDelivery.details = gdDetails.get();

		res(goodDelivery);
	});
});

/* GD List */
GET('good-delivery', () => {
	var result = GD.select( 'good_deliveries.id', 'good_deliveries.number', 'good_deliveries.status', 'good_deliveries.remarks', 'good_deliveries.package_count', 
							'good_deliveries.created_at', 'good_deliveries.updated_at', 'good_deliveries.approved_at', 
							'creators.username as created_by', 'updaters.username as updated_by', 'approvers.username as approved_by',
							'business_units.location_code as business_unit', 'warehouses.location_code as warehouse', 'suppliers.supplier_description as supplier', 'purchase_order_id', 'purchase_orders.number as purchase_order_number')

					.leftJoin('users as creators'	, 'creators.id' , 'good_deliveries.created_by')
					.leftJoin('users as updaters'	, 'updaters.id' , 'good_deliveries.updated_by')
					.leftJoin('users as approvers'	, 'approvers.id', 'good_deliveries.approved_by')

					.leftJoin('locations as business_units' , 'business_units.id'	, 'good_deliveries.business_unit_id')
					.leftJoin('locations as warehouses'		, 'warehouses.id' 		, 'good_deliveries.warehouse_id')
					.leftJoin('suppliers'					, 'suppliers.id' 		, 'good_deliveries.supplier_id')
					.leftJoin('purchase_orders' 			, 'purchase_orders.id' 	, 'good_deliveries.purchase_order_id');

	var limit   = req('limit'),
		offset  = req('offset'),
		keyword = req('keyword');

    if(!empty(limit))  	result.limit(limit);
    if(!empty(offset))  result.offset(offset);
	if(!empty(keyword)) result.whereLike('good_deliveries.number', keyword).orWhereLike('good_deliveries.remarks', keyword);
	
	var goodDeliveries = [];
	foreach(result.get(), (indexGD, eachGD) => {
        var details = GDD.instance();
			details .select('good_delivery_details.id', 'package_number', 'serial_number', 'package_count', 'remarks', 
							'good_delivery_details.created_at', 'good_delivery_details.updated_at',
							'products.product_code as product_code', 'products.brand as product_brand', 'products.description as product_description')
					.leftJoin('products', 'products.id', 'product_id')
					.where({good_delivery_id : eachGD.id});

            eachGD.details = details.get() || {};
            goodDeliveries.push(eachGD);
    });

    res(goodDeliveries);
});

/* GD List Datatable */
GET('good-delivery-datatable', () => {
    var instance 		= GD.instance(),
        columnToSelect 	= [ 'good_deliveries.id', 'good_deliveries.number', 'good_deliveries.status', 'good_deliveries.remarks', 'good_deliveries.package_count', 
							'good_deliveries.created_at', 'good_deliveries.updated_at', 'good_deliveries.approved_at', 
							'creators.username as created_by', 'updaters.username as updated_by', 'approvers.username as approved_by',
							'business_units.location_code as business_unit', 'warehouses.location_code as warehouse', 'suppliers.supplier_description as supplier', 'purchase_order_id', 'purchase_orders.number as purchase_order_number'],
        columnToSearch 	= ['good_deliveries.number', 'good_deliveries.remarks'];

    instance.leftJoin('users as creators'	, 'creators.id' , 'good_deliveries.created_by')
			.leftJoin('users as updaters'	, 'updaters.id' , 'good_deliveries.updated_by')
			.leftJoin('users as approvers'	, 'approvers.id', 'good_deliveries.approved_by')

			.leftJoin('locations as business_units' , 'business_units.id'	, 'good_deliveries.business_unit_id')
			.leftJoin('locations as warehouses'		, 'warehouses.id' 		, 'good_deliveries.warehouse_id')
			.leftJoin('suppliers'					, 'suppliers.id' 		, 'good_deliveries.supplier_id')
			.leftJoin('purchase_orders' 			, 'purchase_orders.id' 	, 'good_deliveries.purchase_order_id');

    res(instance.datatable(columnToSelect, columnToSearch));
});

/* GD Insert */
POST('good-delivery/insert', () => {
	var data = req('number', 'remarks', 'status', 'package_count', 'created_by', 'business_unit_id', 'supplier_id', 'warehouse_id', 'purchase_order_id'),
		rule = {
			number 				: ['required', 'unique:good_deliveries'],
			remarks 			: ['required'],
			status 				: ['required'],
			package_count 		: ['required', 'numeric'],
			created_by 			: ['required', 'exists:users,id'],
			business_unit_id 	: ['required', 'exists:locations,id'],
			warehouse_id 		: ['required', 'exists:locations,id'],
			supplier_id 		: ['required', 'exists:suppliers,id'],
			purchase_order_id 	: ['required', 'exists:purchase_orders,id']
		};
	
	validate(data, rule, () => {
		data.id 		= GD.max('id') + 1;
		data.created_at = now(true);
		data.updated_at = now(true);

		var goodDelivery = GD.insert(data);
		if(goodDelivery){

			for(var i = 0; i < count(req('details')); i++){
				var detailsData = {
					id 				: GDD.max('id') + 1,
					package_number 	: req('details')[i]['package_number'],
					serial_number 	: req('details')[i]['serial_number'],
					remarks 		: req('details')[i]['remarks'],
					package_count 	: req('details')[i]['package_count'],

					created_at 		: now(true),
					updated_at 		: now(true),

					product_id 		: req('details')[i]['product_id'],
					good_delivery_id: goodDelivery.id,
				};

				GDD.insert(detailsData);
			}

			res(goodDelivery);
		} else {
			res('Internal server error', 500);
		}
	});
});

/* GD Update */
PUT('good-delivery/update', () => {
	var data = req('id', 'number', 'remarks', 'status', 'package_count', 'updated_by', 'business_unit_id', 'supplier_id', 'warehouse_id', 'purchase_order_id'),
		rule = {
			number 				: ['required', 'unique:good_deliveries,number,' + data.id],
			remarks 			: ['required'],
			status 				: ['required'],
			package_count 		: ['required', 'numeric'],
			updated_by 			: ['required', 'exists:users,id'],
			business_unit_id 	: ['required', 'exists:locations,id'],
			warehouse_id 		: ['required', 'exists:locations,id'],
			supplier_id 		: ['required', 'exists:suppliers,id'],
			purchase_order_id 	: ['required', 'exists:purchase_orders,id']
		};
	
	validate(data, rule, () => {
		var condition = {id : data.id};
		
		delete data.id;
		data.updated_at = now();
		
		var goodDelivery = GD.update(data, condition);
		if(goodDelivery){

			for(var i = 0; i < count(req('details')); i++){
				var detailsData = {
					package_number 	: req('details')[i]['package_number'],
					serial_number 	: req('details')[i]['serial_number'],
					remarks 		: req('details')[i]['remarks'],
					package_count 	: req('details')[i]['package_count'],

					// created_at 		: now(true),
					updated_at 		: now(true),

					product_id 		: req('details')[i]['product_id'],
					good_delivery_id: goodDelivery.id,
				};

				GDD.update(detailsData, {id : req('details')[i]['id']});
			}

			res(goodDelivery);
		} else {
			res('Internal server error', 500);
		}
	});
});

/* GD Delete */
DELETE('good-delivery/delete/:id'  , () => {
	var data = param(),
		rule = {
			id : ['required' , 'exists:good_deliveries']
		};

    validate(data, rule, () => {
		var detailsDeleted  = GDD.where('good_delivery_id' , data.id).delete(),
			mainDeleted     = GD.where('id' , data.id).delete();

        if(detailsDeleted && mainDeleted){
            res(`Good Delivery with ID '${data.id}' successfully deleted`);
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

/* GD Details Datatable */
GET('good-delivery-details-datatable/:id', () => {
    var data = param(),
        rule = {
            id : ['required', 'exists:good_deliveries']
        };
    
    validate(data, rule, () => {
        var columnToSelect  = ['good_delivery_details.id', 'package_number', 'serial_number', 'package_count', 'remarks', 'good_delivery_details.created_at', 'good_delivery_details.updated_at', 'products.product_code as product_code', 'products.brand as product_brand', 'products.description as product_description']
            columnToSearch  = ['package_number', 'serial_number', 'products.product_code', 'products.brand'],
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

        var recordsTotal    = GDD.instance().count(),
		
            recordsFiltered = query(`SELECT COUNT(*) AS total
                                     FROM dev.good_delivery_details
                                     JOIN dev.products ON products.id = product_id
                                     WHERE good_delivery_id = '${data.id}'`).first().total,

            rawResult       = query(`SELECT ${columnToSelect.join(', ')}
                                     FROM dev.good_delivery_details
                                     JOIN dev.products ON products.id = product_id
                                     WHERE good_delivery_id = '${data.id}' AND (${whereQuery})
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

/* GD Details Update */
PUT('good-delivery-details/update/:id', () => {
    var param = param(),
        rule = {
            id : ['required', 'exists:good_delivery_details']
        };
    
    validate(param, rule, () => {
        var data = {
            package_number 	: req('package_number'),
			serial_number 	: req('serial_number'),
			remarks 		: req('remarks'),
			package_count 	: req('package_count'),
			updated_at 		: now(true),
			product_id 		: req('product_id'),
        };

        var details = GDD.update(data, {id : param.id});
        if(details){
            res(details) 
        } else {
            res('Internal server error occured', 500);
        }
    });
});

/* GD Details Delete */
DELETE('good-delivery-details/delete/:id', () => {
    var data = param(),
        rule = {
            id: ['required', 'exists:good_delivery_details']
        };

    validate(data, rule, () => {
        if (GDD.delete({ id: data.id })) {
            res(`Good Delivery Details with ID '${data.id}' successfully deleted`);
        } else {
            res('Internal server error occured', 500);
        }
    });
});
