from models import User
import flask_jwt_extended
from flask import Response, request
from flask_restful import Resource
import json
from datetime import timezone, datetime, timedelta

class AccessTokenEndpoint(Resource):

    def post(self):
        body = request.get_json() or {}
        print(body)

        # check username and log in credentials. If valid, return tokens
        username = body.get('username')
        password = body.get('password')
        if not username: 
            return Response(json.dumps({'message': 'missing username'}), mimetype="application/json", status=401)
        if not password: 
            return Response(json.dumps({'message': 'missing password'}), mimetype="application/json", status=401)
        user = User.query.filter_by(username=username).one_or_none()
        if user:
            if user.check_password(password):
                access_token = flask_jwt_extended.create_access_token(identity=user.id)
                refresh_token = flask_jwt_extended.create_refresh_token(identity=user.id)
                return Response(json.dumps({ 
                    "access_token": access_token, 
                    "refresh_token": refresh_token
                }), mimetype="application/json", status=200)
            else:
                return Response(json.dumps({'message': 'invalid password'}), mimetype="application/json", status=401)
        else:
            return Response(json.dumps({'message': 'invalid username'}), mimetype="application/json", status=401)


class RefreshTokenEndpoint(Resource):

    @flask_jwt_extended.jwt_required(refresh=True)
    def post(self):

        body = request.get_json() or {}
        refresh_token = body.get('refresh_token')
        print(refresh_token)
        
        #https://flask-jwt-extended.readthedocs.io/en/latest/refreshing_tokens/
        #Hint: To decode the refresh token and see if it expired:
        decoded_token = flask_jwt_extended.decode_token(refresh_token)
        print(decoded_token)
        exp_timestamp = decoded_token.get("exp")
        current_timestamp = datetime.timestamp(datetime.now(timezone.utc))
        if current_timestamp > exp_timestamp:
            # token has expired:
            return Response(json.dumps({ 
                    "message": "refresh_token has expired"
                }), mimetype="application/json", status=401)
        else:
            # issue new token:
            identity = flask_jwt_extended.get_jwt_identity()
            access_token = flask_jwt_extended.create_access_token(identity=identity)
            return Response(json.dumps({ 
                    "access_token": access_token
                }), mimetype="application/json", status=200)
        


def initialize_routes(api):
    api.add_resource(
        AccessTokenEndpoint, 
        '/api/token', '/api/token/'
    )

    api.add_resource(
        RefreshTokenEndpoint, 
        '/api/token/refresh', '/api/token/refresh/'
    )