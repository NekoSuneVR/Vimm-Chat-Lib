# Vimm-Chat-Lib
Fork of https://github.com/GlobalGamer2015/Glimesh-Chat-Lib but Built in VimmTV Chat WSS


## Usage

```node

const Channel = ["channel1","channel2","ETC"]; // Your channel's username

const Vimm = require("vimm-chat-lib")

const chat = new Vimm.VimmChat({
	token: "BOT TOKEN HERE",
	debug: false // Outputs heartbeat logs if true.
	
})

function Connect(){

	chat.connect(Channel).then(meta => {
	
		chat.on("message", msg => {
			
			if (msg.roles[0].bot == true) return
			
			// msg displays the following when a message is said in chat.
			//{
			//      roles: [{
                        //         admins: false,
                        //         developer: false,
                        //         broadcaster: false,
                        //         moderators: false,
                        //         bot: false,
                        //         subscriber: false,
                        //         premiumT1: false,
                        //         premiumT2: false,
                        //         premiumT3: false,
                        //         supporter: false
			//      }]
  			//	mtype: 'message',
  			//	message: 'test',
  			//	chatter: 'username',
			//      channel: 'channelname',
			//      prefix: '[bot]'
			//}
			
			if (msg.message == "!hey") {
				chat.sendMessage("YOURCHANNELNAME", `HELLO THERE, NICE MEET YOU!`)
			}

			// BOT MESSAGE LAYOUT
			
			//{
			//      roles: [{
                        //         admins: false,
                        //         developer: false,
                        //         broadcaster: false,
                        //         moderators: false,
                        //         bot: true,
                        //         subscriber: false,
                        //         premiumT1: false,
                        //         premiumT2: false,
                        //         premiumT3: false,
                        //         supporter: false
			//      }]
  			//	mtype: 'message',
  			//	message: 'HELLO THERE, NICE MEET YOU!',
  			//	chatter: 'BOTNAME',
			//      channel: 'YOURCHANNEL',
			//      prefix: '[bot]'
			//}
			
                })
		
		chat.on("close", event => {

			if(event){ // removed due to the bot not connecting - if(event == 1006)
			
				chat.connect(Channel) // If Abnormal disconnect (1006), Vimm Bot reconnects.
				
			}
			
		})
		
	})
	
}

Connect() // Initiates connection to Vimm's WS Server.

```
