const template_channels = Handlebars.compile(document.querySelector("#channel-template").innerHTML);
const template_other_message = Handlebars.compile(document.querySelector('#other-message-template').innerHTML)
const template_self_message = Handlebars.compile(document.querySelector('#self-message-template').innerHTML)

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#content").style.display = 'none';
    if(localStorage.getItem('username')){
        username = localStorage.getItem('username');
        login(username);
    }
        
    document.querySelector("#username_submit").onclick = () => {
        const username = document.querySelector("#username").value;
        console.log(username);
        login(username);
        return false;
    }

    document.querySelector("#logout").onclick = () => {
        localStorage.removeItem('username');
        location.reload();
    }

    document.querySelector("#create-channel").onclick = () => {

        // Showing the text box to make new channel
        document.querySelector("#create-channel-item").style.display = 'block';

        // Making the submit button valid
        document.querySelector("#conform-channel").onclick = () => {
            const name = document.querySelector("#new-channel-name").value;

            if(name == ''){
                document.querySelector("#new-channel-error-text").innerHTML = "Name Field Empty";
                return false;
            }

            // Making a request to make the channel.
            const request = new XMLHttpRequest();

            request.open("POST", '/create_channel');

            request.onload = () => {
                const data = JSON.parse(request.responseText);
                
                if(data.success){
                    console.log(`successfully created ${data.name}`);

                    // Clearing the data and removing the input field from display
                    document.querySelector("#new-channel-name").value = '';
                    document.querySelector("#create-channel-item").style.display = 'none';

                    // Reloads the channels
                    load_channels();
                    console.log(data.name)
                    open_channel(data.name);

                }else {
                    if(data.already_exist){
                        document.querySelector("#new-channel-error-text").innerHTML = "Channel with that name already exist";
                    }
                    if(data.is_empty){
                        document.querySelector("#new-channel-erro-text").innerHTML = "Name Field Empty";
                    }
                }
            }
            const data = new FormData();
            data.append("name", name);
            request.send(data);
            return false;
        };
    };

    // Loads all the channels.
    load_channels();



    if(!localStorage.getItem('last_channel')){
        open_channel('welcome');    

    }else {
        // console.log(localStorage.getItem('last_channel'));
        open_channel(localStorage.getItem('last_channel'));
    }
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('connect', () => {

        document.querySelector("#send-message").onclick = () => {
            const message = document.querySelector("#message").value;
            document.querySelector("#message").value = "";
            const today  = new Date();
            socket.emit('post message', {
                'message': message, 
                'sent_by': localStorage.getItem('username'),
                'timestamp': today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds(),
                'channel': localStorage.getItem('last_channel')
            })
            return false;   
        }

    });

    socket.on('notify message', (data) => {
        notify(data.channel_name);
        if(data.channel_name == localStorage.getItem('last_channel')){
            message = JSON.parse(data.message)

            if(message.sent_by == localStorage.getItem('username')){
                const content = template_self_message(message);
                document.querySelector("#messages-list").innerHTML += content;

            }else {
                const content = template_other_message(message);
                document.querySelector("#messages-list").innerHTML += content;
            }

        }
    })

});

function notify(channel_name){
    // TODO make like a notification in sidebar 
    console.log(channel_name);
}

function open_channel(channel_name){
    const request = new XMLHttpRequest();
    request.open("POST", "/channel_info")
    request.onload = () => {
        // TODO
        // I have no clue why i have to do this twice.
        // console.log(JSON.parse(request.responseText) === {});
        // After getting an empty 
        // if(Object.keys(JSON.parse(request.responseText)).length == 0){
        //     console.log("Channel doesn't exist");
        //     open_channel('welcome');
        //     return
        // }

        const response = JSON.parse(request.responseText);
        if(!response.success){
            console.log('Channel doesn\'t exist');
            open_channel('welcome');
            return
        }

        const data = JSON.parse(response.data);

        title = data.name;
        document.title = title;
        history.pushState(response, title, title);
        localStorage.setItem('last_channel', title);

        messages = data.messages
        for(const message of messages){
            // const msg = message.timestamp
            // message.timestamp = msg.slice(11, 20);
            if(message.sent_by == localStorage.getItem('username')){
                const content = template_self_message(message);
                document.querySelector("#messages-list").innerHTML += content;
            }else {
                const content = template_other_message(message);
                document.querySelector("#messages-list").innerHTML += content;
            }            

        }
    }

    const data = new FormData();
    console.log(channel_name);
    data.append("channel", channel_name)
    request.send(data);
}

function load_channels(){
    const request = new XMLHttpRequest();
    request.open("GET", "/get_channels");
    request.onload = () => {
        const response = JSON.parse(request.responseText);

        if(!response.success){
            console.log("something went wrongg");
            return
        }
        const channels = response.channels
        // const channel_names = channels.map(channel => channel[name]);
        const channel_names = [];
        for(const channel of channels){
            channel_names.push(JSON.parse(channel).name);
        }
         
        const content = template_channels({'channels': channel_names});

        document.querySelector("#sidebar-channel").innerHTML = content;

        document.querySelectorAll(".channel_head").forEach(channel => {
            channel.onclick = () => {
                // console.log(channel.dataset.channel);
                open_channel(channel.dataset.channel)
            }
        })
        
    };
    request.send();
}

function login(username) {
    localStorage.setItem('username', username);
    document.querySelector("#user_info").style.display = 'none';
    document.querySelector("#content").style.display ='block';
    document.querySelector("#name").innerHTML = username;
}