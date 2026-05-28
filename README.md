# Breathe ESG Prototype – Documentation Pack

## Project Overview

This project is a prototype ESG emissions ingestion and review platform built using:

- Backend: Django + Django REST Framework
- Frontend: React.js
- Database: PostgreSQL
- Deployment: Render

The platform ingests emissions/activity data from multiple enterprise sources, normalizes inconsistent formats, calculates CO2e emissions, flags suspicious records, and supports analyst review workflows before audit approval.

The system is designed around a realistic enterprise ESG onboarding workflow inspired by the assignment requirements from Breathe ESG. 

---

# MODEL.md

## 1. Why This Data Model

The core challenge of ESG systems is not emission calculation itself.

The difficult part is:

- ingesting inconsistent enterprise data,
- preserving source-of-truth lineage,
- handling multiple ingestion formats,
- normalizing units,
- supporting analyst review,
- maintaining auditability.

The data model was designed around these operational realities.

The architecture separates:

1. Raw ingestion tables
2. Normalized emission records
3. Review workflow
4. Audit trail

This separation allows:

- immutable raw source preservation,
- traceability,
- safer normalization,
- reprocessing capability,
- enterprise audit support.

---

## 2. Multi-Tenant Design

The platform is designed for multiple companies.

Every normalized emission record contains:

- company_id
- ingestion_batch_id
- source_type

This ensures:

- tenant isolation,
- independent reporting,
- future RBAC support,
- organization-level analytics.

---

## 3. Core Tables

### Raw Source Tables

Separate raw tables were created because each source type contains fundamentally different structures.

Implemented raw tables:

- SAPRawRecord
- UtilityRawRecord
- FlightTravelRawRecord
- HotelTravelRawRecord
- GroundTransportRawRecord


### Why Separate Raw Tables?

A single polymorphic JSON table would:

- reduce validation quality,
- weaken schema clarity,
- make querying harder,
- complicate normalization.

Separate tables allow:

- source-specific validation,
- better indexing,
- cleaner processors,
- realistic enterprise modeling.

---

## 4. EmissionRecord Table

The normalized emission table acts as the single source for:

- dashboarding,
- review workflows,
- approvals,
- audit exports,
- emissions reporting.

Fields implemented:

```python
EMISSION_RECORD_FIELDS = [
    "company_id",
    "source_type",
    "source_record_id",
    "ingestion_batch_id",
    "scope_category",
    "activity_type",
    "facility_code",
    "facility_name",
    "raw_quantity",
    "raw_unit",
    "normalized_quantity",
    "normalized_unit",
    "emission_factor",
    "co2e_emissions",
    "activity_date",
    "billing_start",
    "billing_end",
    "origin",
    "destination",
    "distance_km",
    "travel_class",
    "meter_id",
    "tariff_type",
    "vendor_name",
    "confidence_score",
    "suspicious_flag",
    "suspicious_reason",
    "duplicate_flag",
    "normalization_status",
    "review_status",
    "approved_by",
    "approved_at"
]
```



---

## 5. Source-of-Truth Tracking

The system preserves source lineage using:

- source_type
- source_record_id
- ingestion_batch_id
- raw_row_data
- ingestion_timestamp

This enables:

- audit traceability,
- rollback capability,
- source reconstruction,
- re-normalization.

The original raw records are never overwritten.

---

## 6. Unit Normalization

Real enterprise datasets contain inconsistent units.

Examples:

- Liter
- L
- LTR
- gallon
- MWh
- km
- miles

The system normalizes these into canonical units.

### Canonical Units

```python
CANONICAL_UNITS = {
    "Diesel": "L",
    "Petrol": "L",
    "Natural Gas": "m3",
    "Electricity": "kWh"
}
```



### Accepted Units

```python
ACCEPTED_UNITS = {
    "Diesel": ["L", "Liter", "LTR", "gallon"],
    "Electricity": ["kWh", "MWh"],
    "Distance": ["km", "miles", "mi"]
}
```


Normalization happens during ingestion.

---

## 7. Scope Categorization

The platform automatically maps activities into Scope 1, 2, or 3.

```python
SCOPE_MAPPING = {
    "Diesel": "Scope 1",
    "Electricity": "Scope 2",
    "Flight": "Scope 3"
}
```

Reference: fileciteturn0file4L1-L10

This was chosen because enterprise uploads often omit explicit scope classification.

---

## 8. Field Mapping Layer

SAP exports and external systems frequently use:

- multilingual headers,
- abbreviations,
- ERP-specific naming.

Example:

