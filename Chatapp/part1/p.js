const socket = io()

let activeUser = null;
let userColor = null;
let activeRoom = null;

const usernameForm = document.getElementById('username-form')
const roomForm = document.getElementById('new-room-form')
const chatForm = document.getElementById('send-chat')
const leaveButton = document.getElementById('leave-room')

let roomsList = ["General"]

// Add submit event listener to username form to set active user
usernameForm.addEventListener('submit', (e) => {
    e.preventDefault()

    // Get and set user data
    let newUser = e.target.username.value
    userColor = e.target.usercolor.value
    if (!newUser){
        alert('Username cannot be blank')
        return
    }
    activeUser = newUser
    welcome = document.getElementById('welcome-banner')
    welcome.innerText = "Let's Chat, " + activeUser + "!"

    // Hide the username form
    usernameContainer = document.getElementById('username-form-container')
    usernameContainer.style.display = 'none';

    // Show the room form
    UpdateRoomsList()
    roomContainer = document.getElementById('room-form-container')
    roomContainer.style.display = 'block'
})

// Generate HTML to display available rooms
function UpdateRoomsList() {
    let roomsListDisplay = document.getElementById('rooms-selection')
    roomsListDisplay.innerHTML = '';
    roomsList.forEach( room => {
        let roomElement = document.createElement('button')
        roomElement.id = `rm-${room.toLowerCase().replace(" ", "-")}`
        roomElement.className = 'btn btn-outline-primary w-100 mt-3'
        roomElement.innerHTML = room
        roomsListDisplay.append(roomElement)
    })
}

// Add submit event listener to room form to create new room
roomForm.addEventListener('submit', (e) => {
    e.preventDefault()

    // Get and set room creation value
    let newRoom = e.target.roomname.value
    if (!newRoom){
        console.warn('New room name cannot be blank')
        return
    }
    else if (roomsList.includes(newRoom)){
        alert(`Room "${newRoom}" already exists!`)
        e.target.roomname.value = ""
        return
    }
    roomsList.push(newRoom)
    UpdateRoomsList()
    e.target.roomname.value = ""
})

// Show appropriate room when room button selected
document.addEventListener('DOMContentLoaded', () => {
    const roomsListDisplay = document.getElementById('rooms-selection');

    // Event delegation: add a single event listener to the parent element
    roomsListDisplay.addEventListener('click', (e) => {
        if (e.target && e.target.tagName === 'BUTTON') {
            const room = e.target.id;
            activeRoom = room;

            let roomTitle = document.getElementById('room-title')
            roomTitle.innerText = e.target.innerHTML

            let data = {
                username: activeUser,
                room: activeRoom
            }
            socket.emit('join_room', data);

            // Hide the room form
            roomContainer = document.getElementById('room-form-container');
            roomContainer.style.display = 'none';

            // Show the message form
            messageContainer = document.getElementById('messages-container');
            messageContainer.style.display = 'block';
        }
    })
}) 

socket.on('message', (msg) => {
    // Create a new li element
    let msgElement = document.createElement('li')
    msgElement.className = 'list-group-item'
    msgElement.innerHTML = msg
    // Get the message ul and append the new message
    let chatMessages = document.getElementById('messages')
    chatMessages.append(msgElement)
})

socket.on('load_messages', (messages) => {
    // Get the message HTML and append older messages
    let chatMessages = document.getElementById('messages')
    chatMessages.innerHTML = '';
    messages.forEach( msg => {
        let msgElement = document.createElement('li')
        msgElement.className = 'list-group-item'
        msgElement.innerHTML = msg
        chatMessages.append(msgElement)
    })
})

// Get chat message data to emit to server
chatForm.addEventListener('submit', (e) => {
    e.preventDefault()
    let message = e.target.message.value
    let messageData = {
        room: activeRoom,
        username: activeUser,
        usercolor: userColor,
        chat_message: message
    }
    e.target.message.value = ""
    socket.emit('send_chat_message', messageData)
})

// Leave chatroom
leaveButton.addEventListener('submit', (e) => {
    e.preventDefault()
    let data = {
        username: activeUser,
        room: activeRoom
    }
    socket.emit('leave_room', data)
    activeRoom = null;

    // Hide the message form
    messageContainer = document.getElementById('messages-container');
    messageContainer.style.display = 'none';
    
    // Show the room form
    roomContainer = document.getElementById('room-form-container');
    roomContainer.style.display = 'block';
})
