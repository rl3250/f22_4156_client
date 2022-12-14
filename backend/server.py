import json
from flask import Flask, jsonify, request, session
from flask_session import Session
import requests
import db_service
from flask_cors import CORS
from flask import Response

REMOTE_SERVICE_ENDPOINT = 'http://easymoneytest-env.eba-gxycxg4j.us-east-1.elasticbeanstalk.com'
SERVICE_ENDPOINT = 'http://localhost:8080'

app = Flask(__name__)
CORS(app)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

@app.route('/whoami', methods=['GET'])
def whoami():
    # return current user profile once logged in
    return {'token': get_token()["Authorization"], 'loggedin': 'true'}


@app.route('/auth/<action>', methods=['POST', 'OPTIONS'])
def auth(action):
    if request.method != 'POST':
        return "auth only supports post"
    if action == 'register':
        return handle_register(request)
    elif action == 'login':
        return handle_login(request)
    elif action == 'logout':
        # TODO
        pass


@app.route('/')
def hello_world():
    return jsonify("hello world"), 200


@app.route('/profile', methods=['GET'])
def my_profile():
    token = request.headers.get('Authorization')
    if token == 'undefined' or not token:
        return "no token provided!", 401
    rsp = requests.get('{S}/user/me'.format(S=REMOTE_SERVICE_ENDPOINT), headers={'Authorization': token})
    payload = rsp.json()
    # Simplify
    account = payload['account']
    payload['accountName'] = account['accountName']
    payload['accountNumber'] = account['accountNumber']
    payload['routingNumber'] = account['routingNumber']
    payload.pop('account')
    return payload, 200


@app.route('/profile/<uid>', methods=['GET'])
def get_profile_by_id(uid):
    try:
        uid = int(uid)
    except Exception:
        return "Invalid user id provided!", 400
    rsp = requests.get('{S}/search/id/{I}'.format(S=REMOTE_SERVICE_ENDPOINT, I=uid))
    return rsp.json(), 200


@app.route('/ads', methods=['PUT'])
def edit_ads():
    token = request.headers.get('Authorization')
    if token == 'undefined' or not token:
        return "no token provided!", 401
    rsp = requests.put('{S}/user/biz'.format(S=REMOTE_SERVICE_ENDPOINT), headers={'Authorization': token}, json = request.json)
    if rsp.status_code == 200:
        # server's API returns null response body even if 200, so rsp.json() will not work
        return "Success", 200
    else:
        return "Error", rsp.status_code


@app.route('/request', methods=['POST', 'GET'])
def my_request():
    token = request.headers.get('Authorization')
    if not token:
        return "no token provided!", 401
    method = request.method
    if method == 'POST':
        rsp = requests.post('{S}/request/create'.format(S=REMOTE_SERVICE_ENDPOINT), headers={'Authorization': token}, json = request.json)
    elif method == 'GET':
        rsp = requests.get('{S}/request'.format(S=REMOTE_SERVICE_ENDPOINT), headers={'Authorization': token})
    else:
         return 'method not allowed', 405
    print(rsp.json())
    return rsp.json(), rsp.status_code


@app.route('/request/<action>', methods=['PUT'])
def request_accept(action):
    token = request.headers.get('Authorization')
    if not token:
        return "no token provided!", 401
    if action == 'accept':
        rsp = requests.put('{S}/request/accept'.format(S=REMOTE_SERVICE_ENDPOINT), headers={'Authorization': token}, json = request.json)
    elif action == 'decline':
        rsp = requests.put('{S}/request/decline'.format(S=REMOTE_SERVICE_ENDPOINT), headers={'Authorization': token}, json = request.json)
    else:
        return 'action invalid', 404
    print("response:",rsp.text)
    return rsp.text, rsp.status_code


@app.route('/balance', methods=['PUT'])
def update_balance():
    token = request.headers.get('Authorization')
    if token == 'undefined' or not token:
        return "no token provided!", 401
    amount = float(request.json['amount'])
    if amount == 0:
        return "Invalid amount!", 400
    elif amount > 0:
        request.json['amount'] = str(round(amount, 2))
        rsp = requests.put('{S}/user/deposit'.format(S=REMOTE_SERVICE_ENDPOINT), headers={'Authorization': token}, json=request.json)
    else:
        request.json['amount'] = str(round(-amount, 2))
        rsp = requests.put('{S}/user/withdraw'.format(S=REMOTE_SERVICE_ENDPOINT), headers={'Authorization': token}, json=request.json)
    return rsp.json(), rsp.status_code


@app.route('/search', defaults={'info': ''}, methods=['GET'], strict_slashes=False)
@app.route('/search/<info>', methods=['GET'])
def search_profiles(info):
    if not info:
        return [], 200
    rsp = requests.get('{S}/search/info/{I}'.format(S=REMOTE_SERVICE_ENDPOINT, I=info))
    return rsp.json()['userProfiles'], 200


@app.route('/feed', methods=['GET'])
def user_feed():
    rsp = 'NOT FOUND.'
    token = request.headers.get('Authorization')
    if token and token != 'undefined':
        # print(request.headers)
        rsp = get_feed(token)
        # print(rsp)
        return json.loads(rsp.text), 200
    return rsp, 401

@app.route('/transfer', methods=['GET'])
def get_all_transfers():
    token = request.headers.get('Authorization')
    if token and token != 'undefined':
        rsp = requests.get('{S}/transfer'.format(S=REMOTE_SERVICE_ENDPOINT), headers={'Authorization': token})
        return json.loads(rsp.text), 200
    return "no token provided!", 401
    
@app.route('/transfer/create', methods=['POST'])
def make_transfer():
    token = request.headers.get('Authorization')
    if not token:
        return "no token provided!", 401
    request_json = json.loads(request.data.decode())
    rsp = requests.post('{S}/transfer/create'.format(S=REMOTE_SERVICE_ENDPOINT),
                        json=request_json, headers={'Authorization': token})
    if rsp.status_code == 201:
        return rsp.json(), 200
    else:
        print(rsp.text)
        return rsp.text, rsp.status_code


# ********************** HELPERS **********************
def get_token():
    return {'Authorization': session['token']}


def handle_register(request):
    rsp = requests.post('{S}/auth/register'.format(S=REMOTE_SERVICE_ENDPOINT), json=request.json)
    # use json.loads to parse json properly
    return json.loads(rsp.text), rsp.status_code


def handle_login(request):
    req = request.json
    try:
        rsp = requests.post('{S}/auth/login'.format(S=REMOTE_SERVICE_ENDPOINT), json=req)
        token = rsp.text
        if len(token) == 0 or rsp.status_code != 200:
            return jsonify("Please double check your email and password!"), 401
        session['token'] = token
        return jsonify({"token": token}), 200
    except Exception as err:
        return jsonify("err when login: {}".format(err)), 401


def get_feed(token):
    return requests.get('{S}/feed'.format(S=REMOTE_SERVICE_ENDPOINT), headers={'Authorization': token})


def is_user_logged_in():
    return 'token' in session
