"""add provider contact details and normalized RUC

Revision ID: 002_add_provider_details
Revises: 001_create_team_members
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "002_add_provider_details"
down_revision: str | None = "001_create_team_members"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("vendors", sa.Column("ruc", sa.String(64), nullable=True))
    op.add_column("vendors", sa.Column("focal_point", sa.String(160), nullable=True))
    op.add_column("vendors", sa.Column("mobile", sa.String(32), nullable=True))
    op.add_column("vendors", sa.Column("created_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("vendors", sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True))

    op.execute("UPDATE vendors SET ruc = 'LEGACY-' || id WHERE ruc IS NULL")
    op.execute("UPDATE vendors SET focal_point = 'Pendiente de completar' WHERE focal_point IS NULL")
    op.execute("UPDATE vendors SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL")
    op.execute("UPDATE vendors SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL")

    with op.batch_alter_table("vendors") as batch_op:
        batch_op.alter_column("ruc", existing_type=sa.String(64), nullable=False)
        batch_op.alter_column("focal_point", existing_type=sa.String(160), nullable=False)
        batch_op.alter_column("created_at", existing_type=sa.DateTime(timezone=True), nullable=False)
        batch_op.alter_column("updated_at", existing_type=sa.DateTime(timezone=True), nullable=False)

    op.create_index("ix_vendors_ruc_lower", "vendors", [sa.text("lower(ruc)")], unique=True)


def downgrade() -> None:
    op.drop_index("ix_vendors_ruc_lower", table_name="vendors")
    with op.batch_alter_table("vendors") as batch_op:
        batch_op.drop_column("updated_at")
        batch_op.drop_column("created_at")
        batch_op.drop_column("mobile")
        batch_op.drop_column("focal_point")
        batch_op.drop_column("ruc")
