import sqlite3
import os

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "projects_v2.db")

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Create projects table with soft-delete & UUID & auth details
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        project_number TEXT NOT NULL UNIQUE,
        client_name TEXT NOT NULL,
        consultant TEXT,
        location TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        description TEXT,
        status TEXT DEFAULT 'Draft',
        created_at TEXT NOT NULL,
        modified_at TEXT NOT NULL,
        is_deleted INTEGER DEFAULT 0,
        deleted_at TEXT,
        created_by TEXT DEFAULT 'Consultant Engineer',
        updated_by TEXT DEFAULT 'Consultant Engineer'
    );
    """)
    
    # 2. Create site_information table (Normalized)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS site_information (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER UNIQUE NOT NULL,
        site_name TEXT,
        site_coordinates TEXT,
        ground_level REAL,
        groundwater_level REAL,
        weather TEXT,
        elevation REAL,
        site_notes TEXT,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
    );
    """)
    
    # 3. Create calculations table (History & resumption)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS calculations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        project_id INTEGER NOT NULL,
        module TEXT NOT NULL,
        calculation_name TEXT NOT NULL,
        created_at TEXT NOT NULL,
        inputs TEXT NOT NULL,
        results TEXT NOT NULL,
        version TEXT DEFAULT '1.0',
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
    );
    """)
    
    # 4. Create reports table (Export summaries)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        project_id INTEGER NOT NULL,
        module TEXT NOT NULL,
        report_number INTEGER NOT NULL,
        engineer TEXT NOT NULL,
        created_at TEXT NOT NULL,
        inputs TEXT NOT NULL,
        results TEXT NOT NULL,
        engineering_notes TEXT,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
    );
    """)
    
    # 5. Create project_activity table (Audit trail)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS project_activity (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        activity_type TEXT NOT NULL,
        description TEXT NOT NULL,
        created_at TEXT NOT NULL,
        user_name TEXT DEFAULT 'Consultant Engineer',
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
    );
    """)
    
    conn.commit()
    conn.close()
