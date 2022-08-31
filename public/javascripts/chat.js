console.log('chat.js file loaded!')

// IMPORTANT! By default, socket.io() connects to the host that
// served the page, so we dont have to pass the server url
var socket = io.connect('http://hafiz.work:7879')
// var socket = io.connect('http://localhost:8000')
var roomName;

// guna ni masa nak click user (from id sender, to id receiver)
let currentUser, sendTo;
let joinForm = document.getElementById('joinForm')
joinForm.addEventListener('submit', (e) => {
  // avoids submit the form and refresh the page
  e.preventDefault()
  let elementfrom = document.getElementById('from');
  let elementTo = document.getElementById('to');
  let from = elementfrom.value;
  let to = elementTo.value;

  currentUser = from;
  sendTo = to;
  socket.emit('join', {'from':from, "to":to});
})

socket.on('room', (data) => {
  // console.log('received welcome-message >>', data)
  // adds message, not ours
  // console.log(data.data)
  roomName = data.room
  for (var i = 0; i < data.data.length; i++ ){
    var from = data.data[i].from;
    var receiver = data.data[i].to;

    if (from == currentUser) {
      var newData = { user:from, message:data.data[i].content}
      addMessage(newData, true)
    } else {
      var newData = { user:from, message:data.data[i].content}
      addMessage(newData, false)
    }
  }
})

socket.on("receive_message", (newMessage) => {
  console.log("receive_message here")
  console.log(newMessage);

    // sample data (sample data dari server)
    data = {
        "status": true,
        "data": {
            "type": 1,
            "from": newMessage.from,
            "to": newMessage.to,
            "content": newMessage.msg,
            "media1": "",
            "created_at": "dummy",
            "updated_at": "dummy",
            "id": "dummy"
        }
    }

    if (currentUser != data.data.from){
      newData = { user:data.data.from, message:data.data.content}
      addMessage(newData, false)
    }
});


// receives two params, the message and if it was sent by yourself
// so we can style them differently
function addMessage(data, isSelf = false) {
  const messageElement = document.createElement('div')
  messageElement.classList.add('message')
  console.log(data)
  if (isSelf) {
    messageElement.classList.add('self-message')
    messageElement.innerText = `${data.message}`
  } else {
    if (data.user === 'server') {
      // message is from the server, like a notification of new user connected
      // messageElement.classList.add('others-message')
      messageElement.innerText = `${data.message}`
    } else {
      // message is from other user
      messageElement.classList.add('others-message')
      messageElement.innerText = `${data.user}: ${data.message}`
    }
  }
  // get chatContainer element from our html page
  const chatContainer = document.getElementById('chatContainer')

  // adds the new div to the message container div
  chatContainer.append(messageElement)
}

////---- Broadcast ---///

const messageForm = document.getElementById('messageForm')

messageForm.addEventListener('submit', (e) => {
  // avoids submit the form and refresh the page
  e.preventDefault()

  const messageInput = document.getElementById('messageInput')

  // check if there is a message in the input
  if (messageInput.value !== '') {
    let newMessage = messageInput.value
    //sends message and our id to socket server
    socket.emit('send_message', { 'room' : roomName, 'from': currentUser, 'to' : sendTo, 'msg': newMessage, 'media1': '', 'media_type': ''});
    // appends message in chat container, with isSelf flag true
    addMessage({ message: newMessage }, true)
    //resets input
    messageInput.value = ''
  } else {
    // adds error styling to input
    messageInput.classList.add('error')
  }
})
