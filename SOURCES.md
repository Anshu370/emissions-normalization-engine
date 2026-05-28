# SOURCES.md

## Overview

This document explains the real-world source systems researched while building the ESG ingestion prototype.

The assignment intentionally required researching realistic enterprise data formats instead of using toy datasets.

The prototype was designed around common operational workflows observed in:

- SAP exports
- Utility consumption reporting
- Corporate travel systems

---

## 1. SAP Fuel & Procurement Data

### Research Performed

Researched:

- SAP CSV exports
- SAP IDoc structures
- SAP OData services
- ERP procurement exports
- Fuel activity datasets

### What Was Learned

Real SAP exports commonly contain:

- Multilingual headers
- ERP abbreviations
- Inconsistent units
- Inconsistent date formats
- Plant/facility codes
- Procurement identifiers

Examples observed:

- `BELNR`
- `BUKRS`
- `MATNR`
- `Menge`

Many enterprise sustainability teams still receive manually exported spreadsheets from ERP systems instead of clean APIs.

### Prototype Handling

The prototype supports:

- CSV SAP exports
- Multilingual field mapping
- Procurement/fuel rows
- Unit normalization
- Scope categorization

Supported examples:

- German headers
- English headers
- Inconsistent quantity units

### What Was Intentionally Ignored

Not implemented:

- Direct SAP integration
- IDoc parsing
- OData authentication
- Custom SAP modules
- Procurement hierarchy modeling

### What Would Break in Production

Potential production challenges:

- Organization-specific schemas
- Custom ERP fields
- Encoding issues
- Incomplete facility mappings
- Inconsistent master data

---

## 2. Utility Electricity Data

### Research Performed

Researched:

- Utility portal exports
- Electricity billing structures
- Meter-based reporting
- Utility CSV downloads

### What Was Learned

Real utility datasets commonly contain:

- Billing periods
- Meter identifiers
- Tariff plans
- Non-calendar reporting windows
- Varying electricity units

Utilities often expose:

- Downloadable CSV reports
- Spreadsheets
- PDFs
- Limited APIs

Many facilities teams still rely heavily on manual exports.

### Prototype Handling

The prototype supports:

- CSV utility exports
- Billing periods
- Meter IDs
- Tariff fields
- Electricity normalization

Supported examples:

- `kWh`
- `MWh`

### What Was Intentionally Ignored

Not implemented:

- OCR extraction
- PDF parsing
- Dynamic tariff calculations
- Utility APIs
- Regional pricing logic

### What Would Break in Production

Potential production challenges:

- Scanned invoices
- Inconsistent billing structures
- Missing meter mappings
- Malformed utility exports
- Region-specific tariff systems

---

## 3. Corporate Travel Data

### Research Performed

Researched:

- Concur exports
- Navan reporting formats
- Corporate travel datasets
- Travel emissions categories

### What Was Learned

Travel data is highly inconsistent.

Flights may contain:

- Airport codes only
- No travel distance
- Missing class information

Hotels use nights instead of distance.

Ground transport categories vary significantly across providers.

### Prototype Handling

The prototype supports:

- CSV travel exports
- Flights
- Hotels
- Ground transport
- Travel class
- Distance normalization

Supported examples:

- `km`
- `miles`

### What Was Intentionally Ignored

Not implemented:

- Airport geolocation lookup
- Itinerary reconstruction
- Multi-leg flight logic
- External travel APIs

### What Would Break in Production

Potential production challenges:

- Missing airport mappings
- Incomplete itineraries
- Inconsistent transport categories
- International travel edge cases

---

## Sample Data Philosophy

The sample datasets were intentionally designed to contain:

- Inconsistent units
- Multilingual fields
- Missing values
- Suspicious quantities
- Review-required rows

This was done because real ESG onboarding data is rarely clean.

The prototype prioritizes realistic ingestion behavior over artificially perfect datasets.

---

## Conclusion

The ingestion system was designed around operational realities observed in enterprise ESG workflows:

- Inconsistent source systems
- Manually exported datasets
- Incomplete records
- Normalization requirements
- Human review processes
- Audit traceability

The goal was to simulate realistic onboarding conditions rather than simplified demo data.
