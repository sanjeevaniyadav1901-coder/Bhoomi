import pandas as pd

df = pd.read_csv("bhoomidata.csv", encoding="latin1")

print("Dataset loaded successfully!")
print(df.head())     # shows first 5 rows
print("Total rows:", len(df))