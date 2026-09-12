from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from enum import StrEnum
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Numeric,
    String,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


class EmploymentType(StrEnum):
    PAYROLL = "PLANILLA"
    CONTRACTOR = "TERCERIZADO"


class Seniority(StrEnum):
    MEDIUM = "MEDIUM"
    SENIOR = "SENIOR"


class Vendor(Base):
    __tablename__ = "vendors"
    __table_args__ = (Index("ix_vendors_ruc_lower", text("lower(ruc)"), unique=True),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    ruc: Mapped[str] = mapped_column(String(64), nullable=False)
    focal_point: Mapped[str] = mapped_column(String(160), nullable=False)
    mobile: Mapped[str | None] = mapped_column(String(32), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )


class Squad(Base):
    __tablename__ = "squads"
    __table_args__ = (Index("ix_squads_code_lower", text("lower(code)"), unique=True),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    code: Mapped[str] = mapped_column(String(64), nullable=False)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    tribe: Mapped[str | None] = mapped_column(String(160), nullable=True)
    product_owner_name: Mapped[str | None] = mapped_column(String(160), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )


class ProfessionalRole(Base):
    __tablename__ = "professional_roles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    name: Mapped[str] = mapped_column(String(120), nullable=False, unique=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)


class TeamMember(Base):
    __tablename__ = "team_members"
    __table_args__ = (
        CheckConstraint("employment_type IN ('PLANILLA', 'TERCERIZADO')", name="ck_member_employment_type"),
        CheckConstraint("seniority IN ('MEDIUM', 'SENIOR')", name="ck_member_seniority"),
        Index("ix_team_members_email_lower", text("lower(email)"), unique=True),
        Index("ix_team_members_professional_role_id", "professional_role_id"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    dni: Mapped[str] = mapped_column(String(32), nullable=False, unique=True)
    first_name: Mapped[str] = mapped_column(String(120), nullable=False)
    paternal_surname: Mapped[str] = mapped_column(String(120), nullable=False)
    maternal_surname: Mapped[str | None] = mapped_column(String(120), nullable=True)
    email: Mapped[str] = mapped_column(String(254), nullable=False, unique=True)
    mobile: Mapped[str | None] = mapped_column(String(32), nullable=True)
    birth_date: Mapped[date] = mapped_column(Date, nullable=False)
    employment_type: Mapped[str] = mapped_column(String(20), nullable=False)
    professional_role_id: Mapped[str] = mapped_column(ForeignKey("professional_roles.id"), nullable=False)
    seniority: Mapped[str] = mapped_column(String(20), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    professional_role: Mapped[ProfessionalRole] = relationship()
    affiliations: Mapped[list[MemberVendorAffiliation]] = relationship(
        back_populates="member", cascade="all, delete-orphan"
    )


class MemberVendorAffiliation(Base):
    __tablename__ = "member_vendor_affiliations"
    __table_args__ = (
        CheckConstraint("valid_until IS NULL OR valid_until > valid_from", name="ck_affiliation_valid_range"),
        Index("ix_affiliations_member_valid_from", "member_id", "valid_from"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    member_id: Mapped[str] = mapped_column(ForeignKey("team_members.id"), nullable=False)
    vendor_id: Mapped[str] = mapped_column(ForeignKey("vendors.id"), nullable=False)
    valid_from: Mapped[date] = mapped_column(Date, nullable=False)
    valid_until: Mapped[date | None] = mapped_column(Date, nullable=True)

    member: Mapped[TeamMember] = relationship(back_populates="affiliations")
    vendor: Mapped[Vendor] = relationship()


class Assignment(Base):
    __tablename__ = "assignments"
    __table_args__ = (
        CheckConstraint("end_date >= start_date", name="ck_assignments_valid_date_range"),
        CheckConstraint(
            "allocation_percentage >= 0 AND allocation_percentage <= 100",
            name="ck_assignments_percentage_range",
        ),
        CheckConstraint("length(trim(project_code)) > 0", name="ck_assignments_project_code_not_empty"),
        Index("ix_assignments_member_dates", "member_id", "start_date", "end_date"),
        Index("ix_assignments_vendor_id", "vendor_id"),
        Index("ix_assignments_assigned_squad_id", "assigned_squad_id"),
        Index("ix_assignments_executor_squad_id", "executor_squad_id"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    member_id: Mapped[str] = mapped_column(ForeignKey("team_members.id"), nullable=False)
    assigned_squad_id: Mapped[str] = mapped_column(ForeignKey("squads.id"), nullable=False)
    executor_squad_id: Mapped[str] = mapped_column(ForeignKey("squads.id"), nullable=False)
    vendor_id: Mapped[str | None] = mapped_column(ForeignKey("vendors.id"), nullable=True)
    member_resigned: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default=text("false"))
    project_code: Mapped[str] = mapped_column(String(160), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    allocation_percentage: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    member: Mapped[TeamMember] = relationship()
    assigned_squad: Mapped[Squad] = relationship(foreign_keys=[assigned_squad_id])
    executor_squad: Mapped[Squad] = relationship(foreign_keys=[executor_squad_id])
    vendor: Mapped[Vendor | None] = relationship()
