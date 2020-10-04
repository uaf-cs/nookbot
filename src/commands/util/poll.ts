import { CommandClient, Message } from 'eris'

interface Field {
	name: string,
	value: any,
	inline: boolean
}

// Starts a new poll
// Poll structure: !poll name of poll; option 1, emoji 1 ; option 2, emoji 2
export const init = (bot: CommandClient): void => {
	bot.registerCommand('poll', async (msg, args) => {

		// Parse arguments and extract poll title,author and options
		const opts:string[] = args.join(' ').split(';')
		if (opts.length < 3) {
			return 'Invalid poll\nCommand: !poll "Poll name"; [optionX, reactionX]';
		}

		const pollName = 'Poll: ' + opts.shift().trim(); 
		const date = new Date()
		const author = 'Created by ' + msg.author + ' in ' + date;

		// Create 'fields' array with poll options and reactions
		const reactions : Array<string> = []
		const fields : Array<Field> = []
		for (let i in opts) {
			let res = <Field>{}
			const parsed = opts[i].split(',') 
			const key = parsed[0].trim();
			const value = parsed[1].trim()
			reactions.push(value);
			res = {
				name: key,
				value: value,
				inline: false
			};
			fields.push(res);
		}

		msg.channel.createMessage({
			embed: {
				title: pollName,
				fields: fields,
				footer: {
					text: author
				}
			}
		}).then(embedMessage => {
			for (let i in reactions) {
				embedMessage.addReaction(reactions[i]);
			}
		})
	});
}

export default {
	init
}
