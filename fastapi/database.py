import os
from sqlalchemy import create_engine
from sqlalchemy import Column, String, Integer, Identity
from sqlalchemy.ext.declarative import declarative_base  
from sqlalchemy.orm import sessionmaker

db_string = os.environ["DB_STRING"]
db = create_engine(db_string)
base = declarative_base()

class Product(base):
    __tablename__ = "products"

    id = Column(Integer, Identity(start=100000, cycle=True), primary_key=True)
    title = Column(String)
    price = Column(Integer)

Session = sessionmaker(db)
session = Session()

base.metadata.create_all(db)