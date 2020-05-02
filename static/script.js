const template_channels = Handlebars.compile(document.querySelector("#channel-template").innerHTML);
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
            console.log(data);
            request.send(data);
            return false;
        };
    };

    // Loads all the channels.
    load_channels();


});

function open_channel(channel_name){
    const request = new XMLHttpRequest();
    request.open("POST", "/channel_info")
    request.onload = () => {
        // TODO
        const response = JSON.parse(JSON.parse(request.responseText));
        title = response.name;
        document.title = title;
        history.pushState(response, title, title)
    }

    const data = new FormData();
    console.log(channel_name);
    data.append("channel", channel_name)
    // console.log(data);
    request.send(data);
}

function load_channels(){
    const request = new XMLHttpRequest();
    request.open("GET", "/get_channels");
    request.onload = () => {
        const response = JSON.parse(request.responseText);

        console.log(response);
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
        console.log(content);

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