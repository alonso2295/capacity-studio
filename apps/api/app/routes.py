import unicodedata
from datetime import UTC, date, datetime, timedelta
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, aliased, selectinload

from .auth import get_current_user, require_chapter_lead
from .db import get_db
from .models import (
    Assignment,
    EmploymentType,
    MemberVendorAffiliation,
    ProfessionalRole,
    Seniority,
    Squad,
    TeamMember,
    Vendor,
)
from .schemas import (
    AssignmentCandidate,
    AssignmentCreate,
    AssignmentPage,
    AssignmentResponse,
    AssignmentSortBy,
    AssignmentSortDirection,
    AssignmentUpdate,
    CatalogItem,
    CurrentUser,
    MemberAffiliationResponse,
    MemberCreate,
    MemberPage,
    MemberResponse,
    MemberSortBy,
    MemberSortDirection,
    MemberStatus,
    MemberUpdate,
    MetricsAssignmentCard,
    MetricsAssignmentFilterOptions,
    MetricsDashboardResponse,
    MetricsExecutorSquad,
    MetricsKpis,
    MetricsPeriod,
    MetricsRoleCount,
    MetricsUnassignedMember,
    MetricsVendorRoleCount,
    ProviderCreate,
    ProviderResponse,
    ProviderStatus,
    ProviderUpdate,
    SquadCreate,
    SquadResponse,
    SquadStatus,
    SquadUpdate,
)

router = APIRouter(prefix="/api/v1")


def _current_affiliation(member: TeamMember) -> MemberVendorAffiliation | None:
    current = [affiliation for affiliation in member.affiliations if affiliation.valid_until is None]
    return max(current, key=lambda affiliation: affiliation.valid_from, default=None)


def _member_response(member: TeamMember) -> MemberResponse:
    affiliations = sorted(member.affiliations, key=lambda affiliation: affiliation.valid_from, reverse=True)
    current = _current_affiliation(member)
    return MemberResponse(
        id=member.id,
        dni=member.dni,
        first_name=member.first_name,
        paternal_surname=member.paternal_surname,
        maternal_surname=member.maternal_surname,
        email=member.email,
        mobile=member.mobile,
        birth_date=member.birth_date,
        employment_type=EmploymentType(member.employment_type),
        vendor_id=current.vendor_id if current else None,
        vendor_name=current.vendor.name if current else None,
        professional_role_id=member.professional_role_id,
        professional_role_name=member.professional_role.name,
        seniority=Seniority(member.seniority),
        is_active=member.is_active,
        affiliations=[
            MemberAffiliationResponse(
                id=affiliation.id,
                vendor_id=affiliation.vendor_id,
                vendor_name=affiliation.vendor.name,
                valid_from=affiliation.valid_from,
                valid_until=affiliation.valid_until,
            )
            for affiliation in affiliations
        ],
    )


def _member_full_name(member: TeamMember) -> str:
    return " ".join(
        value for value in (member.first_name, member.paternal_surname, member.maternal_surname) if value
    )


def _search_key(value: str) -> str:
    decomposed = unicodedata.normalize("NFKD", value)
    return "".join(character for character in decomposed if not unicodedata.combining(character)).lower()


def _assignment_candidate(member: TeamMember) -> AssignmentCandidate:
    current = _current_affiliation(member)
    return AssignmentCandidate(
        id=member.id,
        dni=member.dni,
        full_name=_member_full_name(member),
        vendor_id=current.vendor_id if current else None,
        vendor_name=current.vendor.name if current else None,
        professional_role_id=member.professional_role_id,
        professional_role_name=member.professional_role.name,
        seniority=Seniority(member.seniority),
    )


def _assignment_response(assignment: Assignment) -> AssignmentResponse:
    return AssignmentResponse(
        id=assignment.id,
        member_id=assignment.member_id,
        member_dni=assignment.member.dni,
        member_full_name=_member_full_name(assignment.member),
        vendor_id=assignment.vendor_id,
        vendor_name=assignment.vendor.name if assignment.vendor else None,
        professional_role_id=assignment.member.professional_role_id,
        professional_role_name=assignment.member.professional_role.name,
        seniority=Seniority(assignment.member.seniority),
        assigned_squad_id=assignment.assigned_squad_id,
        assigned_squad_code=assignment.assigned_squad.code,
        assigned_squad_name=assignment.assigned_squad.name,
        executor_squad_id=assignment.executor_squad_id,
        executor_squad_code=assignment.executor_squad.code,
        executor_squad_name=assignment.executor_squad.name,
        member_resigned=assignment.member_resigned,
        project_code=assignment.project_code,
        start_date=assignment.start_date,
        end_date=assignment.end_date,
        allocation_percentage=assignment.allocation_percentage,
    )


