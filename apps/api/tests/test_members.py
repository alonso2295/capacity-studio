import asyncio
from datetime import UTC, datetime, timedelta

import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.auth import require_chapter_lead
from app.db import Base
from app.models import MemberVendorAffiliation, ProfessionalRole, TeamMember, Vendor
from app.routes import (
    create_member,
    deactivate_member,
    get_member,
    list_members,
    list_professional_roles,
    list_vendors,
    update_member,
)
from app.schemas import CurrentUser, MemberCreate, MemberUpdate


@pytest.fixture()
def db() -> Session:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    with session_factory() as session:
        session.add_all(
            [
                ProfessionalRole(id="role-1", name="Data Engineer"),
                Vendor(id="vendor-1", name="Proveedor Uno", ruc="LEGACY-1", focal_point="Ana Contacto"),
            ]
        )
        session.commit()
        yield session
    Base.metadata.drop_all(engine)


def payload(**overrides: object) -> dict[str, object]:
    value: dict[str, object] = {
        "dni": "12345678",
        "first_name": "Ana",
        "paternal_surname": "Pérez",
        "maternal_surname": "Gómez",
        "email": "ANA@example.com",
        "mobile": "999999999",
        "birth_date": "1990-01-01",
        "employment_type": "PLANILLA",
        "professional_role_id": "role-1",
        "seniority": "MEDIUM",
    }
    value.update(overrides)
    return value


def test_chapter_lead_creates_payroll_member(db: Session) -> None:
    response = create_member(MemberCreate(**payload()), CurrentUser(user_id="lead", role="Chapter Lead"), db)
    assert response.employment_type.value == "PLANILLA"
    assert response.email == "ana@example.com"
    assert response.vendor_id is None
    assert db.query(TeamMember).count() == 1
    assert db.query(MemberVendorAffiliation).count() == 0


def test_chapter_lead_creates_contractor_affiliation(db: Session) -> None:
    response = create_member(
        MemberCreate(
            **payload(
                dni="87654321",
                email="contractor@example.com",
                employment_type="TERCERIZADO",
                vendor_id="vendor-1",
            )
        ),
        CurrentUser(user_id="lead", role="Chapter Lead"),
        db,
    )
    assert response.vendor_id == "vendor-1"
    assert db.query(MemberVendorAffiliation).count() == 1


def test_catalogs_return_active_items_only(db: Session) -> None:
    db.add_all(
        [
            ProfessionalRole(id="role-inactive", name="Legacy Role", is_active=False),
            Vendor(
                id="vendor-inactive",
                name="Proveedor Inactivo",
                ruc="LEGACY-INACTIVE",
                focal_point="Contacto Inactivo",
                is_active=False,
            ),
        ]
    )
    db.commit()
    user = CurrentUser(user_id="lead", role="Chapter Lead")
    assert [item.name for item in list_professional_roles(user, db)] == ["Data Engineer"]
    assert [item.name for item in list_vendors(user, db)] == ["Proveedor Uno"]


def test_duplicate_dni_is_rejected_without_overwriting(db: Session) -> None:
    user = CurrentUser(user_id="lead", role="Chapter Lead")
    create_member(MemberCreate(**payload()), user, db)
    with pytest.raises(HTTPException) as error:
        create_member(MemberCreate(**payload(email="different@example.com")), user, db)
    assert error.value.status_code == 409
    assert db.query(TeamMember).count() == 1


def test_contractor_requires_active_vendor() -> None:
    with pytest.raises(ValueError, match="proveedor"):
        MemberCreate(**payload(dni="87654321", email="contractor@example.com", employment_type="TERCERIZADO"))


def test_future_birth_date_is_rejected() -> None:
    future = datetime.now(UTC).date() + timedelta(days=1)
    with pytest.raises(ValueError, match="futura"):
        MemberCreate(**payload(birth_date=future.isoformat()))


def test_non_chapter_lead_cannot_create_member() -> None:
    with pytest.raises(HTTPException) as error:
        asyncio.run(require_chapter_lead(CurrentUser(user_id="member", role="Miembro de Equipo")))
    assert error.value.status_code == 403


