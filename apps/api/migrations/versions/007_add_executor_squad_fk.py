"""add executor squad foreign key

Revision ID: 007_add_executor_squad_fk
Revises: 006_split_assignment_squads
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "007_add_executor_squad_fk"
down_revision: str | None = "006_split_assignment_squads"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if not inspector.has_table("assignments"):
        return

    has_executor_fk = any(
        foreign_key.get("referred_table") == "squads"
        and foreign_key.get("constrained_columns") == ["executor_squad_id"]
        for foreign_key in inspector.get_foreign_keys("assignments")
    )
    if not has_executor_fk:
        with op.batch_alter_table("assignments") as batch:
            batch.create_foreign_key(
                "fk_assignments_executor_squad_id_squads",
                "squads",
                ["executor_squad_id"],
                ["id"],
            )


def downgrade() -> None:
    with op.batch_alter_table("assignments") as batch:
        batch.drop_constraint("fk_assignments_executor_squad_id_squads", type_="foreignkey")
