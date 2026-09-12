from datetime import date

import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db import Base
from app.models import MemberVendorAffiliation, ProfessionalRole, TeamMember, Vendor
from app.routes import (
    create_provider,
    deactivate_provider,
    get_provider,
    list_providers,
    update_provider,
)
from app.schemas import ProviderCreate, ProviderUpdate


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
        yield session
    Base.metadata.drop_all(engine)


def provider_payload(**overrides: object) -> dict[str, object]:
    value: dict[str, object] = {
        "name": "Proveedor Uno",
        "ruc": " ab123 ",
        "focal_point": " Ana Contacto ",
        "mobile": "999999999",
    }
    value.update(overrides)
    return value


def test_create_provider_normalizes_ruc_and_text(db: Session) -> None:
    provider = create_provider(ProviderCreate(**provider_payload()), db)

    assert provider.ruc == "AB123"
    assert provider.name == "Proveedor Uno"
    assert provider.focal_point == "Ana Contacto"
    assert provider.is_active is True


def test_provider_ruc_is_unique_case_insensitive(db: Session) -> None:
    create_provider(ProviderCreate(**provider_payload()), db)

    with pytest.raises(HTTPException) as error:
        create_provider(
            ProviderCreate(**provider_payload(name="Otro", ruc="ab123", focal_point="Otro Contacto")), db
        )

    assert error.value.status_code == 409
    assert db.query(Vendor).count() == 1


def test_provider_list_filters_and_detail_include_inactive(db: Session) -> None:
    active = create_provider(ProviderCreate(**provider_payload()), db)
    inactive = create_provider(
        ProviderCreate(**provider_payload(name="Proveedor Dos", ruc="CD456", focal_point="Luis Contacto")), db
    )
    deactivate_provider(inactive.id, db)

    assert [item.id for item in list_providers("active", db)] == [active.id]
    assert [item.id for item in list_providers("inactive", db)] == [inactive.id]
    assert get_provider(inactive.id, db).is_active is False


def test_provider_update_and_logical_delete_preserve_history(db: Session) -> None:
    provider = create_provider(ProviderCreate(**provider_payload()), db)
    db.add(ProfessionalRole(id="role-1", name="Data Engineer"))
    db.add(
        TeamMember(
            id="member-1",
            dni="12345678",
            first_name="Ana",
            paternal_surname="Pérez",
            email="ana@example.com",
            birth_date=date(1990, 1, 1),
            employment_type="TERCERIZADO",
            professional_role_id="role-1",
            seniority="MEDIUM",
        )
    )
    db.flush()
    db.add(
        MemberVendorAffiliation(
            member_id="member-1",
            vendor_id=provider.id,
            valid_from=date.today(),
        )
    )
    db.commit()

    updated = update_provider(
        provider.id,
        ProviderUpdate(name="Proveedor Actualizado", mobile=None, is_active=True),
        db,
    )
    assert updated.name == "Proveedor Actualizado"
    deleted = deactivate_provider(provider.id, db)
    assert deleted.is_active is False
    assert db.query(Vendor).filter_by(id=provider.id).one().is_active is False
    assert db.query(MemberVendorAffiliation).count() == 1


def test_provider_update_rejects_duplicate_ruc(db: Session) -> None:
    first = create_provider(ProviderCreate(**provider_payload()), db)
    second = create_provider(
        ProviderCreate(**provider_payload(name="Proveedor Dos", ruc="CD456", focal_point="Luis Contacto")), db
    )

    with pytest.raises(HTTPException) as error:
        update_provider(second.id, ProviderUpdate(ruc=first.ruc), db)

    assert error.value.status_code == 409
    assert db.get(Vendor, second.id).ruc == "CD456"
