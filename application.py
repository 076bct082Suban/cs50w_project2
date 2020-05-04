import os

from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit

from models import *
import json
from datetime import datetime


app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# A list of all the available channels (objects)
channel_list = {}


channel_list['welcome'] = Channel(name='welcome')

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/create_channel", methods=["POST"])
def create_channel():
    name = request.form.get("name")
    
    # If name is empty. 
    if name == None:
        return jsonify({"success": False, "already_exist": False, "is_empty": True})

   # If there is already a channel of the same name
    for channel in channel_list.values():
        if channel.get_name() == name:
            return jsonify({"success": False, "already_exist": True, "is_empty": False})
    
    channel_list[name] = Channel(name=name)
    print(channel_list)
    
    return jsonify({'success': True, 'name': name})

@app.route("/get_channels")
def get_channels():
    # channels = {}  # A dictionary that will have the channels as json objects

    # for channel in channel_list:
    #     channels[channel] = (channel_list[channel]).to_json()

    channels = []
    
    for channel in channel_list:
        channels.append(channel_list[channel].to_json())
    
    return jsonify({'success': True, 'channels': channels})


@app.route("/channel_info", methods=["POST"])
def channel_info():
    channel_name = request.form.get("channel")
    print(channel_name)
    # print(channel_list[channel_name])
    # return jsonify(channel_list.get(channel_name, {}).to_json())

    try:
        return jsonify({'data': channel_list[channel_name].to_json(), 'success': True})
    
    except KeyError:
        return jsonify({'success': False})


@socketio.on("post message")
def post_message(msg):
    print(msg)
    channel = channel_list[msg['channel']]
    message_object = message(text=msg['message'], sent_by=msg['sent_by'], timestamp=msg['timestamp'])
    channel.add_message(message_object)

    emit('notify message', {'message': message_object.to_json(), 'channel_name': msg['channel']}, broadcast=True)



if __name__ == "__main__":
    socketio.run(app,   debug=True)