class UtilityValidator:

    REQUIRED_FIELDS = [

        "MeterID",

        "Consumption",

        "Unit"
    ]

    @staticmethod
    def validate_headers(headers):

        missing_fields = []

        for field in (
            UtilityValidator.REQUIRED_FIELDS
        ):

            if field not in headers:

                missing_fields.append(
                    field
                )

        return {

            "is_valid": (
                len(missing_fields) == 0
            ),

            "missing_fields": (
                missing_fields
            )
        }

    @staticmethod
    def detect_suspicious(row_data):

        consumption = row_data.get(
            "Consumption"
        )

        unit = row_data.get(
            "Unit"
        )

        meter_id = row_data.get(
            "MeterID"
        )

        if not meter_id:

            return {

                "suspicious": True,

                "reason": (
                    "Meter ID missing"
                )
            }

        if not unit:

            return {

                "suspicious": True,

                "reason": (
                    "Unit missing"
                )
            }

        if consumption:

            if float(consumption) <= 0:

                return {

                    "suspicious": True,

                    "reason": (
                        "Invalid electricity consumption"
                    )
                }

            if float(consumption) > 50000:

                return {

                    "suspicious": True,

                    "reason": (
                        "Abnormally high electricity usage"
                    )
                }

        return {

            "suspicious": False,

            "reason": ""
        }