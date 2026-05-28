from common.constants.accepted_units import ACCEPTED_UNITS
class SAPValidator:

    REQUIRED_FIELDS = [
        "kraftstoffart",
        "menge",
        "einheit"
    ]

    @staticmethod
    def validate_headers(headers):

        normalized_headers = [str(header).strip().lower() for header in headers]

        missing_fields = []

        for field in SAPValidator.REQUIRED_FIELDS:

            if field not in normalized_headers:
                missing_fields.append(field)

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

        fuel_type = row_data.get("kraftstoffart")

        quantity = row_data.get("menge")

        unit = row_data.get("einheit")

        if not fuel_type:

            return {

                "suspicious": True,

                "reason": (
                    "Fuel type missing"
                )
            }

        if quantity and float(quantity) <= 0:
            return {

                "suspicious": True,

                "reason": (
                    "Invalid fuel quantity"
                )
            }

        if quantity and float(quantity) > 100000:

            return {

                "suspicious": True,

                "reason": (
                    "Unusually high quantity"
                )
            }

        if not unit:
            return {

                "suspicious": True,

                "reason": (
                    "Unit missing"
                )
            }

        fuel_type = str(fuel_type).strip().title()

        accepted_units = ACCEPTED_UNITS.get(
            fuel_type,
            []
        )

        if unit not in accepted_units:
            return {

                "suspicious": True,

                "reason": (
                    "Invalid unit for fuel type"
                )
            }

        return {

            "suspicious": False,

            "reason": ""
        }