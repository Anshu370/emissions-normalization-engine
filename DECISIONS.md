# DECISIONS.md

## Overview

This document explains the major architectural and product decisions made while building the ESG ingestion prototype.

The assignment intentionally contained ambiguities. These decisions represent the assumptions and tradeoffs chosen during implementation.

---

## 1. SAP Integration Strategy

### Decision

Use CSV-based SAP exports instead of direct SAP APIs.

### Why

Real SAP ecosystems expose multiple integration mechanisms:

- IDoc
- BAPI
- OData
- Flat-file exports

For a 4-day prototype, CSV exports provided the best balance between:

- Realism
- Implementation speed
- Operational simplicity

In many organizations, sustainability teams still work primarily with manually exported ERP spreadsheets.

---

## 2. Supporting German SAP Headers

### Decision

Support multilingual SAP headers such as:

- `Belegnummer`
- `Buchungskreis`
- `Menge`

### Why

SAP systems are heavily localized across enterprises.

Real exports frequently contain:

- German labels
- Abbreviations
- ERP-specific terminology

Adding a field mapping layer made the ingestion pipeline significantly more realistic.

---

## 3. Raw + Normalized Data Separation

### Decision

Separate:

- Raw ingestion records
- Normalized emission records

### Why

This was one of the most important architectural decisions.

**Benefits:**

- Immutable source preservation
- Audit traceability
- Safe reprocessing
- Easier debugging
- Non-destructive normalization

**Without this separation:**

- Ingestion bugs could corrupt original data
- Audit reconstruction becomes difficult
- Re-normalization becomes risky

---

## 4. Separate Raw Tables Per Source

### Decision

Use separate raw tables for:

- SAP
- Utility
- Flight travel
- Hotel travel
- Ground transport

### Why

Different sources contain fundamentally different schemas.

A single generic table would:

- Increase conditional logic
- Reduce schema clarity
- Weaken validation quality

Separate tables allow:

- Cleaner validation
- Source-specific processing
- Better indexing
- Easier maintenance

---

## 5. Batch-Based Upload Architecture

### Decision

Upload API returns `batch_id` instead of returning all processed rows.

### Why

The upload endpoint acts as an orchestration layer.

Returning rows directly would:

- Increase payload size
- Tightly couple backend and UI
- Reduce scalability

Batch-based ingestion supports:

- Async processing
- Scalable uploads
- Independent dashboard fetching
- Future background workers

---

## 6. CSV-Based Utility Ingestion

### Decision

Use utility portal CSV exports.

### Why

Although APIs exist, real-world utility integrations are inconsistent.

Many facilities teams still manually export:

- CSV files
- Spreadsheet reports

CSV ingestion provided:

- Operational realism
- Faster implementation
- Easier validation

---

## 7. CSV-Based Travel Ingestion

### Decision

Use CSV exports modeled after Concur/Navan reports.

### Why

Corporate travel systems commonly expose:

- Downloadable reports
- Scheduled exports
- API feeds

CSV ingestion was chosen because it reflects realistic analyst workflows while remaining feasible within the prototype timeline.

---

## 8. Suspicious Record Workflow

### Decision

Flag suspicious rows instead of rejecting all problematic rows.

### Why

Real ESG data is messy.

Examples:

- Missing units
- Abnormal quantities
- Invalid distances
- Duplicate invoices

Analysts frequently review imperfect records manually.

The system therefore surfaces suspicious records for human review instead of discarding them automatically.

---

## 9. Human-in-the-Loop Review System

### Decision

Require analyst approval before audit-ready state.

### Why

Enterprise ESG workflows generally require:

- Analyst review
- Exception handling
- Sign-off processes

This design better reflects operational ESG processes than fully automated ingestion.

---

## 10. Scope Auto-Mapping

### Decision

Automatically classify activities into Scope 1, Scope 2, and Scope 3.

### Why

Uploaded datasets often omit scope categorization.

Automatic mapping reduces analyst workload and standardizes downstream reporting.

---

## 11. Unit Normalization Pipeline

### Decision

Normalize inconsistent units into canonical units before emissions calculation.

### Why

Enterprise datasets frequently contain:

- `L`
- `Liter`
- `gallon`
- `MWh`
- `miles`

Without normalization:

- Emissions calculations become inconsistent
- Aggregation becomes unreliable

---

## 12. What Was Intentionally Ignored

The prototype intentionally did not implement:

- OCR for PDF utility bills
- Live ERP integrations
- Asynchronous queues
- Full RBAC
- Airport geolocation enrichment
- Dynamic emissions factor versioning

These were excluded to prioritize core ingestion architecture and review workflows.

---

## 13. Questions I Would Ask the PM

### Reporting Standards

Which reporting framework is primary?

- GHG Protocol?
- CDP?
- CSRD?

### Historical Recalculation

Should emissions be recalculated historically if factors change?

### Auditor Access

Should auditors see:

- Raw records?
- Approved records only?

### Scale Expectations

Expected ingestion scale:

- Thousands?
- Millions?
- Streaming ingestion?

### Edit Permissions

Can analysts modify normalized values directly?

### Approval Rules

Does every suspicious record require approval?

---

## Conclusion

The implementation prioritized:

- Realistic enterprise ingestion behavior
- Auditability
- Traceability
- Normalization safety
- Scalable architecture
- Analyst usability

over feature quantity.
