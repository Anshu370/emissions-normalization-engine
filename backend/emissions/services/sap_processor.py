import pandas as pd

from emissions.models.company import Company
from emissions.models.ingestion_batch import IngestionBatch
from emissions.models.raw_records import SAPRawRecord
from emissions.models.emission_record import EmissionRecord

from common.validators.sap_validator import SAPValidator

from emissions.services.normalizer import EmissionNormalizer
from emissions.services.emission_calculation_service import EmissionCalculationService


class SAPProcessor:

    @staticmethod
    def process_csv(
        uploaded_file
    ):

        company = Company.objects.first()

        batch = IngestionBatch.objects.create(
            company=company,
            source_type="SAP",
            uploaded_file=uploaded_file,
            original_file_name=uploaded_file.name,
            status="PROCESSING"
        )

        uploaded_file.seek(0)

        df = pd.read_csv(uploaded_file)

        validation_result = (
            SAPValidator.validate_headers(
                df.columns.tolist()
            )
        )

        if not validation_result["is_valid"]:
            batch.status = "FAILED"
            batch.save()

            raise Exception(
                f"Missing required fields: {validation_result['missing_fields']}"
            )

        total_rows = len(df)

        successful_rows = 0

        for index, row in df.iterrows():

            row = row.where(
                pd.notnull(row),
                None
            )

            row_data = {str(key).strip().lower(): value for key, value in row.to_dict().items()}

            raw_record = SAPRawRecord.objects.create(
                company=company,
                ingestion_batch=batch,
                raw_row_data=row.to_dict(),
                row_number= index + 1
            )

            normalized_data = EmissionNormalizer.normalize_row(
                row_data
            )

            suspicious_result = (
                SAPValidator.detect_suspicious(
                    row_data
                )
            )

            factor, emission = (
                EmissionCalculationService
                .calculate_emission(
                    activity_type=(
                            normalized_data.get("fuel_type")
                            or "Unknown"
                    ),
                    quantity=normalized_data.get(
                        "quantity",
                        0
                    )
                )
            )


            EmissionRecord.objects.create(
                company=company,
                ingestion_batch=batch,
                source_record_id=raw_record.id,

                source_type="SAP",

                scope_category=normalized_data.get(
                    "scope_category",
                    "Unknown"
                ),

                activity_type=(
                        normalized_data.get("fuel_type")
                        or "Unknown"
                ),

                facility_code=normalized_data.get(
                    "facility_code"
                ),

                raw_quantity=float(
                    normalized_data.get("quantity", 0)
                ),

                raw_unit=normalized_data.get(
                    "normalized_unit",
                    ""
                ),

                normalized_quantity=float(
                    normalized_data.get("quantity", 0)
                ),

                normalized_unit=normalized_data.get(
                    "normalized_unit",
                    ""
                ),

                vendor_name=normalized_data.get(
                    "vendor_name"
                ),

                suspicious_flag=suspicious_result["suspicious"],

                suspicious_reason=suspicious_result["reason"],

                review_status=(
                    "PENDING"
                    if suspicious_result["suspicious"]
                    else "APPROVED"
                ),

                emission_factor=factor,

                co2e_emissions=emission,
            )

            successful_rows += 1

        batch.total_rows = total_rows
        batch.successful_rows = successful_rows
        batch.failed_rows = total_rows - successful_rows
        batch.status = "COMPLETED"

        batch.save()

        return batch