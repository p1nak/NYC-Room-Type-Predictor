from fastapi import FastAPI
import pandas as pd
from pydantic import BaseModel, Field
import joblib
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


COLUMNS = ["latitude", "longitude", "price", "minimum_nights",
    "number_of_reviews", "reviews_per_month",
    "calculated_host_listings_count", "availability_365",
    "neighbourhood_group", "neighbourhood",]

model = joblib.load("Model_Pipeline.pkl")  # Load the pre-trained model pipeline

# Ensure compatibility across scikit-learn version differences for unpickled SimpleImputer
try:
    num_imputer = model.named_steps["preprocessor"].named_transformers_["numerical"].named_steps["impute"]
    if not hasattr(num_imputer, "_fill_dtype") and hasattr(num_imputer, "_fit_dtype"):
        num_imputer._fill_dtype = num_imputer._fit_dtype
    cat_imputer = model.named_steps["preprocessor"].named_transformers_["categorical"].named_steps["impute"]
    if not hasattr(cat_imputer, "_fill_dtype") and hasattr(cat_imputer, "_fit_dtype"):
        cat_imputer._fill_dtype = cat_imputer._fit_dtype
except Exception:
    pass

#Pydantic Model = the input validation
class Features(BaseModel):
    latitude: float = Field(..., ge=-90, le=90, description="Latitude coordinate")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude coordinate")
    price: float = Field(..., gt=0, description="Price per night, must be positive")
    minimum_nights: int = Field(..., ge=1, le=365, description="Minimum nights required for booking")
    number_of_reviews: int = Field(..., ge=0, description="Total number of reviews")
    reviews_per_month: float = Field(..., ge=0, description="Average reviews per month")
    calculated_host_listings_count: int = Field(..., ge=0, description="Number of listings by this host")
    availability_365: int = Field(..., ge=0, le=365, description="Days available out of 365")
    neighbourhood_group: str = Field(..., min_length=1, description="Borough or neighbourhood group")
    neighbourhood: str = Field(..., min_length=1, description="Specific neighbourhood name")



@app.get('/')
def greet():
    return "Hello Guyss"


@app.post('/predict')
def predict(features: Features):
    row = pd.DataFrame([features.dict()], columns=COLUMNS)
    prediction  = model.predict(row)
    probability = model.predict_proba(row)

    return {
        "Predicted_room_type": prediction[0],
        "Probability": probability.tolist()[0],
        "Classes": model.classes_.tolist() if hasattr(model, "classes_") else ["Entire home/apt", "Private room", "Shared room"]
    }