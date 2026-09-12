"""create team member registration tables

Revision ID: 001_create_team_members
Revises:
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "001_create_team_members"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "vendors",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(160), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.create_table(
        "professional_roles",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(120), nullable=False, unique=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.create_table(
        "team_members",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("dni", sa.String(32), nullable=False, unique=True),
        sa.Column("first_name", sa.String(120), nullable=False),
        sa.Column("paternal_surname", sa.String(120), nullable=False),
        sa.Column("maternal_surname", sa.String(120)),
        sa.Column("email", sa.String(254), nullable=False, unique=True),
        sa.Column("mobile", sa.String(32)),
        sa.Column("birth_date", sa.Date(), nullable=False),
        sa.Column("employment_type", sa.String(20), nullable=False),
        sa.Column("professional_role_id", sa.String(36), sa.ForeignKey("professional_roles.id"), nullable=False),
        sa.Column("seniority", sa.String(20), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("employment_type IN ('PLANILLA', 'TERCERIZADO')", name="ck_member_employment_type"),
        sa.CheckConstraint("seniority IN ('MEDIUM', 'SENIOR')", name="ck_member_seniority"),
    )
    op.create_index("ix_team_members_email_lower", "team_members", [sa.text("lower(email)")], unique=True)
    op.create_table(
        "member_vendor_affiliations",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("member_id", sa.String(36), sa.ForeignKey("team_members.id"), nullable=False),
        sa.Column("vendor_id", sa.String(36), sa.ForeignKey("vendors.id"), nullable=False),
        sa.Column("valid_from", sa.Date(), nullable=False),
        sa.Column("valid_until", sa.Date()),
        sa.CheckConstraint("valid_until IS NULL OR valid_until > valid_from", name="ck_affiliation_valid_range"),
    )
    op.create_index("ix_affiliations_member_valid_from", "member_vendor_affiliations", ["member_id", "valid_from"])

    roles = [
        ("role-data-engineer", "Data Engineer"),
        ("role-analytics-engineer", "Analytics Engineer"),
        ("role-data-analyst", "Data Analyst"),
        ("role-data-architect", "Data Architect"),
    ]
    op.bulk_insert(
        sa.table("professional_roles", sa.column("id", sa.String), sa.column("name", sa.String)),
        [{"id": role_id, "name": name} for role_id, name in roles],
    )


def downgrade() -> None:
    op.drop_index("ix_affiliations_member_valid_from", table_name="member_vendor_affiliations")
    op.drop_table("member_vendor_affiliations")
    op.drop_index("ix_team_members_email_lower", table_name="team_members")
    op.drop_table("team_members")
    op.drop_table("professional_roles")
    op.drop_table("vendors")
