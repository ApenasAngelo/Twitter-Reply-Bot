import axios from 'axios';
require('dotenv').config();

export async function aiRequest(input: string = ''): Promise<String | undefined> {
    if (process.env.AI_API_KEY && process.env.AI_ENDPOINT) {
        const apiKey = process.env.AI_API_KEY;
        const endpoint = process.env.AI_ENDPOINT;

        try {
            const response = await axios.post(endpoint, {
                model: 'gpt-4-1106-preview',
                messages: [{
                    role: 'system',
                    content: 'Você deve respoder repetindo o que foi dito, fazendo com que a frase tenha sentido oposto. Além disso, também substitua adjetivos pelo seu sentido oposto literalmente. Se for somente uma letra ou um numero, responda com a letra ou o numero seguinte. Se sua resposta não for válida, responda “Error 2811".',
                },
                {
                    role: 'user',
                    content: input,
                }],
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ${apiKey}',
                },
            });

            const answer = response.data.choices[0].message.content;
            if (answer === 'Error 2811') {
                return undefined;
            }
            console.log('Resposta:', answer);
            return response.data.choices[0].message.content;

        } catch (error) {
            console.error('Erro na solicitação:', error);
            return undefined;
        }
    }
}