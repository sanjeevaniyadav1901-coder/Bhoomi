import sqlite3
import os

# ✅ Use absolute path (same as your project)
base_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(base_dir, "smart_farm.db")

print("USING DB:", db_path)

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM soil_data")

    count = cursor.fetchone()[0]
    print("Total Soil Records:", count)

    conn.close()

except Exception as e:
    print("❌ ERROR:", e)