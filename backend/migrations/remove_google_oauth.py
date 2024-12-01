"""Remove Google OAuth

Revision ID: remove_google_oauth
Revises: 
Create Date: 2024-11-25

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'remove_google_oauth'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Drop google_id column from users table
    op.drop_column('users', 'google_id')
    
    # Make hashed_password not nullable
    op.alter_column('users', 'hashed_password',
                    existing_type=sa.String(),
                    nullable=False)

def downgrade() -> None:
    # Add google_id column back to users table
    op.add_column('users', sa.Column('google_id', sa.String(), nullable=True))
    
    # Make hashed_password nullable again
    op.alter_column('users', 'hashed_password',
                    existing_type=sa.String(),
                    nullable=True)