def _assignment_options():
    return (
        selectinload(Assignment.member).selectinload(TeamMember.professional_role),
        selectinload(Assignment.assigned_squad),
        selectinload(Assignment.executor_squad),
        selectinload(Assignment.vendor),
    )


def _quarter_bounds(year: int, quarter: int) -> tuple[date, date]:
    if year < 1900 or year > 2100:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="El año no es válido")
    if quarter not in range(1, 5):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="El trimestre debe estar entre 1 y 4")
    first_month = (quarter - 1) * 3 + 1
    start_date = date(year, first_month, 1)
    next_quarter = date(year + 1, 1, 1) if quarter == 4 else date(year, first_month + 3, 1)
    return start_date, next_quarter - timedelta(days=1)


def _metrics_role_count(role: ProfessionalRole, members: set[str]) -> MetricsRoleCount:
    return MetricsRoleCount(role_id=role.id, role_name=role.name, member_count=len(members))


def _lock_member(db: Session, member_id: str) -> TeamMember:
    member = db.scalar(select(TeamMember).where(TeamMember.id == member_id).with_for_update())
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El miembro no existe")
    if not member.is_active:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="El miembro no está activo")
    return member


def _active_squad(db: Session, squad_id: str) -> Squad:
    squad = db.get(Squad, squad_id)
    if not squad:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El Squad no existe")
    if not squad.is_active:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="El Squad no está activo")
    return squad


def _capacity_conflict_date(
    existing: list[Assignment],
    start_date: date,
    end_date: date,
    allocation_percentage: Decimal,
) -> date | None:
    events: dict[date, Decimal] = {}
    ranges = [(item.start_date, item.end_date, item.allocation_percentage) for item in existing]
    ranges.append((start_date, end_date, allocation_percentage))
    for range_start, range_end, percentage in ranges:
        events[range_start] = events.get(range_start, Decimal(0)) + percentage
        next_day = range_end + timedelta(days=1)
        events[next_day] = events.get(next_day, Decimal(0)) - percentage

    running = Decimal(0)
    for event_date in sorted(events):
        running += events[event_date]
        if running > Decimal(100):
            return event_date
    return None


def _validate_capacity(
    db: Session,
    member_id: str,
    start_date: date,
    end_date: date,
    allocation_percentage: Decimal,
    excluded_id: str | None = None,
) -> None:
    query = select(Assignment).where(
        Assignment.member_id == member_id,
        Assignment.start_date <= end_date,
        Assignment.end_date >= start_date,
    )
    if excluded_id:
        query = query.where(Assignment.id != excluded_id)
    existing = list(db.scalars(query.with_for_update()))
    conflict_date = _capacity_conflict_date(existing, start_date, end_date, allocation_percentage)
    if conflict_date:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"La capacidad del miembro supera el 100% el {conflict_date.isoformat()}",
        )


@router.get("/assignments/candidates", response_model=list[AssignmentCandidate])
def list_assignment_candidates(
    search: str = Query(default="", max_length=120),
    _: CurrentUser = Depends(require_chapter_lead),
    db: Session = Depends(get_db),
) -> list[AssignmentCandidate]:
    query = (
        select(TeamMember)
        .where(TeamMember.is_active)
        .options(
            selectinload(TeamMember.professional_role),
            selectinload(TeamMember.affiliations).selectinload(MemberVendorAffiliation.vendor),
        )
        .order_by(TeamMember.paternal_surname, TeamMember.first_name)
    )
    normalized_search = _search_key(search.strip())
    candidates = [_assignment_candidate(member) for member in db.scalars(query)]
    if not normalized_search:
        return candidates
    return [
        candidate
        for candidate in candidates
        if normalized_search in _search_key(candidate.dni)
        or normalized_search in _search_key(candidate.full_name)
    ]


