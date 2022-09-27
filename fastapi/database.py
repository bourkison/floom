from email.policy import default
import os
from sqlalchemy import create_engine
from sqlalchemy import Column, String, Integer, Identity, DateTime
from sqlalchemy.ext.declarative import declarative_base  
from sqlalchemy.orm import sessionmaker
from datetime import datetime

db_string = os.environ["DB_STRING"]
db = create_engine(db_string)
base = declarative_base()

class Product(base):
    __tablename__ = "products"

    id = Column(Integer(), Identity(start=1, cycle=True), primary_key=True)
    title = Column(String(256))
    price = Column(Integer())

class User(base):
    __tablename__ = "users"

    id=Column(Integer(), Identity(start=1, cycle=True), primary_key=True)
    email=Column(String(128), primary_key=True, unique=True, nullable=False)
    name=Column(String(128), primary_key=True, nullable=False)
    gender=Column(String(6), nullable=False)
    dob=Column(DateTime(), nullable=False)
    country=Column(String(64), nullable=False)
    created_at=Column(DateTime(), default=datetime.utcnow)
    updated_at=Column(DateTime(), default=datetime.utcnow)

Session = sessionmaker(db)
session = Session()

base.metadata.create_all(db)