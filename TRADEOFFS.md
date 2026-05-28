# TRADEOFFS.md

## Overview

This prototype intentionally focused on ingestion architecture, normalization, and review workflows rather than maximizing feature count.

Several features were deliberately excluded to maintain implementation quality and architectural clarity.

---

## 1. OCR for Utility PDFs Was Not Built

### Why It Was Excluded

OCR pipelines introduce substantial complexity:

- Document layout variance
- Extraction failures
- Parsing inconsistencies
- Vendor-specific formatting

Building reliable OCR ingestion would require:

- Document preprocessing
- OCR confidence handling
- Layout-aware parsing
- Manual correction workflows

For the prototype, CSV utility ingestion provided:

- More reliable validation
- Faster implementation
- Cleaner normalization logic

### Tradeoff

The system currently assumes structured utility exports instead of scanned invoices.

---

## 2. Live ERP/API Integrations Were Not Built

### Why It Was Excluded

Production-grade integrations require:

- OAuth flows
- Token refresh systems
- Retries
- Rate limiting
- Scheduling infrastructure
- Monitoring pipelines

Implementing this properly would significantly expand scope beyond the assignment timeline.

The prototype instead focuses on:

- Ingestion correctness
- Normalization quality
- Review workflows

### Tradeoff

Current ingestion is upload-driven instead of continuously synchronized.

---

## 3. Full RBAC Was Not Implemented

### Why It Was Excluded

A complete RBAC system requires:

- Role hierarchies
- Permission matrices
- Organization-level policies
- Admin tooling

The assignment prioritized ingestion architecture over enterprise identity systems.

### Tradeoff

The current system assumes authenticated analyst access without granular permissions.

The schema still supports future RBAC expansion through:

- Company-level ownership
- Approval metadata
- Tenant-aware records

---

## 4. Asynchronous Processing Was Deferred

### Why It Was Excluded

The current implementation processes uploads synchronously.

Async ingestion would require:

- Celery/RQ workers
- Redis infrastructure
- Retry systems
- Job tracking
- Failure recovery

Given the prototype scope, synchronous ingestion was sufficient for demonstrating architecture and workflows.

### Tradeoff

Very large uploads may eventually require background processing.

---

## 5. Emission Factor Versioning Was Not Implemented

### Why It Was Excluded

Production ESG systems often maintain:

- Versioned factors
- Regional factors
- Historical recalculation support

This introduces substantial complexity around:

- Audit consistency
- Historical recomputation
- Reporting reproducibility

The prototype uses simplified emission factor handling.

### Tradeoff

Historical emissions recalculation is not yet supported.

---

## 6. Airport Geolocation Enrichment Was Not Implemented

### Why It Was Excluded

Travel datasets frequently lack:

- Explicit distances
- Route metadata

Production systems often enrich:

- Airport coordinates
- Travel distances
- Multi-leg itineraries

This would require:

- Aviation datasets
- Geospatial calculations
- Itinerary reconstruction

The prototype instead assumes travel distance is provided or simplified.

### Tradeoff

Complex travel edge cases are not fully handled.

---

## Conclusion

The project intentionally prioritized:

- Strong ingestion architecture
- Realistic normalization
- Traceability
- Analyst workflows
- Auditability

instead of attempting to implement every enterprise feature superficially.
