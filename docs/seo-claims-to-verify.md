# PattaCare Marketing Claims Verification Registry

This document catalogues every quantitative, compliance, integration, security, and clinical decision support claim present on the PattaCare marketing site (`pattacare.com`). 

> **Notice:** As per SEO technical foundation guidelines, these claims are flagged for legal, clinical, and compliance review without modifying the live website copy.

---

## 1. Quantitative & Performance Claims

| Claim | Locations in Codebase | Context & Exact Phrasing | Verification Requirement |
|---|---|---|---|
| **90%+ Patient Compliance** | `index.html` (Line 631) | Capability badge in `#capabilities`: `<span class="capability-badge">90%+ Patient Compliance</span>` | Empirical study, cohort data, or clinical trial evidence supporting ≥90% compliance rate. |
| **Over 90% Engagement** | `index.html` (Lines 155, 996) | JSON-LD FAQ & Visible FAQ #1: *"PattaCare operates directly within WhatsApp, achieving over 90% engagement because patients interact in the messaging tool they already check multiple times daily."* | Product telemetry / hospital pilot engagement benchmarks verifying WhatsApp response rates. |
| **10 to 14 Business Days Pilot Launch** | `index.html` (Lines 195, 1046) | JSON-LD FAQ & Visible FAQ #6: *"Clinical departments can launch a pilot program in as little as 10 to 14 business days."* | Standard implementation and deployment timeline sign-off from technical operations. |
| **30-Day Post-Operative Window** | `index.html` (Line 559) | Video Highlights section: *"Monitors recovery progress from hospital discharge through the critical 30-day post-operative window."* | Clinical protocol protocol alignment for post-acute episode coverage. |

---

## 2. Security, Privacy & Tenancy Claims

| Claim | Locations in Codebase | Context & Exact Phrasing | Verification Requirement |
|---|---|---|---|
| **TLS 1.3 Encryption in Transit** | `index.html` (Lines 82, 965, 1272) | JSON-LD featureList, Security Card 3, Footer: *"All clinical data and telemetry streams are protected with TLS 1.3 encryption in transit..."* | Infrastructure SSL/TLS configuration proof and cipher suite verification. |
| **AES-256 Encryption at Rest** | `index.html` (Lines 82, 171, 965, 1016, 1272) | JSON-LD FAQ, Security Card 3, FAQ #3, Footer: *"...and AES-256 encryption at rest across dedicated hospital-isolated storage volumes."* | Cloud database / blob storage KMS encryption verification. |
| **Dedicated Hospital Cloud Tenants** | `index.html` (Lines 171, 965, 1016) | FAQ #3 & Security Card 3: *"All data at rest is encrypted using AES-256 in dedicated hospital cloud tenants."* | Cloud tenancy architecture validation (siloed multi-tenant vs. dedicated container/VPC per hospital). |
| **Regional Cloud Tenancy & Data Sovereignty** | `index.html` (Lines 974, 1273) | Security Card 4 & Footer: *"Regional cloud tenancy guarantees data sovereignty across USA, UK, Canada, and India."* | Active hosting regions confirmation (e.g. AWS/Azure regions in US, UK, Canada, India) and data residency compliance. |
| **Role-Based Access Control (RBAC) & Immutable Audit Logging** | `index.html` (Lines 171, 974, 1016) | FAQ #3 & Security Card 4: *"Strict Role-Based Access Control (RBAC) and immutable, auditable access logs."* | IAM and audit trail implementation confirmation. |

---

## 3. Compliance & Regulatory Standards Claims

| Claim | Locations in Codebase | Context & Exact Phrasing | Verification Requirement |
|---|---|---|---|
| **HIPAA Alignment** | `index.html` (Lines 171, 1016, 1274) | JSON-LD FAQ, FAQ #3, Footer: *"...aligned with HIPAA, GDPR, and regional health data privacy standards."* | Business Associate Agreement (BAA) readiness, HIPAA risk assessment, or HIPAA compliance attestation. |
| **GDPR Alignment** | `index.html` (Lines 171, 1016, 1274) | JSON-LD FAQ, FAQ #3, Footer: *"...aligned with HIPAA, GDPR, and regional health data privacy standards."* | GDPR Article 28 DPA readiness, EU representative, standard contractual clauses (SCC). |
| **Enterprise WhatsApp Business Cloud API Security** | `index.html` (Lines 171, 1016) | FAQ #3: *"PattaCare leverages enterprise WhatsApp Business Cloud API connections with end-to-end transport security."* | Meta WhatsApp Cloud API BAA/DPA terms verification. |

