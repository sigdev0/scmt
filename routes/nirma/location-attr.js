/* Details Location Attribute */
GET('location-attribute/:id', () => {
    var data    = param(),
        rules   = {
            id: ['required', 'exists:location_attrs,id']
        };

    validate(data, rules, () => {
        var locationAttribute = LocationAttribute.find(data.id);

        if (locationAttribute) {
            res(locationAttribute);
        } else {
            res('Internal server error', 500)
        }
    })
});

/* List Location Attributes */
GET('location-attributes', () => {
    var result = LocationAttribute.instance();
        result.select(
            "id",
            "location_id",
            "description",
            "value",
            "created_at",
            "updated_at"
        );

    var limit   = req("limit"),
        offset  = req("offset"),
        keyword = req("keyword");
            
    if (!empty(limit))      result.limit(limit);
    if (!empty(offset))     result.offset(offset);
    if (!empty(keyword))    result.whereLike("description", keyword);

    res(result.get());
});

/* Insert Location Attribute */
POST('location-attribute/insert', () => {
    var data    = req("location_id", "description", "value"),
        rules   = {
            location_id     : ['required'],
            description     : ['required'],
            value           : ['required'],
        };

    validate(data, rules, () => {
		data.id 		= LocationAttribute.max('id') + 1;
        data.created_at = now(true);
        data.updated_at = now(true);

        var locationAttribute = LocationAttribute.insert(data);
        if (locationAttribute) {
            res(locationAttribute);
        } else {
            res('Internal server error', 500)
        }
    })
});

/* Update Location Attribute */
PUT('location-attribute/update', () => {
    var data    = req("id", "description", "location_id", "value"),
        rules   = {
            id              : ['required', 'exists:location_attrs,id'],
            location_id     : ['required'],
            description     : ['required'],
            value           : ['required'],
        };

    validate(data, rules, () => {
        var locationAttribute               = LocationAttribute.find(data.id);
            locationAttribute.location_id   = data.location_id;
            locationAttribute.description   = data.description;
            locationAttribute.value         = data.value;
            locationAttribute.updated_at    = now(true);

        var success = locationAttribute.update();
        if (success) {
            res("Location Attribute successfully updated");
        } else {
            res('Internal server error', 500)
        }
    })
});

/* Delete Location Attribute */
DELETE('location-attribute/delete/:id', () => {
    var data    = param(),
        rules   = {
            id: ['required', 'exists:location_attrs,id']
        };

    validate(data, rules, () => {
        var success = LocationAttribute.delete({ 'id': data.id });

        if (success) {
            res("Location Attribute successfully deleted");
        } else {
            res('Cannot delete Location Attribute as it is being used by another records', 500);
        }
    })
});
