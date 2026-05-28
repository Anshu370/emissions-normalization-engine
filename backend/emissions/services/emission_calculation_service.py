from common.constants.emission_factors import EMISSION_FACTORS


class EmissionCalculationService:

    @staticmethod
    def calculate_emission(
        activity_type,
        quantity
    ):

        factor = EMISSION_FACTORS.get(
            activity_type
        )

        if not factor:
            return None, None

        if quantity is None:
            return factor, None

        emission = round(
            float(quantity) * factor,
            2
        )

        return factor, emission