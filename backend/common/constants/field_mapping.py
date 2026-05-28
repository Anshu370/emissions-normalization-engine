FIELD_MAPPING = {

    # Transaction / Document Info
    "belegnummer": "transaction_id",
    "documentnumber": "transaction_id",
    "belnr": "transaction_id",

    # Company / Business Unit
    "buchungskreis": "company_code",
    "companycode": "company_code",
    "bukrs": "company_code",

    # Facility / Plant
    "werk": "facility_code",
    "plant": "facility_code",
    "facility": "facility_code",

    # Material / Fuel Identifier
    "materialcode": "material_code",
    "materialnummer": "material_code",
    "matnr": "material_code",
    "material": "material_code",

    # Fuel Type
    "kraftstoffart": "fuel_type",
    "fueltype": "fuel_type",
    "fuel": "fuel_type",

    # Quantity
    "menge": "quantity",
    "quantity": "quantity",

    # Unit
    "einheit": "normalized_unit",
    "unit": "normalized_unit",

    # Transaction Date
    "buchungsdatum": "transaction_date",
    "postingdate": "transaction_date",
    "documentdate": "transaction_date",
    "budat": "transaction_date",

    # Vendor / Supplier
    "lieferant": "vendor_name",
    "supplier": "vendor_name",
    "vendor": "vendor_name",

    # Amount / Cost
    "betrag": "amount",
    "amount": "amount",
    "cost": "amount",

    # Currency
    "waehrung": "currency",
    "currency": "currency",
    "waers": "currency",

    # Scope Category
    "scope": "scope_category",
    "emissionscope": "scope_category",

    # Utility Fields
    "meterid": "meter_id",
    "meter": "meter_id",
    "site": "facility_name",
    "consumption": "consumption",
    "usage": "consumption",
    "billingstart": "billing_start",
    "billingend": "billing_end",
    "tariff": "tariff_type",
    "rateplan": "tariff_type",

    # Travel Fields
    "bookingid": "booking_id",
    "employeeid": "employee_id",
    "expensetype": "expense_type",
    "origin": "origin",
    "destination": "destination",
    "travelclass": "travel_class",
    "hotelname": "hotel_name",
    "nights": "nights",
    "transporttype": "transport_type",
    "distance": "distance",
    "distanceunit": "distance_unit",
    "traveldate": "activity_date",

    # Metadata
    "sourcetype": "source_type",
    "rawrow": "raw_row_data",
    "ingestiontimestamp": "ingestion_timestamp",
}