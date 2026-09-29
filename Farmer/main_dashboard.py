from farm_database import FarmDatabase
from farm_analyzer import FarmAnalyzer
import pandas as pd
from datetime import datetime
import requests


class SmartFarmDashboard:
    def __init__(self):
        self.db = FarmDatabase()
        self.current_user_email = None
        self.farmer_id = None

    def login_menu(self):
        print("\n" + "=" * 50)
        print("🚜 SMART FARMER ASSISTANT (IoT Ready)")
        print("=" * 50)
        print("1. Login (Gmail/Email)")
        print("2. Register New Farmer")
        print("3. Exit")

        choice = input("Select: ")

        if choice == '1':
            email = input("Email: ")
            password = input("Password: ")

            user = self.db.login_user(email, password)

            if user:
                print(f"\n✅ Welcome back, {user[0]}!")
                self.current_user_email = email
                return True
            else:
                print("❌ Invalid credentials.")

        elif choice == '2':
            name = input("Enter Name: ")
            email = input("Enter Email: ")
            password = input("Create Password: ")

            if self.db.register_user(email, password, name):
                print("✅ Registration Successful! Please Login.")
            else:
                print("❌ Email already exists.")

        elif choice == '3':
            exit()

        return False

    def setup_profile(self):
        """Create farmer profile if not exists"""
        farmer, _, _ = self.db.get_farmer_data(self.current_user_email)

        if not farmer:
            print("\n📝 COMPLETE YOUR FARMER PROFILE")

            loc = input("Village/Location: ")
            contact = input("Contact Number: ")
            size = input("Land Size (Acres): ")
            soil = input("Soil Type (Black/Red/Clay): ")

            self.farmer_id = self.db.save_farmer_profile(
                self.current_user_email,
                loc,
                contact,
                size,
                soil
            )

        else:
            self.farmer_id = farmer[0]

    def main_dashboard(self):

        while True:

            farmer_rec, crops_rec, soil_rec = self.db.get_farmer_data(self.current_user_email)

            analyzer = FarmAnalyzer(farmer_rec, crops_rec, soil_rec)

            print("\n" + "=" * 50)
            print(f"🌾 FARM DASHBOARD | Location: {farmer_rec[2]}")
            print("=" * 50)

            print("1. 📊 View Crop Health & Stages")
            print("2. 🧪 Update Soil Data (Manual/IoT Simulation)")
            print("3. 💡 Get Fertilizer Recommendations")
            print("4. ☁️ Weather & Irrigation Alerts")
            print("5. 🌱 Add New Crop")
            print("6. 📋 View History Reports")
            print("7. 🚪 Logout")

            choice = input("\nEnter Choice: ")

            # OPTION 1
            if choice == '1':

                df = analyzer.calculate_crop_health()

                if not df.empty:
                    print("\n--- CROP STATUS ---")
                    print(df.to_string(index=False))
                else:
                    print("No crops added yet.")

            # OPTION 2
            elif choice == '2':

                print("\n--- UPDATE SOIL HEALTH ---")
                print("(Temporary until IoT sensors are connected)")

                try:
                    n = float(input("Enter Nitrogen (N): "))
                    p = float(input("Enter Phosphorus (P): "))
                    k = float(input("Enter Potassium (K): "))
                    ec = float(input("Enter Electrical Conductivity (EC): "))
                    oc = float(input("Enter Organic Carbon (OC): "))
                    ph = float(input("Enter pH Level: "))

                    self.db.add_soil_record(
                        self.farmer_id,
                        ph,
                        ec,
                        oc,
                        n,
                        p,
                        k
                    )

                    print("✅ Soil data updated!")

                except ValueError:
                    print("❌ Invalid input.")

            # OPTION 3
            elif choice == '3':

                print("\n--- FERTILIZER ADVISORY ---")

                advice = analyzer.generate_fertilizer_advice()

                if isinstance(advice, list):

                    for tip in advice:
                        print("•", tip)

                else:
                    print(advice)

            # OPTION 4
            elif choice == '4':

                print("\n--- WEATHER & IRRIGATION ALERT ---")

                api_key = "27bd9b0d6ecaec27d57e043f778e8f8c1"
                city = farmer_rec[2]

                url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"

                try:
                    response = requests.get(url)
                    data = response.json()

                    temp = data["main"]["temp"]
                    humidity = data["main"]["humidity"]
                    weather = data["weather"][0]["description"]

                    print(f"🌤 Weather: {weather}")
                    print(f"🌡 Temperature: {temp}°C")
                    print(f"💧 Humidity: {humidity}%")

                    if temp > 32:
                        print("⚠️ High temperature! Consider irrigation today.")

                    if humidity < 40:
                        print("💧 Soil may dry quickly. Check moisture levels.")

                except:
                    print("❌ Weather API error. Check API key or internet.")

            # OPTION 5
            elif choice == '5':

                name = input("Crop Name: ")
                date = input("Sowing Date (YYYY-MM-DD): ")
                season = input("Season (Kharif/Rabi): ")

                self.db.add_crop(
                    self.farmer_id,
                    name,
                    date,
                    season
                )

                print("✅ Crop added!")

            # OPTION 6
            elif choice == '6':

                print("\n--- DATA HISTORY ---")

                if soil_rec:

                    hist_df = pd.DataFrame(
                        soil_rec,
                        columns=[
                            'ID', 'FarmerID', 'Date',
                            'SampleNo', 'FarmerName', 'Tahsil', 'SurveyNumber',
                            'Village', 'Area',
                            'pH', 'EC', 'OrganicCarbon',
                            'Nitrogen', 'Phosphorous', 'Potassium',
                            'Sulphur', 'Zinc', 'Boron',
                            'Iron', 'Manganese', 'Copper', 'Source'
                        ]
                    )

                    print(
                        hist_df[
                            ['Date',
                             'Nitrogen',
                             'Phosphorous',
                             'Potassium',
                             'pH',
                             'EC',
                             'OrganicCarbon',
                             'Source']
                        ]
                    )

                else:
                    print("No history available.")

            # OPTION 7
            elif choice == '7':

                print("Logged out.")
                break

            else:
                print("Invalid option.")

    def run(self):

        while True:

            if self.login_menu():

                self.setup_profile()

                self.main_dashboard()

            else:

                again = input("Try again? (y/n): ")

                if again.lower() != 'y':
                    break


if __name__ == "__main__":

    app = SmartFarmDashboard()

    app.run()