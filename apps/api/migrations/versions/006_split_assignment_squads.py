"""split assignment squad into assigned and executor squads

Revision ID: 006_split_assignment_squads
Revises: 005_create_assignments
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "006_split_assignment_squads"
down_revision: str | None = "005_create_assignments"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if not inspector.has_table("assignments"):
        return

    columns = {column["name"] for column in inspector.get_columns("assignments")}
    if "squad_id" in columns and "assigned_squad_id" not in columns:
        with op.batch_alter_table("assignments") as batch:
            batch.alter_column("squad_id", new_column_name="assigned_squad_id")

    columns = {column["name"] for column in sa.inspect(bind).get_columns("assignments")}
    if "executor_squad_id" not in columns:
        with op.batch_alter_table("assignments") as batch:
            batch.add_column(
                sa.Column("executor_squad_id", sa.String(length=36), sa.ForeignKey("squads.id"), nullable=True)
            )
        op.execute(
            sa.text(
                "UPDATE assignments SET executor_squad_id = assigned_squad_id "
                "WHERE executor_squad_id IS NULL"
            )
        )
        with op.batch_alter_table("assignments") as batch:
            batch.alter_column("executor_squad_id", nullable=False)

    indexes = {index["name"] for index in sa.inspect(bind).get_indexes("assignments")}
    if "ix_assignments_squad_id" in indexes:
        op.drop_index("ix_assignments_squad_id", table_name="assignments")
    indexes = {index["name"] for index in sa.inspect(bind).get_indexes("assignments")}
    if "ix_assignments_assigned_squad_id" not in indexes:
        op.create_index(
            "ix_assignments_assigned_squad_id", "assignments", ["assigned_squad_id"]
        )
    if "ix_assignments_executor_squad_id" not in indexes:
        op.create_index(
            "ix_assignments_executor_squad_id", "assignments", ["executor_squad_id"]
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if not inspector.has_table("assignments"):
        return

    indexes = {index["name"] for index in inspector.get_indexes("assignments")}
    if "ix_assignments_executor_squad_id" in indexes:
        op.drop_index("ix_assignments_executor_squad_id", table_name="assignments")
    if "ix_assignments_assigned_squad_id" in indexes:
        op.drop_index("ix_assignments_assigned_squad_id", table_name="assignments")

    with op.batch_alter_table("assignments") as batch:
        batch.drop_column("executor_squad_id")
        batch.alter_column("assigned_squad_id", new_column_name="squad_id")
    op.create_index("ix_assignments_squad_id", "assignments", ["squad_id"])