@router.get("/assignments", response_model=AssignmentPage)
def list_assignments(
    search: str = Query(default="", max_length=120),
    vendor_id: str | None = Query(default=None, max_length=36),
    professional_role_id: str | None = Query(default=None, max_length=36),
    assigned_squad_id: str | None = Query(default=None, max_length=36),
    _: CurrentUser = Depends(require_chapter_lead),
    db: Session = Depends(get_db),
    start_date: date | None = None,
    end_date: date | None = None,
    member_resigned: bool | None = None,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    sort_by: AssignmentSortBy = "start_date",
    sort_direction: AssignmentSortDirection = "desc",
) -> AssignmentPage:
    if page < 1 or page_size < 1 or page_size > 100:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Los parámetros de paginación no son válidos")
    assigned_squad = aliased(Squad)
    executor_squad = aliased(Squad)
    query = (
        select(Assignment)
        .join(TeamMember, Assignment.member_id == TeamMember.id)
        .join(ProfessionalRole, TeamMember.professional_role_id == ProfessionalRole.id)
        .join(assigned_squad, Assignment.assigned_squad_id == assigned_squad.id)
        .join(executor_squad, Assignment.executor_squad_id == executor_squad.id)
        .outerjoin(Vendor, Assignment.vendor_id == Vendor.id)
        .options(*_assignment_options())
    )
    if vendor_id:
        query = query.where(Assignment.vendor_id == vendor_id)
    if professional_role_id:
        query = query.where(TeamMember.professional_role_id == professional_role_id)
    if assigned_squad_id:
        query = query.where(Assignment.assigned_squad_id == assigned_squad_id)
    if start_date and end_date and end_date < start_date:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="La fecha fin del filtro no puede ser anterior a la fecha de inicio",
        )
    if start_date:
        query = query.where(Assignment.end_date >= start_date)
    if end_date:
        query = query.where(Assignment.start_date <= end_date)
    if member_resigned is not None:
        query = query.where(Assignment.member_resigned == member_resigned)
    normalized_search = _search_key(search.strip())
    if normalized_search:
        search_pattern = f"%{normalized_search}%"
        full_name = TeamMember.first_name + " " + TeamMember.paternal_surname + " " + func.coalesce(TeamMember.maternal_surname, "")
        query = query.where(
            func.lower(TeamMember.dni).like(search_pattern)
            | func.lower(full_name).like(search_pattern)
        )

    sort_expressions = {
        "member_full_name": TeamMember.first_name + " " + TeamMember.paternal_surname + " " + func.coalesce(TeamMember.maternal_surname, ""),
        "member_dni": TeamMember.dni,
        "vendor_name": func.coalesce(Vendor.name, "Planilla"),
        "member_resigned": Assignment.member_resigned,
        "professional_role_name": ProfessionalRole.name,
        "assigned_squad_name": assigned_squad.name,
        "executor_squad_name": executor_squad.name,
        "project_code": Assignment.project_code,
        "start_date": Assignment.start_date,
        "end_date": Assignment.end_date,
        "allocation_percentage": Assignment.allocation_percentage,
    }
    if sort_by not in sort_expressions or sort_direction not in ("asc", "desc"):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Los parámetros de ordenamiento no son válidos")
    sort_expression = sort_expressions[sort_by]
    ordered_expression = sort_expression.asc() if sort_direction == "asc" else sort_expression.desc()
    total = db.scalar(select(func.count()).select_from(query.order_by(None).subquery())) or 0
    total_pages = (total + page_size - 1) // page_size
    assignments = list(
        db.scalars(
            query.order_by(ordered_expression, Assignment.id.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
    )
    return AssignmentPage(
        items=[_assignment_response(assignment) for assignment in assignments],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/metrics/dashboard", response_model=MetricsDashboardResponse)
def get_metrics_dashboard(
    year: int = Query(..., ge=1900, le=2100),
    quarter: int = Query(..., ge=1, le=4),
    _: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
    vendor_id: str | None = None,
    professional_role_id: str | None = None,
    assigned_squad_id: list[str] | None = None,
) -> MetricsDashboardResponse:
    period_start, period_end = _quarter_bounds(year, quarter)
    all_assignments = list(
        db.scalars(select(Assignment).options(*_assignment_options())).unique()
    )
    active_members = list(
        db.scalars(
            select(TeamMember)
            .where(TeamMember.is_active)
            .options(selectinload(TeamMember.professional_role))
            .order_by(TeamMember.paternal_surname, TeamMember.first_name)
        )
    )
    roles = list(db.scalars(select(ProfessionalRole).order_by(ProfessionalRole.name)))
    role_by_id = {role.id: role for role in roles}
    for assignment in all_assignments:
        role_by_id.setdefault(assignment.member.professional_role.id, assignment.member.professional_role)
    active_squads = list(db.scalars(select(Squad).where(Squad.is_active).order_by(Squad.name)))
    active_squad_by_id = {squad.id: squad for squad in active_squads}
    active_vendors = list(db.scalars(select(Vendor).where(Vendor.is_active).order_by(Vendor.name)))

    def overlaps(assignment: Assignment, start_date: date, end_date: date) -> bool:
        return assignment.end_date >= start_date and assignment.start_date <= end_date

    selected_assignments = [
        assignment for assignment in all_assignments if overlaps(assignment, period_start, period_end)
    ]
    operational_selected = [
        assignment
        for assignment in selected_assignments
        if not assignment.member_resigned and assignment.member.is_active
    ]
    selected_squad_ids = set(assigned_squad_id or [])
    filtered_assignment_cards = [
        assignment
        for assignment in operational_selected
        if (vendor_id is None or assignment.vendor_id == vendor_id)
        and (professional_role_id is None or assignment.member.professional_role_id == professional_role_id)
        and (not selected_squad_ids or assignment.assigned_squad_id in selected_squad_ids)
    ]
    filtered_assignment_cards.sort(
        key=lambda assignment: (
            assignment.assigned_squad.name,
            _member_full_name(assignment.member),
            assignment.id,
        )
    )
    operational_member_ids = {assignment.member_id for assignment in operational_selected}
    resigned_member_ids = {
        assignment.member_id for assignment in selected_assignments if assignment.member_resigned
    }

    squad_role_members: dict[str, dict[str, set[str]]] = {}
    vendor_role_members: dict[tuple[str | None, str], set[str]] = {}
    for assignment in operational_selected:
        role_id = assignment.member.professional_role_id
        squad_members = squad_role_members.setdefault(assignment.executor_squad_id, {})
        squad_members.setdefault(role_id, set()).add(assignment.member_id)
        vendor_key = assignment.vendor_id, role_id
        vendor_role_members.setdefault(vendor_key, set()).add(assignment.member_id)

    role_distribution = []
    for squad_id, role_members in squad_role_members.items():
        squad = active_squad_by_id.get(squad_id)
        if not squad:
            continue
        role_distribution.append(
            MetricsExecutorSquad(
                squad_id=squad.id,
                squad_name=squad.name,
                roles=[
                    _metrics_role_count(role_by_id[role_id], member_ids)
                    for role_id, member_ids in sorted(
                        role_members.items(), key=lambda item: role_by_id[item[0]].name
                    )
                ],
            )
        )
    role_distribution.sort(key=lambda group: group.squad_name)

    vendor_distribution = []
    for (assignment_vendor_id, role_id), member_ids in sorted(
        vendor_role_members.items(),
        key=lambda item: ((item[0][0] or "Planilla"), role_by_id[item[0][1]].name),
    ):
        matching_assignment = next(
            assignment
            for assignment in operational_selected
            if assignment.vendor_id == assignment_vendor_id
            and assignment.member.professional_role_id == role_id
        )
        vendor_distribution.append(
            MetricsVendorRoleCount(
                vendor_id=assignment_vendor_id,
                vendor_name=matching_assignment.vendor.name if matching_assignment.vendor else "Planilla",
                professional_role_id=role_id,
                professional_role_name=role_by_id[role_id].name,
                member_count=len(member_ids),
            )
        )

    unassigned_members = [
        MetricsUnassignedMember(id=member.id, full_name=_member_full_name(member), dni=member.dni)
        for member in active_members
        if member.id not in operational_member_ids
    ]
    resigned_members = len(resigned_member_ids)

    assignment_cards = [
        MetricsAssignmentCard(
            id=assignment.id,
            member_full_name=_member_full_name(assignment.member),
            professional_role_name=assignment.member.professional_role.name,
            vendor_id=assignment.vendor_id,
            vendor_name=assignment.vendor.name if assignment.vendor else "Planilla",
            project_code=assignment.project_code,
            allocation_percentage=assignment.allocation_percentage,
            assigned_squad_id=assignment.assigned_squad_id,
            assigned_squad_name=assignment.assigned_squad.name,
            executor_squad_id=assignment.executor_squad_id,
            executor_squad_name=assignment.executor_squad.name,
        )
        for assignment in filtered_assignment_cards
    ]

    return MetricsDashboardResponse(
        period=MetricsPeriod(year=year, quarter=quarter, start_date=period_start, end_date=period_end),
        kpis=MetricsKpis(
            total_squads=len(role_distribution),
            assigned_members=len(operational_member_ids),
            unassigned_active_members=len(unassigned_members),
            resigned_members=resigned_members,
        ),
        role_distribution_by_executor_squad=role_distribution,
        unassigned_members=unassigned_members,
        members_by_vendor_and_role=vendor_distribution,
        assignment_filter_options=MetricsAssignmentFilterOptions(
            providers=[CatalogItem.model_validate(vendor) for vendor in active_vendors],
            roles=[CatalogItem.model_validate(role) for role in roles if role.is_active],
            squads=[CatalogItem.model_validate(squad) for squad in active_squads],
        ),
        assignment_cards=assignment_cards,
    )


@router.get("/assignments/{assignment_id}", response_model=AssignmentResponse)
def get_assignment(
    assignment_id: str,
    _: CurrentUser = Depends(require_chapter_lead),
    db: Session = Depends(get_db),
) -> AssignmentResponse:
    assignment = db.scalar(
        select(Assignment).where(Assignment.id == assignment_id).options(*_assignment_options())
    )
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La asignación no existe")
    return _assignment_response(assignment)


@router.post("/assignments", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED)
def create_assignment(
    payload: AssignmentCreate,
    _: CurrentUser = Depends(require_chapter_lead),
    db: Session = Depends(get_db),
) -> AssignmentResponse:
    member = _lock_member(db, payload.member_id)
    assigned_squad = _active_squad(db, payload.assigned_squad_id)
    executor_squad = _active_squad(db, payload.executor_squad_id)
    _validate_capacity(
        db,
        member.id,
        payload.start_date,
        payload.end_date,
        payload.allocation_percentage,
    )
    current_affiliation = _current_affiliation(member)
    assignment = Assignment(
        member_id=member.id,
        assigned_squad_id=assigned_squad.id,
        executor_squad_id=executor_squad.id,
        vendor_id=current_affiliation.vendor_id if current_affiliation else None,
        member_resigned=payload.member_resigned,
        project_code=payload.project_code,
        start_date=payload.start_date,
        end_date=payload.end_date,
        allocation_percentage=payload.allocation_percentage,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    db.add(assignment)
    try:
        db.commit()
        created_assignment = db.scalar(
            select(Assignment).where(Assignment.id == assignment.id).options(*_assignment_options())
        )
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="No se pudo guardar la asignación") from None
    if not created_assignment:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="No se pudo leer la asignación creada")
    return _assignment_response(created_assignment)


@router.patch("/assignments/{assignment_id}", response_model=AssignmentResponse)
def update_assignment(
    assignment_id: str,
    payload: AssignmentUpdate,
    _: CurrentUser = Depends(require_chapter_lead),
    db: Session = Depends(get_db),
) -> AssignmentResponse:
    assignment = db.get(Assignment, assignment_id)
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La asignación no existe")
    member = _lock_member(db, assignment.member_id)
    values = payload.model_dump(exclude_unset=True)
    next_assigned_squad_id = values.get("assigned_squad_id", assignment.assigned_squad_id)
    if next_assigned_squad_id != assignment.assigned_squad_id:
        _active_squad(db, next_assigned_squad_id)
    else:
        if not db.get(Squad, assignment.assigned_squad_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El Squad Asignado no existe")

    next_executor_squad_id = values.get("executor_squad_id", assignment.executor_squad_id)
    if next_executor_squad_id != assignment.executor_squad_id:
        _active_squad(db, next_executor_squad_id)
    else:
        if not db.get(Squad, assignment.executor_squad_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El Squad Ejecutor no existe")

    start_date = values.get("start_date", assignment.start_date)
    end_date = values.get("end_date", assignment.end_date)
    allocation_percentage = values.get("allocation_percentage", assignment.allocation_percentage)
    if end_date < start_date:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="La fecha fin no puede ser anterior a la fecha de inicio",
        )
    _validate_capacity(db, member.id, start_date, end_date, allocation_percentage, excluded_id=assignment.id)
    for field, value in values.items():
        setattr(assignment, field, value)
    assignment.updated_at = datetime.now(UTC)
    try:
        db.commit()
        updated = db.scalar(
            select(Assignment).where(Assignment.id == assignment.id).options(*_assignment_options())
        )
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="No se pudo actualizar la asignación") from None
    if not updated:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="No se pudo leer la asignación actualizada")
    return _assignment_response(updated)


@router.delete("/assignments/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_assignment(
    assignment_id: str,
    _: CurrentUser = Depends(require_chapter_lead),
    db: Session = Depends(get_db),
) -> None:
    assignment = db.get(Assignment, assignment_id)
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La asignación no existe")
    db.delete(assignment)
    db.commit()


@router.get("/squads", response_model=list[SquadResponse])
def list_squads(
    squad_status: SquadStatus = Query(default="active", alias="status"),
    _: CurrentUser = Depends(require_chapter_lead),
    db: Session = Depends(get_db),
) -> list[Squad]:
    query = select(Squad).order_by(Squad.name, Squad.code)
    if squad_status == "active":
        query = query.where(Squad.is_active)
    elif squad_status == "inactive":
        query = query.where(~Squad.is_active)
    return list(db.scalars(query))


@router.get("/squads/{squad_id}", response_model=SquadResponse)
def get_squad(
    squad_id: str,
    _: CurrentUser = Depends(require_chapter_lead),
    db: Session = Depends(get_db),
) -> Squad:
    squad = db.get(Squad, squad_id)
    if not squad:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El Squad no existe")
    return squad


@router.post("/squads", response_model=SquadResponse, status_code=status.HTTP_201_CREATED)
def create_squad(
    payload: SquadCreate,
    _: CurrentUser = Depends(require_chapter_lead),
    db: Session = Depends(get_db),
) -> Squad:
    if db.scalar(select(Squad).where(func.lower(Squad.code) == payload.code.lower())):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El código del Squad ya está registrado")
    squad = Squad(
        code=payload.code,
        name=payload.name,
        tribe=payload.tribe,
        product_owner_name=payload.product_owner_name,
        is_active=True,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    db.add(squad)
    try:
        db.commit()
        db.refresh(squad)
    except IntegrityError as error:
        db.rollback()
        if "code" in str(error.orig).lower() or "ix_squads_code_lower" in str(error.orig):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="El código del Squad ya está registrado"
            ) from None
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="No se pudo guardar el Squad") from None
    return squad


