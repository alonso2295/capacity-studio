import asyncio

import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.auth import require_chapter_lead
from app.db import Base
from app.models import Squad
from app.routes import create_squad, deactivate_squad, get_squad, list_squads, update_squad
from app.schemas import CurrentUser, SquadCreate, SquadUpdate


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


def squad_payload(**overrides: object) -> dict[str, object]:
    value: dict[str, object] = {
        "code": " data01 ",
        "name": " Data Platform ",
        "tribe": " Growth ",
        "product_owner_name": " Luis PO ",
    }
    value.update(overrides)
    return value


def test_squad_create_normalizes_code_and_optional_text(db: Session) -> None:
    user = CurrentUser(user_id="lead", role="Chapter Lead")

    response = create_squad(SquadCreate(**squad_payload()), user, db)

    assert response.code == "DATA01"
    assert response.name == "Data Platform"
    assert response.tribe == "Growth"
    assert response.product_owner_name == "Luis PO"
    assert response.is_active is True
    assert db.query(Squad).count() == 1


def test_squad_requires_valid_alphanumeric_code_and_name() -> None:
    with pytest.raises(ValueError, match="alfanuméricos"):
        SquadCreate(**squad_payload(code="DATA-01"))
    with pytest.raises(ValueError, match="nombre"):
        SquadCreate(**squad_payload(name="   "))


def test_squad_code_is_unique_case_insensitive(db: Session) -> None:
    user = CurrentUser(user_id="lead", role="Chapter Lead")
    create_squad(SquadCreate(**squad_payload()), user, db)

    with pytest.raises(HTTPException) as error:
        create_squad(SquadCreate(**squad_payload(code="data01", name="Otro")), user, db)

    assert error.value.status_code == 409
    assert db.query(Squad).count() == 1


def test_squad_list_defaults_to_active_and_detail_includes_inactive(db: Session) -> None:
    user = CurrentUser(user_id="lead", role="Chapter Lead")
    active = create_squad(SquadCreate(**squad_payload()), user, db)
    inactive = create_squad(SquadCreate(**squad_payload(code="DATA02", name="Legacy")), user, db)
    deactivate_squad(inactive.id, user, db)

    assert [item.id for item in list_squads("active", user, db)] == [active.id]
    assert [item.id for item in list_squads("inactive", user, db)] == [inactive.id]
    assert get_squad(inactive.id, user, db).is_active is False


def test_squad_update_preserves_id_and_rejects_duplicate_code(db: Session) -> None:
    user = CurrentUser(user_id="lead", role="Chapter Lead")
    first = create_squad(SquadCreate(**squad_payload()), user, db)
    second = create_squad(SquadCreate(**squad_payload(code="DATA02", name="Legacy")), user, db)

    updated = update_squad(first.id, SquadUpdate(name="Nuevo nombre", tribe=""), user, db)
    assert updated.id == first.id
    assert updated.name == "Nuevo nombre"
    assert updated.tribe is None

    with pytest.raises(HTTPException) as error:
        update_squad(second.id, SquadUpdate(code="data01"), user, db)
    assert error.value.status_code == 409
    assert db.get(Squad, second.id).code == "DATA02"


def test_squad_reactivation_preserves_id_and_code(db: Session) -> None:
    user = CurrentUser(user_id="lead", role="Chapter Lead")
    squad = create_squad(SquadCreate(**squad_payload()), user, db)
    deactivate_squad(squad.id, user, db)

    reactivated = update_squad(squad.id, SquadUpdate(is_active=True), user, db)

    assert reactivated.id == squad.id
    assert reactivated.code == "DATA01"
    assert reactivated.is_active is True


def test_non_chapter_lead_cannot_manage_squads() -> None:
    with pytest.raises(HTTPException) as error:
        asyncio.run(require_chapter_lead(CurrentUser(user_id="member", role="Miembro de Equipo")))
    assert error.value.status_code == 403
