from flask import Flask, jsonify, request, send_from_directory
import uuid
import database_helper
import re
import json
from gevent.pywsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler
from geventwebsocket import WebSocketError
import smtplib
import string
import random
from flask_mail import Mail, Message




app = Flask(__name__)
app.debug=True
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USERNAME'] = "smtp.tddd97@gmail.com"
app.config['MAIL_PASSWORD'] = "jeromejerome"
mail = Mail(app)

signed_in_users = {}

@app.teardown_request
def after_request(exception):
    database_helper.disconnect_db()


@app.route('/')
def index():
    return app.send_static_file('client.html')


@app.route('/sign-in', methods=['POST'])
def sign_in():
    data = request.get_json()
    email = data['email']
    password = data['password']
    if (database_helper.valid_user(email, password)):

        token = str(uuid.uuid4())

        database_helper.put_logged_in_user(email, token)
        return jsonify(
            {"success": True, "message": "Successfully signed in.", "data": token}), 200
    else:
        return jsonify(
        {"success": False, "message": "Wrong username or password"},400
        )

@app.route('/sign-up', methods=['POST'])
def sign_up():

        data = request.get_json()
        firstname = data['firstname']
        familyname = data['lastname']
        gender = data['gender']
        city = data['city']
        country = data['country']
        email = data['email']
        password = data['password']
        if (firstname and familyname and gender and city and country and email and password):
            if (len(password) >= 6):
                if(database_helper.taken_user(email)):
                    database_helper.new_user(email, password, firstname, familyname, gender, city, country)


                    return jsonify({"success": True, "message": "Successfully created a new user."}), 200

                else:
                    return jsonify({"success": False, "message": "User already exists."}),500
            else:
                return jsonify({"success": False, "message": "Password is too short."}),400

        else:
            return jsonify({"success": False, "message": "You need to fill in all the fields."}),501

@app.route('/sign-out', methods=['POST'])
def sign_out():
    data = request.get_json()
    token = request.headers.get("token") #headers
    #token = data["token"]
    email = data["email"]
    is_signed_in = database_helper.check_logged_in_users(email, token)


    if (is_signed_in):
        database_helper.delete_logged_in_user(token)
        return jsonify({"success": True, "message": "Successfully signed out."}),200
    else:
        return jsonify({"success": False, "message": "You are not signed in."}),405

@app.route('/change-password', methods=['POST'])
def change_password():
    data = request.get_json()
    #token = data["token"]
    token = request.headers.get("token") #headers

    email = ''.join(database_helper.get_email_by_token(token))

    is_signed_in = database_helper.check_logged_in_users(email, token)

    oldPassword = data['oldPassword']
    newPassword = data['newPassword']
    if (is_signed_in):
        help = database_helper.valid_user(email, oldPassword)

        if (help):
            database_helper.changePassword(newPassword, email)
            return jsonify({"success": True, "message": "Password changed."}),200
        else:
            return jsonify({"success": False, "message": "Wrong password."}),400

    else:
        return jsonify({"success": False, "message": "You are not signed in."}),405







@app.route('/get-user-data-by-email/<toEmail>', methods=['GET'])
def get_user_data_by_email(toEmail):
        #data = request.get_json()

        token = request.headers.get("token") #headers
        #token = data["token"]
        email = ''.join(database_helper.get_email_by_token(token))
        is_signed_in = database_helper.check_logged_in_users(email, token)

        if (is_signed_in):
            match = database_helper.get_user_data_by_email(toEmail)
            if (match):
                return jsonify({"success": True, "message": "User data retrieved.", "data": match}),200
            else:
                return jsonify({"success": False, "message": "No such user."}),404
        else:
            return jsonify({"success": False, "message": "You are not signed in."}),405