@router.patch("/squads/{squad_id}", response_model=SquadResponse)
def update_squad(
    squad_id: str,
    payload: SquadUpdate,
    _: CurrentUser = Depends(require_chapter_lead),
    db: Session = Depends(get_db),
) -> Squad:
    squad = db.get(Squad, squad_id)
    if not squad:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El Squad no existe")
    if payload.code and db.scalar(
        select(Squad).where(func.lower(Squad.code) == payload.code.lower(), Squad.id != squad_id)
    ):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El código del Squad ya está registrado")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(squad, field, value)
    squad.updated_at = datetime.now(UTC)
    try:
        db.commit()
        db.refresh(squad)
    except IntegrityError as error:
        db.rollback()
        if "code" in str(error.orig).lower() or "ix_squads_code_lower" in str(error.orig):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="El código del Squad ya está registrado"
            ) from None
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="No se pudo actualizar el Squad") from None
    return squad


@router.delete("/squads/{squad_id}", response_model=SquadResponse)
def deactivate_squad(
    squad_id: str,
    _: CurrentUser = Depends(require_chapter_lead),
    db: Session = Depends(get_db),
) -> Squad:
    squad = db.get(Squad, squad_id)
    if not squad:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El Squad no existe")
    squad.is_active = False
    squad.updated_at = datetime.now(UTC)
    db.commit()
    db.refresh(squad)
    return squad


