from common.constants.field_mapping import FIELD_MAPPING
from common.constants.scope_mapping import SCOPE_MAPPING


class EmissionNormalizer:

    @staticmethod
    def normalize_row(raw_row):

        normalized_data = {}

        for key, value in raw_row.items():

            mapped_field = FIELD_MAPPING.get(
                str(key).strip().lower()
            )

            if mapped_field:
                normalized_data[mapped_field] = value

        fuel_type = normalized_data.get("fuel_type")

        scope_category = SCOPE_MAPPING.get(
            fuel_type,
            "Unknown"
        )

        normalized_data["scope_category"] = scope_category

        return normalized_data