@app.route('/get-user-data-by-token/', methods=['GET'])
def get_user_data_by_token():
    token = request.headers.get("token") #headers

    email = ''.join(database_helper.get_email_by_token(token))
    is_signed_in = database_helper.check_logged_in_users(email, token)
    if (is_signed_in):
        return get_user_data_by_email(email)
    else:
        return False







@app.route('/get-user-messages-by-token', methods=['GET'])
def get_user_messages_by_token():
    token = request.headers.get("token") #headers

    email = ''.join(database_helper.get_email_by_token(token))
    is_signed_in = database_helper.check_logged_in_users(email, token)
    if (is_signed_in):
        return get_user_messages_by_email(email)
    else:
        return False


@app.route('/get-user-messages-by-email/<toEmail>', methods=['GET'])
def get_user_messages_by_email(toEmail):
    token = request.headers.get("token") #headers
    email = ''.join(database_helper.get_email_by_token(token))

    is_signed_in = database_helper.check_logged_in_users(email, token)

    valid_user = database_helper.taken_user(toEmail)
    if (is_signed_in):
        if not (valid_user):
            messages = database_helper.get_messages(toEmail)
            return jsonify({"success": True, "message": "User messages retrieved.", "data": messages}),200
        else:
            return jsonify({"success": False, "message": "No such user."}),404
    else:
        return jsonify({"success": False, "message": "You are not signed in."}),405

@app.route('/post-message', methods=['POST'])
def post_message():
    data = request.get_json()
    #token = data['token']
    token = request.headers.get("token") #headers

    message = data['message']
    toEmail = data['toEmail']
    fromEmail = ''.join(database_helper.get_email_by_token(token))
    is_signed_in = database_helper.check_logged_in_users(fromEmail, token)

    if (is_signed_in):
        existingUser = database_helper.taken_user(toEmail)
        if not (existingUser):
            database_helper.post_messages(message, fromEmail, toEmail)
            return jsonify({"success": True, "message": "Message posted"}),200

        else:
            return jsonify({"success": False, "message": "No such user."}),404
    else:
        return jsonify({"success": False, "message": "You are not signed in."}),405


@app.route('/socket')
def api():
    if request.environ.get('wsgi.websocket'):

        ws = request.environ['wsgi.websocket']

        token = ws.receive()
        email = ''.join(database_helper.get_email_by_token(token))
        is_signed_in = database_helper.check_logged_in_users(email, token)

        if (is_signed_in):
            if email in signed_in_users:
                old_socket = signed_in_users[email]
                try:
                    old_socket.send(json.dumps("logout"))
                    print("Active Websocket deleted")

                except:
                    print("Active Websocket deleted (due to reload)")
                del signed_in_users[email]

            signed_in_users[email] = ws
            print("New Active Websocket added")
            signed_in_users[email] = ws
            print("New Active Websocket added")
            while True:
                try:
                    message=ws.receive()
                except:
                    return "w/e"


@app.route('/recover-password', methods=['POST'])
def recover_password():
    data = request.get_json()

    email = data['email']

    is_user_taken = database_helper.taken_user(email)
    if (is_user_taken):
        return jsonify({"success": False, "message": "User does not exist."}),404
    else:
        #Generera ett nytt lösenord och skicka mail.
        password_length = 12
        password_characters = string.ascii_letters + string.digits
        genPassword = []
        for x in range(password_length):
            genPassword.append(random.choice(password_characters))
        genPassword1 = ''.join(genPassword)
        sender = 'smtp.lab4@gmail.com'

        msg = Message()
        msg.subject = "New password from Twidder"
        msg.recipients = [email]
        msg.sender = 'smtp.tddd97@gmail.com'
        msg.body = "This is now your newly generated password: " + genPassword1
        database_helper.change_generated_password(email, genPassword1)
        mail.send(msg)


        return jsonify({"success": True, "message": "New password has been generated."}),200







if __name__ == "__main__":
    print("sever started")
    http_server = WSGIServer(('', 5000), app, handler_class = WebSocketHandler)

    http_server.serve_forever()
    #app.run()
