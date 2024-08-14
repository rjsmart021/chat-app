from flask import Flask, render_template
from flask_socketio import SocketIO, send, emit, join_room, leave_room
from flask_cors import CORS


app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'mad-max-fury-road'

socketio = SocketIO(app)

# {
#     "rm-general" : []
# }

messages = {}

@app.route('/')
def index():
    return render_template('index.html')

# handle client connecting to server
@socketio.on('connect')
def handle_connect():
    print('Client has connected')

# handle message from client
@socketio.on('message')
def handle_message(data):
    print('Message received:', data)
    socketio.send(f'Data from client: {data}')

# handle client disconnecting from server
@socketio.on('disconnect')
def handle_disconnect():
    print('Client has disconnected')

# handle client joining room
@socketio.on('join_room')
def on_join(data):
    username = data['username']
    room = data['room']
    join_room(room)
    if room not in messages:
        messages[room] = []
    emit('load_messages', messages[room])
    output = f'<em style="color:#78a378">{username} has entered the room.</em>'
    messages[room].append(output)
    send(output, to=room)

# handle client leaving room
@socketio.on('leave_room')
def on_leave(data):
    username = data['username']
    room = data['room']
    output = f'<em style="color:#9e8888">{username} has left the room.</em>'
    messages[room].append(output)
    send(output, to=room)
    leave_room(room)

# handle new message from client
@socketio.on('send_chat_message')
def handle_chat_message(data):
    # get room, user info, and message from client
    room = data.get('room')
    username = data.get('username')
    usercolor = data.get('usercolor')
    chat_message = data.get('chat_message')
    # append new message to room chat
    output = f'<b style="color:{usercolor}">{username}</b>: {chat_message}'
    messages[room].append(output)
    send(output, to=room)


if __name__ == "__main__":
    socketio.run(app, debug=True)