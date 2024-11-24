"""add google oauth

Revision ID: 002
Revises: 001
Create Date: 2024-01-20

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Make hashed_password nullable for OAuth users
    op.alter_column('users', 'hashed_password',
               existing_type=sa.String(),
               nullable=True)
    
    # Add Google OAuth fields
    op.add_column('users', sa.Column('google_id', sa.String(), nullable=True))
    op.add_column('users', sa.Column('last_login', sa.DateTime(timezone=True), nullable=True))
    
    # Add unique constraint for google_id
    op.create_unique_constraint('uq_users_google_id', 'users', ['google_id'])
    
    # Add index for google_id
    op.create_index('ix_users_google_id', 'users', ['google_id'])

def downgrade() -> None:
    # Remove index and constraint for google_id
    op.drop_index('ix_users_google_id')
    op.drop_constraint('uq_users_google_id', 'users')
    
    # Remove Google OAuth fields
    op.drop_column('users', 'last_login')
    op.drop_column('users', 'google_id')
    
    # Make hashed_password non-nullable again
    op.alter_column('users', 'hashed_password',
               existing_type=sa.String(),
               nullable=False)
