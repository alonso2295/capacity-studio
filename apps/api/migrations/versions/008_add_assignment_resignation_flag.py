"""add member resignation flag to assignments

Revision ID: 008_member_resigned
Revises: 007_add_executor_squad_fk
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "008_member_resigned"
down_revision: str | None = "007_add_executor_squad_fk"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if not inspector.has_table("assignments"):
        return

    columns = {column["name"] for column in inspector.get_columns("assignments")}
    if "member_resigned" not in columns:
        with op.batch_alter_table("assignments") as batch:
            batch.add_column(
                sa.Column("member_resigned", sa.Boolean(), nullable=False, server_default=sa.false())
            )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if inspector.has_table("assignments") and "member_resigned" in {
        column["name"] for column in inspector.get_columns("assignments")
    }:
        with op.batch_alter_table("assignments") as batch:
            batch.drop_column("member_resigned")
