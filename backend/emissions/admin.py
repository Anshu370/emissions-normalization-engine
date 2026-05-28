from django.contrib import admin

from emissions.models.company import Company
from emissions.models.ingestion_batch import IngestionBatch
from emissions.models.raw_records import SAPRawRecord, UtilityRawRecord, TravelRawRecord
from emissions.models.emission_record import EmissionRecord

admin.site.register(Company)
admin.site.register(IngestionBatch)
admin.site.register(SAPRawRecord)
admin.site.register(UtilityRawRecord)
admin.site.register(TravelRawRecord)
admin.site.register(EmissionRecord)
