
const axios = require('axios');
require('dotenv').config()

async function api(content){
	const promptMessage = {
		model:"gpt-3.5-turbo",
		messages:[
			{role: "user", content:content },
		],
		max_tokens: 3000,
		temperature: 1
	  };
	const response= await axios.post('https://api.openai.com/v1/chat/completions', promptMessage, {
	  headers: {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${process.env.API_KEY}`
	  }
	})
	return response.data.choices[0].message.content
}

console.log(process.env);
module.exports={api}