```python
"Belegnummer": "transaction_id"
"Buchungskreis": "company_code"
"Menge": "quantity"
```

Reference: fileciteturn0file1L1-L30

A configurable field mapping layer was introduced to:

- standardize ingestion,
- support multilingual exports,
- reduce parser complexity.

---

## 9. Review Workflow Design

Each normalized row can exist in one of three review states:

- PENDING
- APPROVED
- REJECTED

Rows can also be flagged as:

- suspicious,
- duplicate,
- failed normalization.

This design supports analyst review before audit lock.

---

## 10. Audit Trail

Auditability was a major design requirement.

Every approval action stores:

- approved_by
- approved_at
- updated_at

This enables:

- reviewer accountability,
- audit reconstruction,
- compliance support.

---

## 11. Why Raw + Normalized Separation Matters

This was one of the most important architectural decisions.

Benefits:

| Raw Data | Normalized Data |
|---|---|
| Immutable source | Clean analytics |
| Full traceability | Dashboard-ready |
| Reprocessing support | Emission calculations |
| Parser debugging | Review workflows |

Without this separation:

- ingestion bugs become destructive,
- auditability weakens,
- normalization becomes irreversible.

---

# DECISIONS.md

## 1. SAP Ingestion Choice

### Chosen Format

CSV flat-file SAP export.

### Why

Real SAP systems expose multiple integration methods:

- IDoc
- BAPI
- OData
- flat exports

For a 4-day prototype, CSV exports were the most realistic balance between:

- implementation speed,
- enterprise realism,
- analyst usability.

Many sustainability teams still receive SAP exports as manually generated spreadsheets or CSV files.

---

## 2. Why German Headers Were Supported

SAP deployments are frequently localized.

The prototype intentionally supports German field names such as:

- Belegnummer
- Buchungskreis
- Menge

because this reflects realistic enterprise SAP exports.

---

## 3. Utility Data Choice

### Chosen Format

Portal CSV export.

### Why

Although utility APIs exist, many enterprise facilities teams still manually export CSVs from utility dashboards.

CSV ingestion was chosen because:

- utilities differ heavily by region,
- APIs are inconsistent,
- CSV exports are operationally common.

---

## 4. Travel Data Choice

### Chosen Format

CSV export modeled after Concur/Navan style reports.

### Why

Travel providers expose:

- API integrations,
- scheduled reports,
- downloadable CSVs.

CSV ingestion was selected because:

- it reflects real analyst workflows,
- easier for prototype implementation,
- realistic for ESG onboarding.

---

## 5. Why Upload API Returns batch_id

The upload endpoint intentionally returns:

```json
{
  "batch_id": "..."
}
```

instead of full processed rows.

Reference: fileciteturn0file7L1-L20

### Why

The upload API acts as an orchestration layer.

Returning all rows directly would:

- increase payload size,
- reduce scalability,
- tightly couple ingestion and UI.

Using batch IDs allows:

- async processing,
- scalable ingestion,
- dashboard-driven retrieval.

---

## 6. Why Separate Processors Were Used

Separate processors were implemented:

- SAPProcessor
- UtilityProcessor
- TravelProcessor

Each source contains fundamentally different:

- validations,
- normalization rules,
- emission logic.

A single universal processor would become fragile and difficult to maintain.

---

## 7. Why Suspicious Records Exist

Enterprise ESG datasets are messy.

Examples:

- impossible fuel quantities,
- missing units,
- invalid travel distances,
- duplicate invoices.

Instead of rejecting all problematic rows, suspicious rows are surfaced for analyst review.

This better reflects real ESG operations.

---

## 8. What I Would Ask the PM

Questions I would ask in a real implementation:

1. Which ESG reporting framework is primary?
   - GHG Protocol?
   - CDP?
   - CSRD?

2. Should auditors see raw records or only approved rows?

3. Are emissions recalculated historically if emission factors change?

4. What level of tenant isolation is required?

5. Should analysts be able to edit normalized values?

6. What is the expected ingestion scale?

7. Is asynchronous ingestion required?

---

# TRADEOFFS.md

## 1. I Did Not Build OCR for Utility PDFs

### Why

OCR pipelines introduce:

- extraction errors,
- layout variance,
- document parsing complexity.

For the prototype, CSV ingestion provided:

- more reliable validation,
- faster implementation,
- clearer review workflows.

---

## 2. I Did Not Build Real-Time External API Sync

### Why

Production-grade integrations require:

- OAuth flows,
- token refresh,
- rate limiting,
- retry systems,
- scheduler infrastructure.

This would significantly expand scope beyond the core ingestion/review architecture.