---

## 4. EHR / EMR Interoperability Claims

| Claim | Locations in Codebase | Context & Exact Phrasing | Verification Requirement |
|---|---|---|---|
| **Bi-directional HL7 & FHIR R4 Connectors** | `index.html` (Lines 81, 187, 653, 956, 1036, 1265) | Capability 3, Security Card 2, FAQ #5, Footer: *"Built with bi-directional HL7 and FHIR API connectors to ingest surgical discharge rosters and synchronize structured SBAR summaries directly into hospital Electronic Health Records..."* | Integration documentation or API sandbox endpoints for HL7 v2 / FHIR R4 resources. |
| **Named EHR Connectors: Epic, Cerner, MEDITECH** | `index.html` (Lines 81, 187, 653, 956, 1036, 1196) | Multiple sections explicitly naming `(Epic, Cerner, MEDITECH)` and lead form placeholder: *"Tell us about your target surgical cohorts, EHR (Epic, Cerner, etc.)..."* | Specific connector status verification (certified app marketplace listing, FHIR API bridge, or HL7 interface engine). |

---

## 5. Clinical Decision Support & AI Safety Claims

| Claim | Locations in Codebase | Context & Exact Phrasing | Verification Requirement |
|---|---|---|---|
| **"Zero Hallucination Risk — Strict Algorithmic Triage Thresholds"** | `index.html` (Line 602) | Capability 1 bullet: *"Zero hallucination risk — strict algorithmic triage thresholds"* | Technical confirmation that clinical triage operates via deterministic rules/decision trees rather than unconstrained generative LLM completions. |
| **"Zero Generative Hallucination in Risk Detection"** | `index.html` (Line 947) | Security Card 1: *"Configurable, deterministic procedural protocols. Zero generative hallucination in risk detection — all clinical assessments and treatment decisions remain strictly under licensed surgical care team authority."* | Safety architecture documentation detailing deterministic guardrails and clinical oversight protocols. |
| **"Deterministic Clinical AI"** | `index.html` (Line 1275) | Footer link: `<li><a href="#security-architecture">Deterministic Clinical AI</a></li>` | Verification of deterministic classification models vs generative models in triage pipeline. |
| **No Autonomous Clinical Decisions / Does Not Replace Surgeons** | `index.html` (Lines 163, 1006, 1283) | FAQ #2 & Footer: *"PattaCare is strictly an intelligent clinical visibility and triage tool... All diagnoses, clinical interpretations, and treatment decisions remain entirely with your surgical care team."* | Software as a Medical Device (SaMD) regulatory boundary review (FDA / CE-MDR / CDSCO classification). |

---

## 6. Surgical Specialty Templates Claims

| Claim | Locations in Codebase | Context & Exact Phrasing | Verification Requirement |
|---|---|---|---|
| **Specialty Recovery Templates** | `index.html` (Lines 195, 1046) | FAQ #6: *"We provide customizable procedure-specific recovery templates (Orthopedics, General Surgery, Cardiology, Bariatrics), coordinator training, and patient discharge orientation materials."* | Verification of existing clinical protocol libraries for Orthopedics, General Surgery, Cardiology, and Bariatrics. |
| **Specialty Cohorts in Form & Footer** | `index.html` (Lines 1173-1180, 1260-1264) | Demo form dropdown & footer navigation: Orthopedics & Joint Replacement, General & Abdominal Surgery, Cardiovascular & Thoracic, Bariatric Surgery, Surgical Oncology. | Clinical review of available questionnaire protocols across each named surgical specialty. |

---

## Review Recommendations for Legal & Clinical Teams
1. **Clinical Evidence Documentation**: Consolidate patient cohort data justifying the "90%+ compliance/engagement" claim.
2. **EHR Partner Terms**: Review trademark usage guidelines for third-party EHR names (Epic, Cerner, MEDITECH).
3. **Regulatory Boundary Sign-off**: Ensure that the "Zero Hallucination / Deterministic AI" disclaimer satisfies applicable FDA / SaMD non-device clinical decision support (CDS) exemptions.
