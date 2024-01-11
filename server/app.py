from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_mail import Mail
from config import ApplicationConfig
from models import db
from routes.user_endpoints import user_endpoints
from routes.vm_endpoints import vm_endpoints
from routes.admin_endpoints import admin_endpoints

app = Flask(__name__)
app.config.from_object(ApplicationConfig)
CORS(app, supports_credentials=True)
Bcrypt = Bcrypt(app)
jwt = JWTManager(app)
db.init_app(app)
mail = Mail(app)
migrate = Migrate(app, db)

with app.app_context():
    db.create_all()

app.register_blueprint(user_endpoints)
app.register_blueprint(vm_endpoints)
app.register_blueprint(admin_endpoints)

if __name__ == '__main__':
    app.run(debug=True)