@router.get("/providers", response_model=list[ProviderResponse])
def list_providers(
    provider_status: ProviderStatus = Query(default="all", alias="status"), db: Session = Depends(get_db)
) -> list[Vendor]:
    query = select(Vendor).order_by(Vendor.name)
    if provider_status == "active":
        query = query.where(Vendor.is_active)
    elif provider_status == "inactive":
        query = query.where(~Vendor.is_active)
    return list(db.scalars(query))


@router.get("/providers/{provider_id}", response_model=ProviderResponse)
def get_provider(provider_id: str, db: Session = Depends(get_db)) -> Vendor:
    provider = db.get(Vendor, provider_id)
    if not provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El proveedor no existe")
    return provider


@router.post("/providers", response_model=ProviderResponse, status_code=status.HTTP_201_CREATED)
def create_provider(payload: ProviderCreate, db: Session = Depends(get_db)) -> Vendor:
    if db.scalar(select(Vendor).where(func.lower(Vendor.ruc) == payload.ruc.lower())):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El RUC ya está registrado")
    provider = Vendor(
        name=payload.name,
        ruc=payload.ruc,
        focal_point=payload.focal_point,
        mobile=payload.mobile,
        is_active=True,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    db.add(provider)
    try:
        db.commit()
        db.refresh(provider)
    except IntegrityError as error:
        db.rollback()
        if "ruc" in str(error.orig).lower() or "ix_vendors_ruc_lower" in str(error.orig):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El RUC ya está registrado") from None
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="No se pudo guardar el proveedor") from None
    return provider


