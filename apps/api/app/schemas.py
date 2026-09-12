from datetime import date
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from .models import EmploymentType, Seniority


class CatalogItem(BaseModel):
    id: str
    name: str

    model_config = ConfigDict(from_attributes=True)


def _trim_required(value: str, label: str) -> str:
    normalized = value.strip()
    if not normalized:
        raise ValueError(f"{label} es obligatorio")
    return normalized


class ProviderCreate(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    ruc: str = Field(min_length=1, max_length=64)
    focal_point: str = Field(min_length=1, max_length=160)
    mobile: str | None = Field(default=None, max_length=32)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        return _trim_required(value, "La razón social")

    @field_validator("focal_point")
    @classmethod
    def normalize_focal_point(cls, value: str) -> str:
        return _trim_required(value, "El focal point")

    @field_validator("ruc")
    @classmethod
    def normalize_ruc(cls, value: str) -> str:
        normalized = value.strip().upper()
        if not normalized or not normalized.isalnum():
            raise ValueError("El RUC debe contener únicamente caracteres alfanuméricos")
        return normalized

    @field_validator("mobile")
    @classmethod
    def normalize_mobile(cls, value: str | None) -> str | None:
        normalized = value.strip() if value is not None else None
        return normalized or None


class ProviderUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=160)
    ruc: str | None = Field(default=None, max_length=64)
    focal_point: str | None = Field(default=None, max_length=160)
    mobile: str | None = Field(default=None, max_length=32)
    is_active: bool | None = None

    @field_validator("name")
    @classmethod
    def normalize_optional_name(cls, value: str | None) -> str | None:
        return _trim_required(value, "La razón social") if value is not None else None

    @field_validator("focal_point")
    @classmethod
    def normalize_optional_focal_point(cls, value: str | None) -> str | None:
        return _trim_required(value, "El focal point") if value is not None else None

    @field_validator("ruc")
    @classmethod
    def normalize_optional_ruc(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip().upper()
        if not normalized or not normalized.isalnum():
            raise ValueError("El RUC debe contener únicamente caracteres alfanuméricos")
        return normalized

    @field_validator("mobile")
    @classmethod
    def normalize_optional_mobile(cls, value: str | None) -> str | None:
        normalized = value.strip() if value is not None else None
        return normalized or None

    @model_validator(mode="after")
    def require_update_value(self) -> "ProviderUpdate":
        if all(value is None for value in (self.name, self.ruc, self.focal_point, self.mobile, self.is_active)):
            raise ValueError("Indica al menos un campo para actualizar")
        return self


class ProviderResponse(BaseModel):
    id: str
    name: str
    ruc: str
    focal_point: str
    mobile: str | None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


ProviderStatus = Literal["active", "inactive", "all"]
MemberStatus = Literal["active", "inactive", "all"]
SquadStatus = Literal["active", "inactive", "all"]


class SquadCreate(BaseModel):
    code: str = Field(min_length=1, max_length=64)
    name: str = Field(min_length=1, max_length=160)
    tribe: str | None = Field(default=None, max_length=160)
    product_owner_name: str | None = Field(default=None, max_length=160)

    @field_validator("code")
    @classmethod
    def normalize_code(cls, value: str) -> str:
        normalized = value.strip().upper()
        if not normalized or not normalized.isalnum():
            raise ValueError("El código solo acepta caracteres alfanuméricos")
        return normalized

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        return _trim_required(value, "El nombre del Squad")

    @field_validator("tribe", "product_owner_name")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        normalized = value.strip() if value is not None else None
        return normalized or None


class SquadUpdate(BaseModel):
    code: str | None = Field(default=None, max_length=64)
    name: str | None = Field(default=None, max_length=160)
    tribe: str | None = Field(default=None, max_length=160)
    product_owner_name: str | None = Field(default=None, max_length=160)
    is_active: bool | None = None

    @field_validator("code")
    @classmethod
    def normalize_optional_code(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip().upper()
        if not normalized or not normalized.isalnum():
            raise ValueError("El código solo acepta caracteres alfanuméricos")
        return normalized

    @field_validator("name")
    @classmethod
    def normalize_optional_name(cls, value: str | None) -> str | None:
        return _trim_required(value, "El nombre del Squad") if value is not None else None

    @field_validator("tribe", "product_owner_name")
    @classmethod
    def normalize_optional_fields(cls, value: str | None) -> str | None:
        normalized = value.strip() if value is not None else None
        return normalized or None

    @model_validator(mode="after")
    def require_update_value(self) -> "SquadUpdate":
        if all(value is None for value in self.model_dump().values()):
            raise ValueError("Indica al menos un campo para actualizar")
        return self


class SquadResponse(BaseModel):
    id: str
    code: str
    name: str
    tribe: str | None
    product_owner_name: str | None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class MemberCreate(BaseModel):
    dni: str = Field(min_length=1, max_length=32)
    first_name: str = Field(min_length=1, max_length=120)
    paternal_surname: str = Field(min_length=1, max_length=120)
    maternal_surname: str | None = Field(default=None, max_length=120)
    email: str = Field(min_length=3, max_length=254)
    mobile: str | None = Field(default=None, max_length=32)
    birth_date: date
    employment_type: EmploymentType
    vendor_id: str | None = None
    professional_role_id: str
    seniority: Seniority

    @field_validator("dni")
    @classmethod
    def validate_dni(cls, value: str) -> str:
        value = value.strip()
        if not value.isdigit() or len(value) != 8:
            raise ValueError("El DNI debe contener 8 dígitos")
        return value

    @field_validator("first_name", "paternal_surname", "maternal_surname", "mobile")
    @classmethod
    def trim_text(cls, value: str | None) -> str | None:
        return value.strip() if value is not None else None

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        value = value.strip().lower()
        if "@" not in value or value.startswith("@") or value.endswith("@"):
            raise ValueError("Ingresa un correo electrónico válido")
        return value

    @field_validator("birth_date")
    @classmethod
    def validate_birth_date(cls, value: date) -> date:
        if value > date.today():
            raise ValueError("La fecha de nacimiento no puede ser futura")
        return value

    @model_validator(mode="after")
    def validate_vendor(self) -> "MemberCreate":
        if self.employment_type == EmploymentType.CONTRACTOR and not self.vendor_id:
            raise ValueError("El proveedor es obligatorio para miembros tercerizados")
        if self.employment_type == EmploymentType.PAYROLL:
            self.vendor_id = None
        return self


class MemberUpdate(BaseModel):
    dni: str | None = Field(default=None, max_length=32)
    first_name: str | None = Field(default=None, max_length=120)
    paternal_surname: str | None = Field(default=None, max_length=120)
    maternal_surname: str | None = Field(default=None, max_length=120)
    email: str | None = Field(default=None, max_length=254)
    mobile: str | None = Field(default=None, max_length=32)
    birth_date: date | None = None
    employment_type: EmploymentType | None = None
    vendor_id: str | None = None
    professional_role_id: str | None = None
    seniority: Seniority | None = None
    is_active: bool | None = None

    @field_validator("dni")
    @classmethod
    def validate_optional_dni(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value.isdigit() or len(value) != 8:
            raise ValueError("El DNI debe contener 8 dígitos")
        return value

    @field_validator("first_name", "paternal_surname", "maternal_surname", "mobile")
    @classmethod
    def trim_optional_text(cls, value: str | None) -> str | None:
        return value.strip() if value is not None else None

    @field_validator("email")
    @classmethod
    def normalize_optional_email(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip().lower()
        if "@" not in value or value.startswith("@") or value.endswith("@"):
            raise ValueError("Ingresa un correo electrónico válido")
        return value

    @field_validator("birth_date")
    @classmethod
    def validate_optional_birth_date(cls, value: date | None) -> date | None:
        if value is not None and value > date.today():
            raise ValueError("La fecha de nacimiento no puede ser futura")
        return value

    @model_validator(mode="after")
    def require_update_value(self) -> "MemberUpdate":
        if all(value is None for value in self.model_dump().values()):
            raise ValueError("Indica al menos un campo para actualizar")
        return self


class MemberAffiliationResponse(BaseModel):
    id: str
    vendor_id: str
    vendor_name: str
    valid_from: date
    valid_until: date | None


class MemberResponse(BaseModel):
    id: str
    dni: str
    first_name: str
    paternal_surname: str
    maternal_surname: str | None
    email: str
    mobile: str | None
    birth_date: date
    employment_type: EmploymentType
    vendor_id: str | None
    vendor_name: str | None
    professional_role_id: str
    professional_role_name: str
    seniority: Seniority
    is_active: bool
    affiliations: list[MemberAffiliationResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


MemberSortBy = Literal[
    "member_full_name",
    "dni",
    "employment_type",
    "vendor_name",
    "professional_role_name",
    "seniority",
    "is_active",
]
MemberSortDirection = Literal["asc", "desc"]


class MemberPage(BaseModel):
    items: list[MemberResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class AssignmentCandidate(BaseModel):
    id: str
    dni: str
    full_name: str
    vendor_id: str | None
    vendor_name: str | None
    professional_role_id: str
    professional_role_name: str
    seniority: Seniority


def _normalize_project_code(value: str) -> str:
    normalized = value.strip()
    if not normalized:
        raise ValueError("El código de proyecto es obligatorio")
    if any(ord(character) < 32 or ord(character) == 127 for character in normalized):
        raise ValueError("El código de proyecto contiene caracteres no válidos")
    return normalized


class AssignmentCreate(BaseModel):
    member_id: str = Field(min_length=1, max_length=36)
    assigned_squad_id: str = Field(min_length=1, max_length=36)
    executor_squad_id: str = Field(min_length=1, max_length=36)
    member_resigned: bool = False
    project_code: str = Field(min_length=1, max_length=160)
    start_date: date
    end_date: date
    allocation_percentage: Decimal = Field(ge=0, le=100, max_digits=5, decimal_places=2)

    @field_validator("project_code")
    @classmethod
    def normalize_project_code(cls, value: str) -> str:
        return _normalize_project_code(value)

    @model_validator(mode="after")
    def validate_date_range(self) -> "AssignmentCreate":
        if self.end_date < self.start_date:
            raise ValueError("La fecha fin no puede ser anterior a la fecha de inicio")
        return self


class AssignmentUpdate(BaseModel):
    assigned_squad_id: str | None = Field(default=None, min_length=1, max_length=36)
    executor_squad_id: str | None = Field(default=None, min_length=1, max_length=36)
    member_resigned: bool | None = None
    project_code: str | None = Field(default=None, min_length=1, max_length=160)
    start_date: date | None = None
    end_date: date | None = None
    allocation_percentage: Decimal | None = Field(default=None, ge=0, le=100, max_digits=5, decimal_places=2)

    @field_validator("project_code")
    @classmethod
    def normalize_optional_project_code(cls, value: str | None) -> str | None:
        return _normalize_project_code(value) if value is not None else None

    @model_validator(mode="after")
    def validate_update(self) -> "AssignmentUpdate":
        if all(value is None for value in self.model_dump().values()):
            raise ValueError("Indica al menos un campo para actualizar")
        if self.start_date is not None and self.end_date is not None and self.end_date < self.start_date:
            raise ValueError("La fecha fin no puede ser anterior a la fecha de inicio")
        return self


class AssignmentResponse(BaseModel):
    id: str
    member_id: str
    member_dni: str
    member_full_name: str
    vendor_id: str | None
    vendor_name: str | None
    professional_role_id: str
    professional_role_name: str
    seniority: Seniority
    assigned_squad_id: str
    assigned_squad_code: str
    assigned_squad_name: str
    executor_squad_id: str
    executor_squad_code: str
    executor_squad_name: str
    member_resigned: bool
    project_code: str
    start_date: date
    end_date: date
    allocation_percentage: Decimal


AssignmentSortBy = Literal[
    "member_full_name",
    "member_dni",
    "vendor_name",
    "member_resigned",
    "professional_role_name",
    "assigned_squad_name",
    "executor_squad_name",
    "project_code",
    "start_date",
    "end_date",
    "allocation_percentage",
]
AssignmentSortDirection = Literal["asc", "desc"]


class AssignmentPage(BaseModel):
    items: list[AssignmentResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class MetricsPeriod(BaseModel):
    year: int
    quarter: int
    start_date: date
    end_date: date


class MetricsKpis(BaseModel):
    total_squads: int
    assigned_members: int
    unassigned_active_members: int
    resigned_members: int


class MetricsRoleCount(BaseModel):
    role_id: str
    role_name: str
    member_count: int


class MetricsExecutorSquad(BaseModel):
    squad_id: str
    squad_name: str
    roles: list[MetricsRoleCount]


class MetricsVendorRoleCount(BaseModel):
    vendor_id: str | None
    vendor_name: str
    professional_role_id: str
    professional_role_name: str
    member_count: int


class MetricsUnassignedMember(BaseModel):
    id: str
    full_name: str
    dni: str


class MetricsAssignmentCard(BaseModel):
    id: str
    member_full_name: str
    professional_role_name: str
    vendor_id: str | None
    vendor_name: str
    project_code: str
    allocation_percentage: Decimal
    assigned_squad_id: str
    assigned_squad_name: str
    executor_squad_id: str
    executor_squad_name: str


class MetricsAssignmentFilterOptions(BaseModel):
    providers: list[CatalogItem]
    roles: list[CatalogItem]
    squads: list[CatalogItem]


class MetricsDashboardResponse(BaseModel):
    period: MetricsPeriod
    kpis: MetricsKpis
    role_distribution_by_executor_squad: list[MetricsExecutorSquad]
    unassigned_members: list[MetricsUnassignedMember]
    members_by_vendor_and_role: list[MetricsVendorRoleCount]
    assignment_filter_options: MetricsAssignmentFilterOptions
    assignment_cards: list[MetricsAssignmentCard]


class CurrentUser(BaseModel):
    user_id: str
    role: str
