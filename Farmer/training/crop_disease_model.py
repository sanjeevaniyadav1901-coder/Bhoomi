import os
import json
import tensorflow as tf

from tensorflow.keras import layers
from tensorflow.keras import models
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau


# ============================================================
# CONFIGURATION
# ============================================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")

# ✅ Point directly to your existing dataset
DATASET_ROOT = r"C:\Users\sanje\OneDrive\Desktop\Bhoomi\Plant Village Dataset"

IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 5   # Reduced for faster CPU training (change to 20 for full training)

TRAIN_DIR = os.path.join(DATASET_ROOT, "Train")
VAL_DIR = os.path.join(DATASET_ROOT, "Val")
TEST_DIR = os.path.join(DATASET_ROOT, "Test")

MODEL_PATH = os.path.join(MODELS_DIR, "crop_disease_model.keras")
CLASS_PATH = os.path.join(MODELS_DIR, "classes.json")


# ============================================================
# GPU CHECK
# ============================================================

print("\nChecking TensorFlow...")

print("TensorFlow version:",
      tf.__version__)

gpus = tf.config.list_physical_devices("GPU")

if gpus:
    print("GPU detected:", gpus)
else:
    print("No GPU detected. Training will use CPU.")


# ============================================================
# CHECK DATASET
# ============================================================

if not os.path.exists(TRAIN_DIR):
    print(f"\n❌ Training directory not found: {TRAIN_DIR}")
    exit(1)


# ============================================================
# GET CLASS NAMES FROM TRAIN DATASET
# ============================================================

class_names = sorted([
    folder for folder in os.listdir(TRAIN_DIR)
    if os.path.isdir(os.path.join(TRAIN_DIR, folder))
    and not folder.startswith(".")
])

print("\nNumber of classes:", len(class_names))

print("\nClasses:")

for i, class_name in enumerate(class_names):
    print(i, "->", class_name)


# ============================================================
# SAVE CLASS NAMES
# ============================================================

os.makedirs(MODELS_DIR, exist_ok=True)

with open(CLASS_PATH, "w", encoding="utf-8") as f:
    json.dump(
        class_names,
        f,
        indent=4,
        ensure_ascii=False
    )

print("\nClasses saved to:", CLASS_PATH)


# ============================================================
# LOAD TRAIN DATA
# ============================================================

print("\nLoading training dataset...")

train_ds = tf.keras.utils.image_dataset_from_directory(
    TRAIN_DIR,
    labels="inferred",
    label_mode="categorical",
    class_names=class_names,
    image_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    shuffle=True,
    seed=42
)


# ============================================================
# LOAD VALIDATION DATA
# ============================================================

print("\nLoading validation dataset...")

val_ds = tf.keras.utils.image_dataset_from_directory(
    VAL_DIR,
    labels="inferred",
    label_mode="categorical",
    class_names=class_names,
    image_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    shuffle=False
)


# ============================================================
# LOAD TEST DATA
# ============================================================

print("\nLoading test dataset...")

test_ds = tf.keras.utils.image_dataset_from_directory(
    TEST_DIR,
    labels="inferred",
    label_mode="categorical",
    class_names=class_names,
    image_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    shuffle=False
)


# ============================================================
# PERFORMANCE
# ============================================================

AUTOTUNE = tf.data.AUTOTUNE

train_ds = train_ds.prefetch(AUTOTUNE)
val_ds = val_ds.prefetch(AUTOTUNE)
test_ds = test_ds.prefetch(AUTOTUNE)


# ============================================================
# DATA AUGMENTATION
# ============================================================

data_augmentation = tf.keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.15),
    layers.RandomZoom(0.15),
    layers.RandomContrast(0.10)
])


# ============================================================
# BASE MODEL - EfficientNetB0
# ============================================================

print("\nLoading EfficientNetB0...")

base_model = EfficientNetB0(
    include_top=False,
    weights="imagenet",
    input_shape=(IMG_SIZE, IMG_SIZE, 3)
)

# Freeze pretrained layers
base_model.trainable = False


# ============================================================
# BUILD MODEL
# ============================================================

inputs = layers.Input(
    shape=(IMG_SIZE, IMG_SIZE, 3)
)

x = data_augmentation(inputs)

x = base_model(
    x,
    training=False
)

x = layers.GlobalAveragePooling2D()(x)

x = layers.BatchNormalization()(x)

x = layers.Dropout(0.35)(x)

x = layers.Dense(
    256,
    activation="relu"
)(x)

x = layers.Dropout(0.25)(x)

outputs = layers.Dense(
    len(class_names),
    activation="softmax"
)(x)


model = models.Model(
    inputs,
    outputs
)


# ============================================================
# COMPILE
# ============================================================

model.compile(
    optimizer=tf.keras.optimizers.Adam(
        learning_rate=0.001
    ),
    loss="categorical_crossentropy",
    metrics=[
        "accuracy"
    ]
)


# ============================================================
# MODEL SUMMARY
# ============================================================

model.summary()


# ============================================================
# CALLBACKS
# ============================================================

callbacks = [

    ModelCheckpoint(
        MODEL_PATH,
        monitor="val_accuracy",
        save_best_only=True,
        verbose=1
    ),

    EarlyStopping(
        monitor="val_loss",
        patience=3,
        restore_best_weights=True,
        verbose=1
    ),

    ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.2,
        patience=2,
        min_lr=1e-6,
        verbose=1
    )
]


# ============================================================
# TRAIN
# ============================================================

print("\n========================================")
print(f"STARTING TRAINING - {EPOCHS} EPOCHS")
print("========================================\n")

history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS,
    callbacks=callbacks
)


# ============================================================
# TEST MODEL
# ============================================================

print("\n========================================")
print("TESTING MODEL")
print("========================================\n")

test_loss, test_accuracy = model.evaluate(
    test_ds
)

print("\nTest Loss:",
      test_loss)

print("Test Accuracy:",
      test_accuracy * 100,
      "%")


# ============================================================
# SAVE FINAL MODEL
# ============================================================

model.save(MODEL_PATH)

print("\n========================================")
print("TRAINING COMPLETED")
print("========================================")

print("\nModel saved:")
print(MODEL_PATH)

print("\nClasses saved:")
print(CLASS_PATH)

print("\nFinal Test Accuracy:",
      round(test_accuracy * 100, 2),
      "%")