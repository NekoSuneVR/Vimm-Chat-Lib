# Vimm-Chat-Lib
Fork of https://github.com/GlobalGamer2015/Glimesh-Chat-Lib but Built in VimmTV Chat WSS


## Usage

```node

const Channel = ""; // Your channel's username

const Vimm = require("vimm-chat-lib")
const chat = new Vimm.VimmChat({
	debug: false // Outputs heartbeat logs if true.
})

function Connect(){
	chat.connect(Channel).then(meta => {
		chat.on("message", msg => {
			console.log(msg)
			// msg displays the following when a message is said in chat.
			//{
  			//	prefix: '',
  			//	message: 'test',
  			//	chatter: 'username',
                        //      mtype: 'message'
   			//	channel: 'channelname'
			//}
			
			if(msg.message == "!close"){
				chat.close() // This !close command will turn the bot off
			}
    	})
		chat.on("close", event => {
			console.log(event)
			if(event){ // removed due to the bot not connecting - if(event == 1006)
				chat.connect(Channel) // If Abnormal disconnect (1006), Glimesh Bot reconnects.
			}
		})
	})
}
Connect() // Initiates connection to Glimesh's WS Server.

```
