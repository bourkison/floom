from fastapi import FastAPI, status
from database import session, Product, User
from pydantic import BaseModel
from datetime import datetime

class ProductIn(BaseModel):
    title: str
    price: int

class ProductResponse(BaseModel):
    title: str
    price: int
    id: str

app = FastAPI()

@app.get("/")
async def root(first_name: str, last_name: str):
    return {"greeting": "Hello " + first_name + " " + last_name}

@app.get("/user/{email}")
async def get_user(email: str):
    return {"user": email}

@app.post("/user")
async def create_user(email: str, name: str, gender: str, dob: int, country: str):
    user = User(email=email, name=name, gender=gender, dob=datetime.fromtimestamp(dob), country=country)
    session.add(user)
    session.commit()

    return {"id": user.id}

@app.get("/product/{product_id}")
async def read_product(product_id: str):
    return {"id": product_id}

@app.post("/product", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(product: ProductIn):
    product = Product(title=product.title, price=product.price)
    session.add(product)
    session.commit()
    
    return {"id": product.id, "title": product.title, "price": product.price}