@router.patch("/providers/{provider_id}", response_model=ProviderResponse)
def update_provider(provider_id: str, payload: ProviderUpdate, db: Session = Depends(get_db)) -> Vendor:
    provider = db.get(Vendor, provider_id)
    if not provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El proveedor no existe")
    values = payload.model_dump(exclude_unset=True)
    if payload.ruc and db.scalar(
        select(Vendor).where(func.lower(Vendor.ruc) == payload.ruc.lower(), Vendor.id != provider_id)
    ):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El RUC ya está registrado")
    for field, value in values.items():
        setattr(provider, field, value)
    try:
        db.commit()
        db.refresh(provider)
    except IntegrityError as error:
        db.rollback()
        if "ruc" in str(error.orig).lower() or "ix_vendors_ruc_lower" in str(error.orig):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El RUC ya está registrado") from None
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="No se pudo actualizar el proveedor") from None
    return provider


@router.delete("/providers/{provider_id}", response_model=ProviderResponse)
def deactivate_provider(provider_id: str, db: Session = Depends(get_db)) -> Vendor:
    provider = db.get(Vendor, provider_id)
    if not provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El proveedor no existe")
    provider.is_active = False
    db.commit()
    db.refresh(provider)
    return provider


@router.get("/catalogs/professional-roles", response_model=list[CatalogItem])
def list_professional_roles(
    _: CurrentUser = Depends(require_chapter_lead), db: Session = Depends(get_db)
) -> list[ProfessionalRole]:
    return list(db.scalars(select(ProfessionalRole).where(ProfessionalRole.is_active).order_by(ProfessionalRole.name)))


