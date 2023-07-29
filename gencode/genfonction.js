const { createLanguageService } = require("typescript");
const { WebSocket } = require("ws");

// function askChatgpt(value){
//     let result;
//     const question = value;
//     const server = new WebSocket('ws://127.0.0.1:1956');
//     server.onopen = async function(){

//         server.send(JSON.stringify({
//             clientID : "applicationName"
//         }))

//         server.send(JSON.stringify({
//             conversation : {question : question},
//             source : "applicationName",
//             destination : 'chatGPT'
//         }))

//         server.onmessage = async function(msg){
//             //Take a look at the console to see the form of the answer

//             //The whole message received
//             const data = JSON.parse(msg.data);

//             //The data related to the answer : 
//             const answerData = data.answer;

//             //The data related to the conversation
//             const conversationData = answerData.conversationData;

//             //The actual answer's portions :
//             result = conversationData.text;
            
//             console.log(result);
            
//         }

        
//     }
   
// }
// askChatgpt("hello")



// module.exports={askChatgpt}
const config = {
    searchPattern: /(\/\/|#|--|<!--)\s?ask\s?(.+?)(\?|-->)$/,
    instraction: ["All the code in one codeblock"]
};

async function retrieveAnswer(question) {
    const chatgptAnswer = new Promise((resolve, reject)=>{
        const url = 'ws://localhost:1956';
        const chatgpt = new WebSocket(url);

        chatgpt.onopen = ()=>{
            chatgpt.send(JSON.stringify({clientID : "vscode"}));
            chatgpt.send( 
                JSON.stringify({
                    source : "vscode",
                    destination : "chatGPT",
                    conversation : {
                        question : question+" ["+config.instraction.join(', ')+" ]",
                        conversationId : undefined,
                        parentMessageId : undefined,
                        deleteAfterFinished : true
                    }
            }));
            
            chatgpt.onmessage = (message)=>{
                //@ts-ignore
                const concreteData = JSON.parse(message.data);
                if(concreteData.answer.done === true){
                    const completeAnswer = concreteData.answer.conversationData.text;
                    resolve(completeAnswer);
                }
            };

            chatgpt.onerror = (error) => {
                reject(error);
            };
      
            chatgpt.onclose = () => {
                reject(new Error('WebSocket connection closed.'));
            };
        };
    });
    
    return chatgptAnswer;

}

module.exports={retrieveAnswer}