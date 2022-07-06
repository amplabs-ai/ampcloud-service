from app.controllers.stripe_webhook import webhook
from app.controllers.user_controller import get_update_code, get_user_plan, update_user_plan
import connexion
from connexion import ProblemException
import os
from flask import jsonify, render_template
from sqlalchemy import create_engine
from app.archive_constants import AMPLABS_DB_URL
from app.exception_handler import *
from app.model import Model
from flask_cors import CORS
from flask_compress import Compress
from app.controllers.dashboard_share_controller import dashboard_audit, dashboard_share_linkedin, dashboard_share_url, \
    dashboard_share_validate_id
from app.controllers.echarts_controller import get_timeseries_columns_data, get_stats_columns_data
from app.controllers.file_transfer_controller import download_timeseries_plot_data, download_stats_plot_data
import logging

# Create and configure logger
logging.basicConfig(filename="logs/audit.log",
                    format='%(asctime)s %(levelname)s "%(message)s"',
                    datefmt='%y/%m/%d-%H:%M:%S',
                    level=logging.INFO)

app = connexion.FlaskApp(__name__)
app.add_api('../api/api.yaml', options={'swagger_url': '/api'})
app.app.config['DATABASE_URI'] = AMPLABS_DB_URL
app.app.config['DATABASE_CONNECT_OPTIONS'] = {}

# Error Handlers
app.add_error_handler(404, client_exception)
app.add_error_handler(400, client_exception)
app.add_error_handler(401, unauthorized_exception)
app.add_error_handler(ProblemException, problem_exception)
CORS(app.app, origins=["https://localhost:3000", "https://www.amplabs.ai", "https://65.1.73.220:4000"], supports_credentials=True)
Compress(app.app)
print("Connected to database: {}".format(app.app.config['DATABASE_URI']))

# Private Routes, not documented
app.add_url_rule('/dashboard/share/validate-id', 'dashboard_share_validate_id', dashboard_share_validate_id,
                 methods=['POST'])
app.add_url_rule('/dashboard/audit', 'dashboard_audit', dashboard_audit)
app.add_url_rule('/dashboard/share-id', 'dashboard_share_url', dashboard_share_url, methods=['POST', 'PATCH'])
app.add_url_rule('/dashboard/share-linkedin', 'dashboard_share_linkedin', dashboard_share_linkedin, methods=['POST'])
app.add_url_rule('/echarts/timeseries', 'get_timeseries_columns_data', get_timeseries_columns_data, methods=['POST'])
app.add_url_rule('/echarts/stats', 'get_stats_columns_data', get_stats_columns_data, methods=['POST'])
app.add_url_rule('/download/plot/timeseries','download_timeseries_plot_data', download_timeseries_plot_data, methods=['POST'])
app.add_url_rule('/download/plot/stats','download_stats_plot_data', download_stats_plot_data, methods=['POST'])
app.add_url_rule('/user/get_user_plan', 'get_user_plan', get_user_plan, methods=['GET'])
app.add_url_rule('/user/update_user_plan', 'update_user_plan', update_user_plan, methods=['POST'])
app.add_url_rule('/user/get_update_code', 'get_update_code', get_update_code, methods=['GET'])
app.add_url_rule('/stripe/webhook', 'webhook', webhook, methods=['POST'])

@app.route("/")
def my_index():
    return render_template("index.html", flask_token="amplabs token")


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def index(path):
    return render_template('index.html')


if __name__ == "__main__":
    engine_ = create_engine(app.app.config['DATABASE_URI'], echo=True)
    Model.metadata.create_all(engine_)

    app.run(debug=True, host='0.0.0.0',port='4000',ssl_context='adhoc')