@router.get("/catalogs/vendors", response_model=list[CatalogItem])
def list_vendors(_: CurrentUser = Depends(require_chapter_lead), db: Session = Depends(get_db)) -> list[Vendor]:
    return list(db.scalars(select(Vendor).where(Vendor.is_active).order_by(Vendor.name)))


@router.get("/members", response_model=MemberPage)
def list_members(
    member_status: MemberStatus = Query(default="active", alias="status"),
    _: CurrentUser = Depends(require_chapter_lead),
    db: Session = Depends(get_db),
    search: str = "",
    vendor_id: str | None = None,
    professional_role_id: str | None = None,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    sort_by: MemberSortBy = "member_full_name",
    sort_direction: MemberSortDirection = "asc",
) -> MemberPage:
    if page < 1 or page_size < 1 or page_size > 100:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Los parámetros de paginación no son válidos")

    query = (
        select(TeamMember)
        .outerjoin(
            MemberVendorAffiliation,
            (MemberVendorAffiliation.member_id == TeamMember.id)
            & MemberVendorAffiliation.valid_until.is_(None),
        )
        .outerjoin(Vendor, MemberVendorAffiliation.vendor_id == Vendor.id)
        .options(
            selectinload(TeamMember.professional_role),
            selectinload(TeamMember.affiliations).selectinload(MemberVendorAffiliation.vendor),
        )
    )
    if member_status == "active":
        query = query.where(TeamMember.is_active)
    elif member_status == "inactive":
        query = query.where(~TeamMember.is_active)
    if vendor_id:
        query = query.where(MemberVendorAffiliation.vendor_id == vendor_id)
    if professional_role_id:
        query = query.where(TeamMember.professional_role_id == professional_role_id)

    normalized_search = _search_key(search.strip())
    if normalized_search:
        search_pattern = f"%{normalized_search}%"
        full_name = TeamMember.first_name + " " + TeamMember.paternal_surname + " " + func.coalesce(TeamMember.maternal_surname, "")
        query = query.where(
            func.lower(TeamMember.dni).like(search_pattern)
            | func.lower(full_name).like(search_pattern)
            | func.lower(TeamMember.first_name).like(search_pattern)
            | func.lower(TeamMember.paternal_surname).like(search_pattern)
            | func.lower(func.coalesce(TeamMember.maternal_surname, "")).like(search_pattern)
        )

    sort_expressions = {
        "member_full_name": TeamMember.first_name + " " + TeamMember.paternal_surname + " " + func.coalesce(TeamMember.maternal_surname, ""),
        "dni": TeamMember.dni,
        "employment_type": TeamMember.employment_type,
        "vendor_name": func.coalesce(Vendor.name, "Planilla"),
        "professional_role_name": ProfessionalRole.name,
        "seniority": TeamMember.seniority,
        "is_active": TeamMember.is_active,
    }
    if sort_by not in sort_expressions or sort_direction not in ("asc", "desc"):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Los parámetros de ordenamiento no son válidos")
    sort_expression = sort_expressions[sort_by]
    ordered_expression = sort_expression.asc() if sort_direction == "asc" else sort_expression.desc()
    total = db.scalar(select(func.count()).select_from(query.order_by(None).subquery())) or 0
    total_pages = (total + page_size - 1) // page_size
    members = list(
        db.scalars(
            query.join(ProfessionalRole, TeamMember.professional_role_id == ProfessionalRole.id)
            .order_by(ordered_expression, TeamMember.id.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
    )
    return MemberPage(
        items=[_member_response(member) for member in members],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/members/{member_id}", response_model=MemberResponse)
def get_member(
    member_id: str,
    _: CurrentUser = Depends(require_chapter_lead),
    db: Session = Depends(get_db),
) -> MemberResponse:
    member = db.get(TeamMember, member_id)
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El miembro no existe")
    return _member_response(member)


@router.post("/members", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
def create_member(
    payload: MemberCreate,
    _: CurrentUser = Depends(require_chapter_lead),
    db: Session = Depends(get_db),
) -> MemberResponse:
    if db.scalar(select(TeamMember).where(TeamMember.dni == payload.dni)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El DNI ya está registrado")
    if db.scalar(select(TeamMember).where(TeamMember.email == payload.email)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El correo ya está registrado")

    role = db.get(ProfessionalRole, payload.professional_role_id)
    if not role or not role.is_active:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="El rol profesional no es válido")

    vendor = None
    if payload.employment_type == EmploymentType.CONTRACTOR:
        vendor = db.get(Vendor, payload.vendor_id)
        if not vendor or not vendor.is_active:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="El proveedor no es válido")

    member = TeamMember(
        dni=payload.dni,
        first_name=payload.first_name,
        paternal_surname=payload.paternal_surname,
        maternal_surname=payload.maternal_surname or None,
        email=payload.email,
        mobile=payload.mobile or None,
        birth_date=payload.birth_date,
        employment_type=payload.employment_type.value,
        professional_role_id=payload.professional_role_id,
        seniority=payload.seniority.value,
    )
    db.add(member)
    try:
        db.flush()
        if vendor:
            db.add(
                MemberVendorAffiliation(
                    member_id=member.id,
                    vendor_id=vendor.id,
                    valid_from=date.today(),
                )
            )
        db.commit()
        db.refresh(member)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El DNI o correo ya está registrado") from None

    return _member_response(member)


@router.patch("/members/{member_id}", response_model=MemberResponse)
def update_member(
    member_id: str,
    payload: MemberUpdate,
    _: CurrentUser = Depends(require_chapter_lead),
    db: Session = Depends(get_db),
) -> MemberResponse:
    member = db.get(TeamMember, member_id)
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El miembro no existe")

    current_affiliation = _current_affiliation(member)
    current_vendor_id = current_affiliation.vendor_id if current_affiliation else None
    incoming = payload.model_dump(exclude_unset=True)
    validated = MemberCreate(
        dni=incoming.get("dni", member.dni),
        first_name=incoming.get("first_name", member.first_name),
        paternal_surname=incoming.get("paternal_surname", member.paternal_surname),
        maternal_surname=incoming.get("maternal_surname", member.maternal_surname),
        email=incoming.get("email", member.email),
        mobile=incoming.get("mobile", member.mobile),
        birth_date=incoming.get("birth_date", member.birth_date),
        employment_type=incoming.get("employment_type", EmploymentType(member.employment_type)),
        vendor_id=incoming.get("vendor_id", current_vendor_id),
        professional_role_id=incoming.get("professional_role_id", member.professional_role_id),
        seniority=incoming.get("seniority", Seniority(member.seniority)),
    )

    if db.scalar(select(TeamMember).where(TeamMember.dni == validated.dni, TeamMember.id != member_id)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El DNI ya está registrado")
    if db.scalar(
        select(TeamMember).where(func.lower(TeamMember.email) == validated.email.lower(), TeamMember.id != member_id)
    ):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El correo ya está registrado")

    role = db.get(ProfessionalRole, validated.professional_role_id)
    if not role or not role.is_active:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="El rol profesional no es válido")

    vendor = None
    if validated.employment_type == EmploymentType.CONTRACTOR:
        vendor = db.get(Vendor, validated.vendor_id)
        if not vendor or not vendor.is_active:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="El proveedor no es válido")

    member.dni = validated.dni
    member.first_name = validated.first_name
    member.paternal_surname = validated.paternal_surname
    member.maternal_surname = validated.maternal_surname or None
    member.email = validated.email
    member.mobile = validated.mobile or None
    member.birth_date = validated.birth_date
    member.employment_type = validated.employment_type.value
    member.professional_role_id = validated.professional_role_id
    member.seniority = validated.seniority.value
    if payload.is_active is not None:
        member.is_active = payload.is_active
    member.updated_at = datetime.now(UTC)

    next_vendor_id = vendor.id if vendor else None
    if current_vendor_id != next_vendor_id:
        transition_date = date.today()
        if current_affiliation:
            transition_date = max(transition_date, current_affiliation.valid_from + timedelta(days=1))
            current_affiliation.valid_until = transition_date
        if vendor:
            db.add(
                MemberVendorAffiliation(
                    member_id=member.id,
                    vendor_id=vendor.id,
                    valid_from=transition_date,
                )
            )

    try:
        db.commit()
        db.refresh(member)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El DNI o correo ya está registrado") from None
    return _member_response(member)


@router.delete("/members/{member_id}", response_model=MemberResponse)
def deactivate_member(
    member_id: str,
    _: CurrentUser = Depends(require_chapter_lead),
    db: Session = Depends(get_db),
) -> MemberResponse:
    member = db.get(TeamMember, member_id)
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El miembro no existe")
    member.is_active = False
    member.updated_at = datetime.now(UTC)
    db.commit()
    db.refresh(member)
    return _member_response(member)
