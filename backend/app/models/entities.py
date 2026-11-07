import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON, Float
)
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    phone = Column(String(20), nullable=True)
    district = Column(String(60), default="Bengaluru Urban")
    taluk = Column(String(60), default="Bengaluru North")
    category = Column(String(30), default="Cat-IIB")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="user", cascade="all, delete-orphan")
    appeal_drafts = relationship("AppealDraft", back_populates="user", cascade="all, delete-orphan")


class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    kannada_name = Column(String(255), nullable=True)
    department = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    target_audience = Column(String(255), nullable=True)
    description = Column(Text, nullable=False)
    kannada_description = Column(Text, nullable=True)
    income_limit = Column(Integer, default=0)
    income_limit_display = Column(String(150), nullable=True)
    required_documents = Column(JSON, default=list)
    application_deadline = Column(String(50), nullable=True)
    deadline_verified = Column(Boolean, default=False)
    official_portal_url = Column(String(255), nullable=False)
    source_of_information = Column(String(255), nullable=False)
    verification_status = Column(String(50), default="DEMO_VERIFIED")
    type = Column(String(50), default="welfare")
    tags = Column(JSON, default=list)


class SchemeRule(Base):
    __tablename__ = "scheme_rules"

    id = Column(Integer, primary_key=True, index=True)
    rule_id = Column(String(50), unique=True, nullable=False, index=True)
    scheme_id = Column(String(50), nullable=False, index=True)
    document_type = Column(String(100), nullable=False)
    rule_description = Column(Text, nullable=False)
    source_url = Column(String(255), nullable=True)
    government_order_or_notification = Column(String(255), nullable=False)
    relevant_clause = Column(String(255), nullable=False)
    validity_years = Column(Integer, nullable=True)
    last_verified_date = Column(String(50), nullable=False)
    verification_status = Column(String(50), default="DEMO_VERIFIED")
    severity = Column(String(20), default="CRITICAL")


class Document(Base):
    __tablename__ = "documents"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    filename = Column(String(255), nullable=False)
    document_type = Column(String(100), nullable=False)
    file_path = Column(String(500), nullable=True)
    upload_timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    file_size_bytes = Column(Integer, default=0)
    is_purged = Column(Boolean, default=False)

    user = relationship("User", back_populates="documents")
    extraction = relationship("DocumentExtraction", back_populates="document", uselist=False, cascade="all, delete-orphan")
    validations = relationship("ValidationResult", back_populates="document", cascade="all, delete-orphan")


class DocumentExtraction(Base):
    __tablename__ = "document_extractions"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(String(50), ForeignKey("documents.id"), unique=True, nullable=False)
    full_name = Column(String(150), nullable=True)
    certificate_number = Column(String(100), nullable=True)
    issue_date = Column(String(50), nullable=True)
    expiry_date = Column(String(50), nullable=True)
    issuing_authority = Column(String(255), nullable=True)
    annual_income = Column(Integer, nullable=True)
    applicant_category = Column(String(50), nullable=True)
    raw_text = Column(Text, nullable=True)
    ocr_confidence = Column(JSON, default=dict)
    manual_overrides = Column(JSON, default=dict)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    document = relationship("Document", back_populates="extraction")


class ValidationResult(Base):
    __tablename__ = "validation_results"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(String(50), ForeignKey("documents.id"), nullable=False)
    rule_id = Column(String(50), nullable=False)
    status = Column(String(30), nullable=False) # VERIFIED, ATTENTION_REQUIRED, UNABLE_TO_VERIFY
    category = Column(String(50), default="VALIDITY")
    reason = Column(Text, nullable=False)
    extracted_value = Column(String(255), nullable=True)
    expected_value = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    document = relationship("Document", back_populates="validations")


class SakalaService(Base):
    __tablename__ = "sakala_services"

    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(String(50), unique=True, nullable=False, index=True)
    service_name = Column(String(255), nullable=False)
    kannada_name = Column(String(255), nullable=True)
    department = Column(String(150), nullable=False)
    stipulated_timeline_days = Column(Integer, nullable=False)
    timeline_unit = Column(String(30), default="working_days")
    designated_officer = Column(String(200), nullable=False)
    first_appellate_authority = Column(String(200), nullable=False)
    second_appellate_authority = Column(String(200), nullable=False)
    source_reference = Column(String(255), nullable=False)
    last_verified_date = Column(String(50), nullable=False)
    verification_status = Column(String(50), default="DEMO_VERIFIED")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    gsc_number = Column(String(100), unique=True, nullable=False, index=True)
    service_id = Column(String(50), nullable=False)
    service_name = Column(String(255), nullable=False)
    applicant_name = Column(String(150), nullable=False)
    submission_date = Column(String(50), nullable=False)
    stipulated_days = Column(Integer, nullable=False)
    expected_deadline = Column(String(50), nullable=False)
    status = Column(String(50), default="PENDING")
    status_source = Column(String(50), default="MANUAL_ENTRY")
    office_name = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="applications")


class LegalProvision(Base):
    __tablename__ = "legal_provisions"

    id = Column(Integer, primary_key=True, index=True)
    provision_key = Column(String(50), unique=True, nullable=False, index=True)
    provision_number = Column(String(50), nullable=False)
    act_name = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    exact_verified_text = Column(Text, nullable=False)
    source_document = Column(String(255), nullable=False)
    amendment_reference = Column(String(255), nullable=False)
    verification_date = Column(String(50), nullable=False)
    verification_status = Column(String(50), default="VERIFIED")
    applies_to = Column(JSON, default=list)


class AppealDraft(Base):
    __tablename__ = "appeal_drafts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    gsc_number = Column(String(100), nullable=False)
    service_name = Column(String(255), nullable=False)
    applicant_name = Column(String(150), nullable=False)
    submission_date = Column(String(50), nullable=False)
    deadline_date = Column(String(50), nullable=False)
    days_delayed = Column(Integer, default=0)
    appeal_type = Column(String(50), default="FIRST_APPEAL")
    target_authority = Column(String(255), nullable=False)
    grounds_of_appeal = Column(Text, nullable=False)
    relief_requested = Column(Text, nullable=False)
    statutory_provisions = Column(JSON, default=list)
    draft_pdf_path = Column(String(500), nullable=True)
    disclaimer_ack = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="appeal_drafts")
