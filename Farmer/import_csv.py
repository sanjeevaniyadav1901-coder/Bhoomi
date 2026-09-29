import sqlite3
import csv

conn = sqlite3.connect("smart_farm.db")
cursor = conn.cursor()

with open("bhoomidata.csv", "r") as file:
    reader = csv.DictReader(file)

    for row in reader:
        cursor.execute("""
            INSERT INTO soil_data (
                farmer_id,
                date,
                ph,
                ec,
                organic_carbon,
                nitrogen,
                phosphorous,
                potassium
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            1,
            row.get("date"),
            row.get("ph"),
            row.get("ec"),
            row.get("organic_carbon"),
            row.get("nitrogen"),
            row.get("phosphorous"),
            row.get("potassium")
        ))

conn.commit()
conn.close()

print("✅ CSV data imported successfully!")