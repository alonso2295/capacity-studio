"""create squads catalog

Revision ID: 004_create_squads
Revises: 003_vendor_ts_defaults
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "004_create_squads"
down_revision: str | None = "003_vendor_ts_defaults"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if not inspector.has_table("squads"):
        op.create_table(
            "squads",
            sa.Column("id", sa.String(length=36), primary_key=True),
            sa.Column("code", sa.String(length=64), nullable=False),
            sa.Column("name", sa.String(length=160), nullable=False),
            sa.Column("tribe", sa.String(length=160), nullable=True),
            sa.Column("product_owner_name", sa.String(length=160), nullable=True),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        )
    if "ix_squads_code_lower" not in {index["name"] for index in inspector.get_indexes("squads")}:
        op.create_index("ix_squads_code_lower", "squads", [sa.text("lower(code)")], unique=True)


def downgrade() -> None:
    op.drop_index("ix_squads_code_lower", table_name="squads")
    op.drop_table("squads")
