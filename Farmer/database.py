import sqlite3
import hashlib
from datetime import datetime
import os


class FarmDatabase:

    def __init__(self, db_file="smart_farm.db"):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        self.db_path = os.path.join(base_dir, db_file)

        print("USING DB:", self.db_path)

        self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row

        self.create_tables()

    def create_tables(self):
        cursor = self.conn.cursor()

        # USERS TABLE
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            email TEXT PRIMARY KEY,
            password TEXT,
            name TEXT
        )
        ''')

        # FARMERS TABLE
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS farmers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT,
            location TEXT,
            contact TEXT,
            land_size REAL,
            soil_type TEXT,
            FOREIGN KEY (user_email) REFERENCES users(email)
        )
        ''')

        # CROPS TABLE
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS crops (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            farmer_id INTEGER,
            crop_name TEXT,
            sowing_date DATE,
            season TEXT,
            status TEXT DEFAULT 'Active'
        )
        ''')

        # SOIL DATA
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS soil_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            farmer_id INTEGER,
            date DATE,
            ph REAL,
            ec REAL,
            organic_carbon REAL,
            nitrogen REAL,
            phosphorous REAL,
            potassium REAL
        )
        ''')

        # ✅ UPDATED WEATHER TABLE (FIXED)
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS weather_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            farmer_id INTEGER,
            city TEXT,
            temperature REAL,
            humidity REAL,
            windSpeed REAL,
            rainfall REAL,
            rainProbability REAL,
            condition TEXT,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')

        self.conn.commit()

    # ---------------- USER AUTH ----------------

    def register_user(self, email, password, name):
        hashed_pw = hashlib.sha256(password.encode()).hexdigest()

        try:
            self.conn.execute(
                "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
                (email, hashed_pw, name)
            )
            self.conn.commit()
            return True
        except sqlite3.IntegrityError:
            return False

    def login_user(self, email, password):
        hashed_pw = hashlib.sha256(password.encode()).hexdigest()

        cursor = self.conn.execute(
            "SELECT email, name FROM users WHERE email=? AND password=?",
            (email, hashed_pw)
        )

        return cursor.fetchone()

    # ---------------- FARMER PROFILE ----------------

    def save_farmer_profile(self, email, location, contact, land_size, soil_type):
        cursor = self.conn.cursor()

        cursor.execute(
            "SELECT id FROM farmers WHERE user_email=?",
            (email,)
        )

        data = cursor.fetchone()

        if data:
            cursor.execute(
                '''UPDATE farmers
                   SET location=?, contact=?, land_size=?, soil_type=?
                   WHERE user_email=?''',
                (location, contact, land_size, soil_type, email)
            )
            farmer_id = data["id"]
        else:
            cursor.execute(
                '''INSERT INTO farmers
                   (user_email, location, contact, land_size, soil_type)
                   VALUES (?, ?, ?, ?, ?)''',
                (email, location, contact, land_size, soil_type)
            )
            farmer_id = cursor.lastrowid

        self.conn.commit()
        return farmer_id

    # ---------------- CROPS ----------------

    def add_crop(self, farmer_id, name, sowing_date, season):
        self.conn.execute(
            '''INSERT INTO crops
               (farmer_id, crop_name, sowing_date, season)
               VALUES (?, ?, ?, ?)''',
            (farmer_id, name, sowing_date, season)
        )
        self.conn.commit()

    # ---------------- SOIL DATA ----------------

    def add_soil_record(self, farmer_id, ph, ec, oc, n, p, k):
        date_str = datetime.now().strftime("%Y-%m-%d")

        self.conn.execute(
            '''INSERT INTO soil_data
               (farmer_id, date, ph, ec, organic_carbon, nitrogen, phosphorous, potassium)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
            (farmer_id, date_str, ph, ec, oc, n, p, k)
        )

        self.conn.commit()
        print("✅ Soil record saved successfully!")

    # ---------------- WEATHER METHODS ----------------

    def save_weather(self, city, temp, humidity, wind, rain, rain_prob, condition):
        cursor = self.conn.cursor()

        cursor.execute("""
            INSERT INTO weather_data
            (city, temperature, humidity, windSpeed, rainfall, rainProbability, condition)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (city, temp, humidity, wind, rain, rain_prob, condition))

        self.conn.commit()
        print("✅ Weather saved to DB")

    def get_weather_by_city(self, city):
        cursor = self.conn.cursor()

        cursor.execute("""
            SELECT temperature, humidity, windSpeed, rainfall, rainProbability, condition
            FROM weather_data
            WHERE city = ?
            ORDER BY id DESC LIMIT 1
        """, (city,))

        return cursor.fetchone()

    # ---------------- FETCH FARM DATA ----------------

    def get_farmer_data(self, user_email):
        cursor = self.conn.cursor()

        cursor.execute(
            "SELECT * FROM farmers WHERE user_email=?",
            (user_email,)
        )

        farmer = cursor.fetchone()

        if not farmer:
            return None, None, None

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