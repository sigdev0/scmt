/* Details Location */
GET('location/:id', () => {
    var data    = param(),
        rules   = {
            id: ['required', 'exists:locations,id']
        };

    validate(data, rules, () => {
        var location = Location.find(data.id);

        if (location) {
            res(location);
        } else {
            res('Internal server error', 500)
        }
    })
});

/* List Locations */
GET('locations', () => {
    var result = Location.instance();
        result.select(
            "id",
            "location_code",
            "safety_stock",
            "capacity",
            "description",
            "parent_location_id",
            "type_location_id",
            "location_status",
            "created_at",
            "updated_at"
        );

    var limit   = req("limit"),
        offset  = req("offset"),
        keyword = req("keyword");
            
    if (!empty(limit))      result.limit(limit);
    if (!empty(offset))     result.offset(offset);
    if (!empty(keyword))    result.whereLike("location_code", keyword);

    res(result.get());
});

/* Insert Location */
POST('location/insert', () => {
    var data    = req("location_code", "safety_stock", "capacity", "description", "parent_location_id", "type_location_id", "location_status",),
        rules   = {
            location_code           : ['required'],
            safety_stock            : ['required'],
            capacity                : ['required'],
            description             : ['required'],
            parent_location_id      : ['required'],
            type_location_id        : ['required'],
            location_status         : ['required'],
        };

    validate(data, rules, () => {
		data.id 		= Location.max('id') + 1;
        data.created_at = now(true);
        data.updated_at = now(true);

        var location = Location.insert(data);
        if (location) {
            res(location);
        } else {
            res('Internal server error', 500)
        }
    })
});

/* Update Location */
PUT('location/update', () => {
    var data    = req("id", "location_code", "safety_stock", "capacity", "description", "parent_location_id", "type_location_id", "location_status"),
        rules   = {
            id                      : ['required', 'exists:locations,id'],
            location_code           : ['required'],
            safety_stock            : ['required'],
            capacity                : ['required'],
            description             : ['required'],
            parent_location_id      : ['required'],
            type_location_id        : ['required'],
            location_status         : ['required'],
        };

    validate(data, rules, () => {
        var location               = Location.find(data.id);
            location.location_code          = data.location_id;
            location.safety_stock           = data.location_id;
            location.capacity               = data.location_id;
            location.description            = data.description;
            location.parent_location_id     = data.value;
            location.type_location_id       = data.location_id;
            location.location_status        = data.location_id;
            location.updated_at             = now(true);

        var success = location.update();
        if (success) {
            res("Location successfully updated");
        } else {
            res('Internal server error', 500)
        }
    })
});

/* Delete Location */
DELETE('location/delete/:id', () => {
    var data    = param(),
        rules   = {
            id: ['required', 'exists:locations,id']
        };

    validate(data, rules, () => {
        var success = Location.delete({ 'id': data.id });

        if (success) {
            res("Location successfully deleted");
        } else {
            res('Cannot delete Location as it is being used by another records', 500);
        }
    })
});
