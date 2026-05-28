# MODEL.md

## Overview

The platform is designed to ingest enterprise ESG activity data from multiple operational systems, normalize inconsistent structures into a unified emissions model, and support analyst review before audit approval.

The core architectural challenge is not emissions calculation itself. The real difficulty is handling inconsistent upstream systems:

- SAP exports with multilingual headers and inconsistent units
- Utility billing data with varying billing cycles and tariff structures
- Corporate travel exports with incomplete distance information
- Missing or malformed data
- Auditability and source traceability requirements

The data model was designed specifically around these operational realities.

---

## Design Goals

The model prioritizes:

1. Multi-tenant support
2. Source traceability
3. Immutable raw ingestion
4. Normalized analytics-ready records
5. Analyst review workflows
6. Audit support
7. Unit normalization
8. Extensible ingestion pipelines

---

## High-Level Architecture

The system separates data into two major layers:

### 1. Raw Source Records

Raw uploaded data is preserved exactly as received.

**Purpose:**

- Preserve source-of-truth
- Support reprocessing
- Allow audit reconstruction
- Debug ingestion failures safely

### 2. Normalized Emission Records

Cleaned and normalized records are generated from raw records.

**Purpose:**

- Dashboard analytics
- Review workflows
- Emissions calculations
- Reporting
- Approvals

This separation prevents destructive ingestion logic and enables safer normalization pipelines.

---

## Multi-Tenant Design

Each record belongs to a company.

The system uses:

- `company_id`
- `ingestion_batch_id`
- `source_type`

to isolate organizational data and support future RBAC expansion.

This structure allows:

- Organization-level dashboards
- Tenant-specific reporting
- Audit isolation
- Future enterprise scaling

---

## Raw Source Tables

Separate raw tables are used for each source category.

### Implemented Raw Tables

- `SAPRawRecord`
- `UtilityRawRecord`
- `FlightTravelRawRecord`
- `HotelTravelRawRecord`
- `GroundTransportRawRecord`

### Why Separate Tables?

Different source systems contain fundamentally different schemas.

Examples:

- Utility data contains billing periods and meters
- Travel data contains origins/destinations
- SAP fuel data contains procurement identifiers

A single generic raw table would:

- Weaken validation
- Increase conditional logic
- Reduce query clarity
- Make normalization harder

Separate tables improve:

- Source-specific validation
- Indexing
- Ingestion maintainability
- Schema clarity

---

## EmissionRecord Table

The `EmissionRecord` table acts as the normalized analytical layer.

It stores:

- Normalized quantities
- Normalized units
- Scope categorization
- Emissions values
- Review state
- Suspicious flags
- Audit metadata

### Important Fields

**Source Tracking**

- `source_type`
- `source_record_id`
- `ingestion_batch_id`

**ESG Classification**

- `scope_category`
- `activity_type`

**Quantities**

- `raw_quantity`
- `raw_unit`
- `normalized_quantity`
- `normalized_unit`

**Emissions**

- `emission_factor`
- `co2e_emissions`

**Review Workflow**

- `review_status`
- `suspicious_flag`
- `suspicious_reason`

**Audit Trail**

- `approved_by`
- `approved_at`
- `created_at`
- `updated_at`

---

## Source Traceability

Every normalized record maintains linkage to its original source record.

This enables:

- Audit reconstruction
- Lineage tracking
- Ingestion debugging
- Replay/reprocessing

The original uploaded row is never deleted or overwritten.

This is critical for ESG audit workflows.

---

## Unit Normalization

Real enterprise data contains inconsistent units.

Examples:

- `Liter`
- `L`
- `LTR`
- `gallon`
- `MWh`
- `km`
- `miles`

The ingestion layer normalizes all accepted units into canonical units.

### Examples

**Fuel**

- `gallon` → `L`
- `kL` → `L`

**Electricity**

- `MWh` → `kWh`

**Travel**

- `miles` → `km`

This normalization occurs before emission calculation.

---

## Scope Categorization

Activities are automatically mapped into:

- Scope 1
- Scope 2
- Scope 3

Examples:

- `Diesel` → Scope 1
- `Electricity` → Scope 2
- `Flight` → Scope 3

This allows downstream reporting consistency even when uploaded datasets do not explicitly specify scope categories.

---

## Validation & Suspicious Detection

Not all invalid rows are rejected.

The system distinguishes between:

- Invalid rows
- Suspicious rows
- Reviewable rows

Examples of suspicious conditions:

- Extremely large quantities
- Unsupported units
- Missing fields
- Impossible travel distances
- Duplicate records

Suspicious rows are surfaced to analysts instead of being discarded.

This reflects realistic ESG operational workflows.

---

## Review Workflow

Each normalized record supports:

- `PENDING`
- `APPROVED`
- `REJECTED`

Analysts can review suspicious rows individually before audit approval.

This creates a human-in-the-loop ingestion system.

---

## Batch-Based Ingestion

Uploads create an ingestion batch.

The upload API returns:

```json
{
  "batch_id": "..."
}
```

instead of returning all processed rows directly.

This was intentionally designed because:

- Uploads may become large
- Ingestion may later become asynchronous
- UI should fetch rows independently
- Batch-level processing scales better

This separates ingestion orchestration from dashboard querying.

---

## Future Scalability Considerations

The model is intentionally extensible for:

- Celery async ingestion
- OCR pipelines
- Live ERP integrations
- Emissions factor versioning
- RBAC
- Audit exports
- Reprocessing systems
- Duplicate detection engines

---

## Conclusion

The data model was designed around realistic enterprise ESG ingestion problems rather than simplified CRUD assumptions.

The primary architectural priorities were:

- Auditability
- Traceability
- Normalization safety
- Analyst review workflows
- Ingestion scalability
- Operational realism
