"""create mindmaps table

Revision ID: create_mindmaps_table
Revises: 
Create Date: 2024-01-10

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'create_mindmaps_table'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'mindmaps',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('data', sa.JSON(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_mindmaps_id'), 'mindmaps', ['id'], unique=False)
    op.create_index(op.f('ix_mindmaps_title'), 'mindmaps', ['title'], unique=False)

def downgrade():
    op.drop_index(op.f('ix_mindmaps_title'), table_name='mindmaps')
    op.drop_index(op.f('ix_mindmaps_id'), table_name='mindmaps')
    op.drop_table('mindmaps')
