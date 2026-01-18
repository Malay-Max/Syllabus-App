import os
import time
import json
import sqlite3
import argparse
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from .env file if present
load_dotenv()

# --- CONFIGURATION ---
# API Key should be set in environment variables
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# if not GOOGLE_API_KEY:
#     # Fallback to the one originally in the file if env var is missing, though discouraged
#     GOOGLE_API_KEY = "AIzaSyDA_I3ONns0eQq_oDnN5pVulCLx0YaIkLs"

genai.configure(api_key=GOOGLE_API_KEY)

# Default DB Name if not provided
DEFAULT_DB_NAME = "prisma/syllabus_master.db"

# --- DATABASE MANAGEMENT ---
def init_db(db_path):
    """Creates the normalized relational schema."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 1. Authors
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS authors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE
        )
    ''')
    
    # 2. Texts
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS texts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            author_id INTEGER,
            FOREIGN KEY(author_id) REFERENCES authors(id),
            UNIQUE(title, author_id)
        )
    ''')

    # 3. Universities
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS universities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE
        )
    ''')

    # 4. Syllabus Map
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS syllabus_map (
            university_id INTEGER,
            text_id INTEGER,
            semester INTEGER,
            course_code TEXT,
            marks TEXT,
            credits INTEGER,
            PRIMARY KEY (university_id, text_id, course_code),
            FOREIGN KEY(university_id) REFERENCES universities(id),
            FOREIGN KEY(text_id) REFERENCES texts(id)
        )
    ''')
    
    conn.commit()
    conn.close()

def get_or_create(cursor, table, column, value):
    """Helper: Finds an ID for a value, or creates it if missing."""
    if not value: return None
    value = value.strip()
    
    cursor.execute(f"SELECT id FROM {table} WHERE {column} = ?", (value,))
    result = cursor.fetchone()
    
    if result:
        return result[0]
    else:
        cursor.execute(f"INSERT INTO {table} ({column}) VALUES (?)", (value,))
        return cursor.lastrowid

def save_relational_data(entries, db_path):
    """Parses AI JSON and distributes data across 4 tables."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    count = 0
    for entry in entries:
        # 1. Extract Core Data
        uni_name = entry.get('university') or "Unknown University"
        author_name = entry.get('author')
        text_title = entry.get('text_name')
        
        # Skip garbage entries
        if not author_name or not text_title:
            continue

        # 2. Get/Create University ID
        uni_id = get_or_create(cursor, "universities", "name", uni_name)

        # 3. Get/Create Author ID
        author_id = get_or_create(cursor, "authors", "name", author_name)

        # 4. Get/Create Text ID
        text_title = text_title.strip()
        cursor.execute("SELECT id FROM texts WHERE title = ? AND author_id = ?", (text_title, author_id))
        result = cursor.fetchone()
        
        if result:
            text_id = result[0]
        else:
            cursor.execute("INSERT INTO texts (title, author_id) VALUES (?, ?)", (text_title, author_id))
            text_id = cursor.lastrowid

        # 5. Link them in the Map (Upsert logic)
        cursor.execute('''
            INSERT OR REPLACE INTO syllabus_map 
            (university_id, text_id, semester, course_code, marks, credits)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            uni_id, 
            text_id, 
            entry.get('semester'), 
            entry.get('course_code'), 
            entry.get('marks'), 
            entry.get('credits')
        ))
        count += 1
    
    conn.commit()
    print(f"Integrated {count} text-mappings into the database.")
    conn.close()

# --- AI PIPELINE ---
def process_pdf(pdf_path, db_path):
    print(f"Uploading {pdf_path} to Gemini...")
    sample_file = genai.upload_file(path=pdf_path, display_name="Syllabus PDF")
    
    print(f"Processing file...")
    while sample_file.state.name == "PROCESSING":
        time.sleep(2)
        sample_file = genai.get_file(sample_file.name)

    if sample_file.state.name == "FAILED":
        raise ValueError("File upload failed.")

    print(f"Analyzed: {sample_file.uri}")

    model = genai.GenerativeModel("gemini-2.5-flash-lite") # Updated model name if needed, assuming user wants flash
    
    # Prompt
    prompt = """
    Extract all literary texts and course details from this syllabus PDF into a JSON list.
    
    CRITICAL: Look for the University Name on the first page and apply it to every object.
    
    JSON Schema per item:
    {
        "university": "Full Name of University",
        "semester": Integer,
        "course_code": "String",
        "author": "Author Name (e.g. William Shakespeare)",
        "text_name": "Text Title (e.g. The Tempest)",
        "marks": "String",
        "credits": Integer
    }
    
    Rules:
    1. If a course has multiple texts, create a separate object for EACH text.
    2. Normalize author names (e.g., use 'William Shakespeare' not 'Shakespeare').
    """

    print("AI is extracting data...")
    response = model.generate_content(
        [sample_file, prompt],
        generation_config={"response_mime_type": "application/json"}
    )

    try:
        data = json.loads(response.text)
        if isinstance(data, dict): 
            # Check if it's wrapped in a key or single object
             if len(data) == 1 and isinstance(list(data.values())[0], list):
                 data = list(data.values())[0]
             else:
                 data = [data] # Handle likely single object, though prompt asks for list
        
        save_relational_data(data, db_path)
        
    except Exception as e:
        print(f"Error: {e}")
        # print(response.text)
    
    # Cleanup
    try:
        genai.delete_file(sample_file.name)
    except:
        pass

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process a Syllabus PDF and update the database.")
    parser.add_argument("pdf_path", help="Path to the PDF file")
    parser.add_argument("--db", default=DEFAULT_DB_NAME, help="Path to the SQLite database")
    
    args = parser.parse_args()
    
    init_db(args.db)
    process_pdf(args.pdf_path, args.db)