def test_member_list_defaults_to_active_and_detail_includes_history(db: Session) -> None:
    user = CurrentUser(user_id="lead", role="Chapter Lead")
    active = create_member(MemberCreate(**payload()), user, db)
    inactive = create_member(MemberCreate(**payload(dni="87654321", email="inactive@example.com")), user, db)
    deactivate_member(inactive.id, user, db)

    assert [item.id for item in list_members("active", user, db).items] == [active.id]
    assert [item.id for item in list_members("inactive", user, db).items] == [inactive.id]
    detail = get_member(active.id, user, db)
    assert detail.professional_role_name == "Data Engineer"
    assert detail.affiliations == []


def test_member_list_filters_sorts_and_paginates(db: Session) -> None:
    db.add_all(
        [
            ProfessionalRole(id="role-2", name="Data Architect"),
            Vendor(id="vendor-2", name="Proveedor Dos", ruc="LEGACY-2", focal_point="Luis Contacto"),
        ]
    )
    db.commit()
    user = CurrentUser(user_id="lead", role="Chapter Lead")
    create_member(MemberCreate(**payload()), user, db)
    create_member(
        MemberCreate(
            **payload(
                dni="87654321",
                first_name="Bruno",
                email="bruno@example.com",
                employment_type="TERCERIZADO",
                vendor_id="vendor-1",
                professional_role_id="role-2",
            )
        ),
        user,
        db,
    )
    create_member(
        MemberCreate(
            **payload(
                dni="11112222",
                first_name="Carla",
                email="carla@example.com",
                employment_type="TERCERIZADO",
                vendor_id="vendor-2",
                professional_role_id="role-2",
            )
        ),
        user,
        db,
    )

    page = list_members("active", user, db, page=1, page_size=2, sort_by="dni", sort_direction="desc")
    assert page.total == 3
    assert page.total_pages == 2
    assert page.page_size == 2
    assert [item.dni for item in page.items] == ["87654321", "12345678"]

    filtered = list_members(
        "active",
        user,
        db,
        search="bruno",
        vendor_id="vendor-1",
        professional_role_id="role-2",
    )
    assert filtered.total == 1
    assert filtered.items[0].first_name == "Bruno"

    filtered_by_dni = list_members("active", user, db, search="1111")
    assert [item.first_name for item in filtered_by_dni.items] == ["Carla"]

    with pytest.raises(HTTPException) as error:
        list_members("active", user, db, page_size=101)
    assert error.value.status_code == 422


def test_member_update_changes_vendor_without_overwriting_history(db: Session) -> None:
    db.add(Vendor(id="vendor-2", name="Proveedor Dos", ruc="LEGACY-2", focal_point="Luis Contacto"))
    db.commit()
    user = CurrentUser(user_id="lead", role="Chapter Lead")
    member = create_member(
        MemberCreate(**payload(employment_type="TERCERIZADO", vendor_id="vendor-1")), user, db
    )

    updated = update_member(
        member.id,
        MemberUpdate(first_name="  Carla  ", vendor_id="vendor-2"),
        user,
        db,
    )

    assert updated.first_name == "Carla"
    assert updated.vendor_id == "vendor-2"
    assert len(updated.affiliations) == 2
    assert updated.affiliations[0].vendor_id == "vendor-2"
    assert updated.affiliations[1].vendor_id == "vendor-1"
    assert updated.affiliations[1].valid_until is not None


def test_member_update_rejects_duplicate_email_without_overwriting(db: Session) -> None:
    user = CurrentUser(user_id="lead", role="Chapter Lead")
    first = create_member(MemberCreate(**payload()), user, db)
    second = create_member(MemberCreate(**payload(dni="87654321", email="second@example.com")), user, db)

    with pytest.raises(HTTPException) as error:
        update_member(second.id, MemberUpdate(email=first.email), user, db)

    assert error.value.status_code == 409
    assert db.get(TeamMember, second.id).email == "second@example.com"


def test_member_deactivation_and_reactivation_preserve_uuid(db: Session) -> None:
    user = CurrentUser(user_id="lead", role="Chapter Lead")
    member = create_member(MemberCreate(**payload()), user, db)

    inactive = deactivate_member(member.id, user, db)
    assert inactive.id == member.id
    assert inactive.is_active is False
    assert db.get(TeamMember, member.id) is not None

    active = update_member(member.id, MemberUpdate(is_active=True), user, db)
    assert active.id == member.id
    assert active.is_active is True
