require 'discordrb'
require 'net/https'
require 'json'

config = JSON.parse(File.read('config.json'))
discord = Discordrb::Commands::CommandBot.new token: config['api_token'],
                                              prefix: '!'
discord.run :async

server = discord.servers[config['server_id']]

def admin_or_teacher?(user)
  user.roles.each do |role|
    return true if role.permissions.administrator || role.name == 'Teacher'
  end
  false
end

discord.command(:createclass,
                description: 'Creates a new class chat',
                usage: 'createclass cs123') do |event, class_id_raw|
  if admin_or_teacher? event.user
    class_category_id = config['class_category_id']
    class_channel_names = server.channels
                                .select { |c| c.parent_id == class_category_id }
                                .map(&:name)
    class_id = class_id_raw.downcase.chomp
    return 'duplicate class' if class_channel_names.include? class_id

    class_role = server.create_role name: "class-#{class_id}"
    everyone_role = server.roles.find { |r| r.name == '@everyone' }

    read_messages = Discordrb::Permissions.new
    read_messages.can_read_messages = true
    read_messages.can_send_messages = true
    read_messages.can_read_message_history = true

    class_role_overwrite = Discordrb::Overwrite.new class_role,
                                                    allow: read_messages
    everyone_role_overwrite = Discordrb::Overwrite.new everyone_role,
                                                       deny: read_messages

    server.create_channel class_id, 0, permission_overwrites: [
      class_role_overwrite,
      everyone_role_overwrite
    ], parent: config['class_category_id']
    'Channel created'
  else
    "You don't have permission to use this command."
  end
end

discord.command(:destroyclass,
                description: 'Destroys an existing class chat',
                usage: 'destroyclass cs123') do |event, class_id_raw|
  authorized = admin_or_teacher? event.user
  return "You don't have permission to use this command." unless authorized

  class_id = class_id_raw.downcase.chomp
  channel = server.channels.find { |r| r.name == class_id }
  class_category_id = config['class_category_id']
  return 'Not a valid class chat' if channel.parent_id != class_category_id

  channel.delete
  server.roles.find { |r| r.name == "class-#{class_id}" }.delete
  return 'Channel deleted'
end

discord.command(:joinclass,
                description: 'Adds you to a class chat',
                usage: 'joinclass cs123') do |event, *class_id_array|
  class_category_id = config['class_category_id']
  class_id_array.map!(&:downcase)
  class_channel_names = server.channels
                              .select { |c| c.parent_id == class_category_id }
                              .map(&:name)
  roles = []
  class_id_array.each do |class_id|
    return 'Invalid class id' unless class_channel_names.include? class_id

    roles.push(server.roles.find { |r| r.name == "class-#{class_id}" })
  end
  event.user.modify_roles(roles, [], nil)
  return 'done'
end

discord.command(:dropclass,
                description: 'Removes you from a class chat',
                usage: 'dropclass cs123') do |event, *class_id_array|
  class_category_id = config['class_category_id']
  class_id_array.map!(&:downcase)
  class_channel_names = server.channels
                              .select { |c| c.parent_id == class_category_id }
                              .map(&:name)
  roles = []
  class_id_array.each do |class_id|
    return 'Invalid class id' unless class_channel_names.include? class_id

    roles.push(server.roles.find { |r| r.name == "class-#{class_id}" })
  end
  event.user.modify_roles([], roles, nil)
  return 'done'
end

discord.command(:classes, description: 'Lists classes', usage: 'classes') do
  message = "Currently available class channels:\n"
  class_category_id = config['class_category_id']
  server.channels.select { |c| c.parent_id == class_category_id }.each do |c|
    message << "* #{c.name}\n"
  end
  return message
end

discord.command(:source,
                description: 'Tells you where to find the source code',
                usage: 'source') do
  'https://github.com/FineTralfazz/NookBot'
end

discord.member_join do |event|
  event.user.pm.send_embed do |embed|
    embed.title = "Welcome to the UAF CS Discord! Here's some important info"\
                  'to get you started on the server.'
    embed.colour = 0x38a4f4

    embed.add_field(name: '📛', value: 'First things first, we need to know '\
      'who you are! Message one of the admins(the people in yellow on the '\
      "right when you're in the server) and tell them who you are.")
    embed.add_field(name: '🏷️', value: 'Next you need to set your name! If '\
      "you're on a computer, right clicking yourself while in the server and "\
      "selecting 'change nickname' will let you set your name for the server.")
    embed.add_field(name: '📚', value: 'Lastly, you can join specific class '\
      'chats with the help of our resident NookBot. You can type the !classes '\
      'command to see available classes and !joinclass (class-name) to join '\
      "that class. Make sure you do all NookBot commands within the 'NookBot"\
      "'Den' channel.")
    embed.add_field(name: 'P.S.', value: 'For all other rules ask an admin or '\
      'see the server-rules channel.')
  end
end

##
# Fun stuff
##

discord.command(:roll,
                description: 'Performs a dice roll',
                usage: 'roll 20') do |_event, dice|
  begin
    highest_number = Integer(dice)
  rescue ArgumentError
    return 'Proper usage is !roll 20'
  end
  rand(1..highest_number)
end

discord.command(:cat, description: 'Gives random cat', usage: 'cat') do |event|
  uri = URI('https://aws.random.cat/meow')
  response = Net::HTTP.get(uri)
  random_kitty = JSON.parse(response)['file']
  event.channel.send_embed do |embed|
    embed.image = Discordrb::Webhooks::EmbedImage.new(url: random_kitty)
  end
end

discord.command(:dog, description: 'Gives random dog', usage: 'dog') do |event|
  uri = URI('https://dog.ceo/api/breeds/image/random')
  response = Net::HTTP.get(uri)
  random_doggy = JSON.parse(response)['message']
  event.channel.send_embed do |embed|
    embed.image = Discordrb::Webhooks::EmbedImage.new(url: random_doggy)
  end
end

discord.command(:fact, description: 'Gives random fact', usage: 'fact') do
  url = 'http://randomuselessfact.appspot.com/random.json?language=en'
  uri = URI(url)
  response = Net::HTTP.get(uri)
  random_fact = JSON.parse(response)['text']
  return random_fact
end

discord.command(:hotdog,
                description: 'Gives a hotdog',
                usage: 'hotdog') do |event|
  event.channel.send_embed do |embed|
    embed.image = Discordrb::Webhooks::EmbedImage.new(url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Hotdog_-_Evan_Swigart.jpg/1200px-Hotdog_-_Evan_Swigart.jpg')
  end
end

discord.listening = '!help'
discord.sync
