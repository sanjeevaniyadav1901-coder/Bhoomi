import sqlite3
import hashlib
from datetime import datetime
import pandas as pd
import os


class FarmDatabase:

    def __init__(self, db_file="smart_farm.db"):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        db_path = os.path.join(base_dir, db_file)

        print("USING DB:", db_path)

        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row
        self.create_tables()

    # ---------------- CREATE TABLES ---------------- #

    def create_tables(self):

        cursor = self.conn.cursor()

        # Users table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users(
            email TEXT PRIMARY KEY,
            password TEXT,
            name TEXT
        )
        """)

        # Farmers table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS farmers(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT,
            location TEXT,
            contact TEXT,
            land_size REAL,
            soil_type TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_email) REFERENCES users(email)
        )
        """)

        # Crops table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS crops(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            farmer_id INTEGER,
            crop_name TEXT,
            sowing_date TEXT,
            season TEXT,
            status TEXT DEFAULT 'Active'
        )
        """)

        # Soil Data table (FINAL STRUCTURE)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS soil_data(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            farmer_id INTEGER,
            date TEXT,

            sample_no TEXT,
            farmer_name TEXT,
            tahsil TEXT,
            survey_number TEXT,
            village TEXT,
            area REAL,

            ph REAL,
            ec REAL,
            organic_carbon REAL,
            nitrogen REAL,
            phosphorous REAL,
            potassium REAL,

            sulphur REAL,
            zinc REAL,
            boron REAL,
            iron REAL,
            manganese REAL,
            copper REAL,

            source TEXT DEFAULT 'Dataset'
        )
        """)

        self.conn.commit()

    # ---------------- USER FUNCTIONS ---------------- #

    def register_user(self, email, password, name):

        hashed_pw = hashlib.sha256(password.encode()).hexdigest()

        try:
            self.conn.execute(
                "INSERT INTO users VALUES (?, ?, ?)",
                (email, hashed_pw, name)
            )
            self.conn.commit()
            return True

        except sqlite3.IntegrityError:
            return False

    def login_user(self, email, password):

        hashed_pw = hashlib.sha256(password.encode()).hexdigest()

        cursor = self.conn.execute(
            "SELECT name FROM users WHERE email=? AND password=?",
            (email, hashed_pw)
        )

        return cursor.fetchone()

    # ---------------- FARMER PROFILE ---------------- #

    def save_farmer_profile(self, email, location, contact, land_size, soil_type):

        cursor = self.conn.cursor()

        cursor.execute(
            "SELECT id FROM farmers WHERE user_email=?",
            (email,)
        )

        data = cursor.fetchone()

        if data:
            cursor.execute(
                """UPDATE farmers
                   SET location=?, contact=?, land_size=?, soil_type=?
                   WHERE user_email=?""",
                (location, contact, land_size, soil_type, email)
            )
            farmer_id = data["id"]

        else:
            cursor.execute(
                """INSERT INTO farmers
                (user_email, location, contact, land_size, soil_type)
                VALUES (?, ?, ?, ?, ?)""",
                (email, location, contact, land_size, soil_type)
            )
            farmer_id = cursor.lastrowid

        self.conn.commit()
        return farmer_id

    # ---------------- CROPS ---------------- #

    def add_crop(self, farmer_id, name, sowing_date, season):

        self.conn.execute(
            "INSERT INTO crops (farmer_id, crop_name, sowing_date, season) VALUES (?, ?, ?, ?)",
            (farmer_id, name, sowing_date, season)
        )

        self.conn.commit()

    # ---------------- SOIL DATA (MANUAL ENTRY) ---------------- #

    def add_soil_record(self, farmer_id, ph, ec, oc, n, p, k):

        date_str = datetime.now().strftime("%Y-%m-%d")

        self.conn.execute(
            """
            INSERT INTO soil_data
            (farmer_id, date, ph, ec, organic_carbon, nitrogen, phosphorous, potassium)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (farmer_id, date_str, ph, ec, oc, n, p, k)
        )

        self.conn.commit()
        print("✅ Soil record saved successfully!")

    # ---------------- IMPORT CSV ---------------- #

    def import_csv_dataset(self, csv_file="bhoomidata.csv"):

        df = pd.read_csv(csv_file)
        cursor = self.conn.cursor()

        print("CSV Columns 👉", df.columns)  # debug

        for _, row in df.iterrows():
            cursor.execute("""
                INSERT INTO soil_data (
                    farmer_id, date,
                    sample_no, farmer_name, tahsil, survey_number, village, area,
                    ph, ec, organic_carbon, nitrogen, phosphorous, potassium,
                    sulphur, zinc, boron, iron, manganese, copper
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                1,
                datetime.now().strftime("%Y-%m-%d"),

                row.get('Sample No.'),
                row.get('Farmer Name'),
                row.get('Tahsil'),
                row.get('Survey Number'),
                row.get('Village'),
                row.get('Area'),

                row.get('pH'),
                row.get('EC'),
                row.get('Organic Carbon (%)'),
                row.get('Nitrogen (kg/ha)'),
                row.get('Phosphorous (kg/ha)'),
                row.get('Potassium (kg/ha)'),

                row.get('Sulphur (ppm)'),
                row.get('Zinc (ppm)'),
                row.get('Boron (ppm)'),
                row.get('Iron (ppm)'),
                row.get('Manganese (ppm)'),
                row.get('Copper (ppm)')
            ))

        self.conn.commit()
        print("✅ Soil dataset imported successfully!")

    # ---------------- FETCH DATA ---------------- #

    def get_farmer_data(self, user_email):

        cursor = self.conn.cursor()

        cursor.execute(
            "SELECT * FROM farmers WHERE user_email=?",
            (user_email,)
        )

        farmer = cursor.fetchone()

        if not farmer:
            return None, [], []

        farmer_id = farmer["id"]

        cursor.execute(
            "SELECT * FROM crops WHERE farmer_id=?",
            (farmer_id,)
        )
        crops = cursor.fetchall()

        cursor.execute(
            "SELECT * FROM soil_data WHERE farmer_id=? ORDER BY date DESC",
            (farmer_id,)
        )
        soil = cursor.fetchall()

        return farmer, crops, soil


# ---------------- RUN FILE ---------------- #

if __name__ == "__main__":
    print("🚀 Running dataset import...")

    db = FarmDatabase()
    db.import_csv_dataset("bhoomidata.csv")
