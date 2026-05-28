class TravelValidator:

    REQUIRED_FIELDS = [

        "bookingid",

        "expensetype",

        "origin",

        "destination",

        "distance",

        "distanceunit"
    ]

    @staticmethod
    def validate_headers(headers):

        normalized_headers = [

            str(header).strip().lower()

            for header in headers
        ]

        missing_fields = []

        for field in (
            TravelValidator.REQUIRED_FIELDS
        ):

            if field not in (
                normalized_headers
            ):

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

        origin = row_data.get(
            "origin"
        )

        destination = row_data.get(
            "destination"
        )

        distance = row_data.get(
            "distance"
        )

        expense_type = row_data.get(
            "expense_type"
        )

        if not expense_type:

            return {

                "suspicious": True,

                "reason": (
                    "Expense type missing"
                )
            }

        if not origin:

            return {

                "suspicious": True,

                "reason": (
                    "Origin missing"
                )
            }

        if not destination:

            return {

                "suspicious": True,

                "reason": (
                    "Destination missing"
                )
            }

        if distance is not None:

            try:

                distance = float(distance)

                if distance <= 0:

                    return {

                        "suspicious": True,

                        "reason": (
                            "Invalid travel distance"
                        )
                    }

                if distance > 50000:

                    return {

                        "suspicious": True,

                        "reason": (
                            "Unrealistic travel distance"
                        )
                    }

            except Exception:

                return {

                    "suspicious": True,

                    "reason": (
                        "Invalid distance format"
                    )
                }

        return {

            "suspicious": False,

            "reason": ""
        }