The prototype focuses on ingestion quality instead.

---

## 3. I Did Not Build Full RBAC

### Why

Role-based access systems require:

- permission matrices,
- tenant isolation policies,
- admin tooling.

Instead, the prototype focused on:

- ingestion,
- normalization,
- auditability,
- review workflows.

The database structure already supports future RBAC expansion.

---

# SOURCES.md

## 1. SAP Research

### Research Done

Researched:

- SAP CSV exports
- SAP IDoc structures
- SAP OData services
- ERP procurement exports

### What I Learned

Real SAP exports commonly contain:

- inconsistent column naming,
- multilingual headers,
- ERP abbreviations,
- inconsistent date formats,
- unclear plant codes.

Many organizations still use manually exported spreadsheets.

### Prototype Decision

Handled:

- CSV flat exports,
- multilingual headers,
- fuel/procurement rows,
- unit normalization.

Ignored:

- live SAP integrations,
- IDoc parsing,
- complex procurement hierarchies.

### What Would Break in Production

- custom SAP schemas,
- missing lookup tables,
- inconsistent encoding,
- ERP-specific custom fields.

---

## 2. Utility Research

### Research Done

Researched:

- utility portal exports,
- electricity billing structures,
- meter-based consumption reports.

### What I Learned

Utility datasets often contain:

- billing periods,
- tariff plans,
- non-calendar reporting windows,
- meter identifiers,
- varying units.

### Prototype Decision

Handled:

- CSV utility exports,
- billing periods,
- meter IDs,
- unit normalization.

Ignored:

- PDF OCR,
- demand charges,
- dynamic tariffs,
- regional utility APIs.

### What Would Break in Production

- scanned invoices,
- inconsistent tariff structures,
- missing meter mappings.

---

## 3. Travel Research

### Research Done

Researched:

- Concur export structures,
- Navan reporting,
- travel expense datasets.

### What I Learned

Travel data is inconsistent because:

- flights may not include distances,
- hotel stays use nights instead of distance,
- airport codes may require geolocation lookup,
- transport categories vary.

### Prototype Decision

Handled:

- CSV exports,
- flights,
- hotels,
- ground transport,
- travel class,
- distance normalization.

Ignored:

- airport geolocation enrichment,
- itinerary reconstruction,
- multi-leg journeys.

### What Would Break in Production

- missing airport mappings,
- inconsistent transport categories,
- international travel edge cases.

---

# IMPLEMENTED APIs

## Upload API

### Endpoint

```http
POST /api/upload/
```

### Current Behavior

- Accepts CSV file upload
- Auto-detects source type
- Routes file to appropriate processor

Current status:

- SAP: Implemented
- Utility: Partially implemented
- Travel: Partially implemented

Reference: fileciteturn0file7L1-L20

---

## Dashboard Summary API

### Endpoint

```http
GET /api/dashboard/summary/
```

### Returns

- total_records
- approved_records
- pending_records
- suspicious_records

Reference: fileciteturn0file7L22-L33

---

## Suspicious Records API

### Endpoint

```http
GET /api/dashboard/suspicious/
```

### Returns

- suspicious rows
- suspicious reasons
- review status

Reference: fileciteturn0file7L35-L43

---

## Review API

### Endpoint

```http
POST /api/review/<record_id>/
```

### Actions

```json
{
  "action": "approve"
}
```

Supported actions:

- approve
- reject

Reference: fileciteturn0file7L45-L55

---

# SYSTEM FLOW

```text
CSV Upload
    ↓
Source Detection
    ↓
Processor Routing
    ↓
Raw Record Storage
    ↓
Validation
    ↓
Normalization
    ↓
Emission Calculation
    ↓
Suspicious Detection
    ↓
EmissionRecord Creation
    ↓
Analyst Review
    ↓
Approval / Rejection
    ↓
Audit Ready State
```

---

# FUTURE IMPROVEMENTS

## Planned Improvements

1. Asynchronous ingestion using Celery
2. OCR support for PDF utility bills
3. Airport geolocation lookup
4. Dynamic emission factor versioning
5. Full RBAC system
6. Audit export pipeline
7. Analyst editing workflows
8. Duplicate detection engine
9. Batch reprocessing system
10. Webhook/API ingestion

---

# CONCLUSION

This prototype was intentionally designed around:

- realistic enterprise ESG ingestion problems,
- auditability,
- source traceability,
- analyst review workflows,
- scalable normalization architecture.

The primary focus was not CRUD completeness, but designing a system capable of handling messy real-world ESG data with defensible architectural decisions.

