"""create assignments

Revision ID: 005_create_assignments
Revises: 004_create_squads
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "005_create_assignments"
down_revision: str | None = "004_create_squads"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "ix_team_members_professional_role_id" not in {
        index["name"] for index in inspector.get_indexes("team_members")
    }:
        op.create_index("ix_team_members_professional_role_id", "team_members", ["professional_role_id"])
    if not inspector.has_table("assignments"):
        op.create_table(
            "assignments",
            sa.Column("id", sa.String(length=36), primary_key=True),
            sa.Column("member_id", sa.String(length=36), sa.ForeignKey("team_members.id"), nullable=False),
            sa.Column("squad_id", sa.String(length=36), sa.ForeignKey("squads.id"), nullable=False),
            sa.Column("vendor_id", sa.String(length=36), sa.ForeignKey("vendors.id"), nullable=True),
            sa.Column("project_code", sa.String(length=160), nullable=False),
            sa.Column("start_date", sa.Date(), nullable=False),
            sa.Column("end_date", sa.Date(), nullable=False),
            sa.Column("allocation_percentage", sa.Numeric(5, 2), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
            sa.CheckConstraint("end_date >= start_date", name="ck_assignments_valid_date_range"),
            sa.CheckConstraint(
                "allocation_percentage >= 0 AND allocation_percentage <= 100",
                name="ck_assignments_percentage_range",
            ),
            sa.CheckConstraint("length(trim(project_code)) > 0", name="ck_assignments_project_code_not_empty"),
        )
    assignment_indexes = {index["name"] for index in inspector.get_indexes("assignments")}
    if "ix_assignments_member_dates" not in assignment_indexes:
        op.create_index("ix_assignments_member_dates", "assignments", ["member_id", "start_date", "end_date"])
    if "ix_assignments_vendor_id" not in assignment_indexes:
        op.create_index("ix_assignments_vendor_id", "assignments", ["vendor_id"])
    if "ix_assignments_squad_id" not in assignment_indexes:
        op.create_index("ix_assignments_squad_id", "assignments", ["squad_id"])


def downgrade() -> None:
    op.drop_index("ix_assignments_squad_id", table_name="assignments")
    op.drop_index("ix_assignments_vendor_id", table_name="assignments")
    op.drop_index("ix_assignments_member_dates", table_name="assignments")
    op.drop_table("assignments")
    op.drop_index("ix_team_members_professional_role_id", table_name="team_members")
