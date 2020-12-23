POST('purchase-order/import-items', () => {

	console.log(req().all());

	var data = req(`purchase_order_number`, `warehouse_id`, `product_id`, `csv`, `created_by`),
		rule = {
			purchase_order_number 			: [`required`, `exists:purchase_orders,number`],
			warehouse_id 					: [`required`, `exists:locations,id`],
			product_id 						: [`required`, `exists:products,id`],
			created_by 						: [`required`, `exists:users,id`],
			csv 							: [`required`, `is:file`]
		};

	validate(data, rule, () => {
		var total 				= 0,
			imported 			= 0,
			success 			= [],
			failed 				= [],
			failed_remarks 		= [],
			purchase_order_id 	= PurchaseOrder.where({number : data.purchase_order_number}).first().props('id');


		foreach(split(data.csv.getContent(), '\n'), (index, each) => {
			var serial 			= {
					id 						: Item.max('id') + 1,
					purchase_order_id		: purchase_order_id,
					product_id				: data.product_id,
					is_scanned 				: 0,
					serial_number 			: split(each, ';')[0],
					mac_address 			: split(each, ';')[1].replace('\r', ''),
					created_at 				: now(true),
					created_by 				: data.created_by,
					warehouse_id 			: data.warehouse_id
					// status 					: 'open'
				},
				
				current 		= {
					purchase_order_id 	: serial.purchase_order_id,
					product_id 			: serial.product_id,
					serial_number 		: serial.serial_number,
					mac_address		 	: serial.mac_address
				},
				
				existing_item 	= Item.select('products.brand as product_brand', 'products.type as product_type', 'products.description as product_description', 'warehouse.location_code as warehouse_code', 'warehouse.description as warehouse_description', 'users.username').join('products', 'products.id', 'product_id').join('locations as warehouse', 'warehouse.id', 'warehouse_id').join('users', 'users.id', 'items.created_by').where('serial_number', current.serial_number).first();
			
			total++;
			if(existing_item){
				failed.push(current);
				failed_remarks.push(`Product '${existing_item.product_brand} ${existing_item.product_type} ${existing_item.product_description}' with serial number '${current.serial_number}' already exists at warehouse '${existing_item.warehouse_code} (${existing_item.warehouse_description})'. (Input by '${existing_item.username}')`);
			} else {
				if(Item.insert(serial)) {
					imported++;
					success.push(current);
				} else {
					failed.push(current);
				}
			}
	
		});

		// var strFailedRemarks = '';
		// foreach(failed_remarks, (index, each) => {
		// 	strFailedRemarks += each + "|";
		// });

		PurchaseOrderImportHistory.insert({
			purchase_order_id 	: purchase_order_id,
			created_at 			: now(true),
			created_by 			: data.created_by,
			total_item 			: total,
			total_success 		: success.length,
			total_failed 		: failed.length,
			warehouse_id		: data.warehouse_id,
			failed_remarks		: JSON.stringify(failed_remarks)
		});

		res({
			success	: success,
			failed 	: failed,
			remarks : failed_remarks
		});
	});
});
