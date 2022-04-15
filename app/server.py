import connexion
from connexion import ProblemException
import os 
from flask import jsonify 
from sqlalchemy import create_engine
from app.exception_handler import *
from app.model import Model
from flask_cors import CORS
from flask_compress import Compress
import logging
# from celery import Celery

# Create and configure logger
logging.basicConfig(filename="logs/audit.log",
                    format='%(asctime)s %(levelname)s "%(message)s"',
                    datefmt='%y/%m/%d-%H:%M:%S',
                    level=logging.INFO)

app = connexion.FlaskApp(__name__)
app.add_api('../api/api.yaml') 
app.app.config['DATABASE_URI'] = "postgresql://mrs_test:App4ever#@ds-postgres.cczwnfd9o32m.ap-south-1.rds.amazonaws.com:5432/mrs_test"
# READ CONFIG from env file
app.app.config['DATABASE_CONNECT_OPTIONS'] = {}
app.add_error_handler(404, client_exception)
app.add_error_handler(400, client_exception)
app.add_error_handler(ProblemException, problem_exception)
CORS(app.app, origins=["http://www.amplabs.ai"], supports_credentials=True)
Compress(app.app)
print("Connected to database: {}".format(app.app.config['DATABASE_URI']))

if __name__ == "__main__":
    engine_ = create_engine(app.app.config['DATABASE_URI'], echo=True)
    Model.metadata.create_all(engine_)
    app.run(debug=True, host='0.0.0.0', port='4000')
