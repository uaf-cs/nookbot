require 'discordrb'
require 'net/https'
require 'json'

config = JSON.parse(File.read('config.json'))
discord = Discordrb::Commands::CommandBot.new(
  token: config['api_token'],
  prefix: '!',
  command_doesnt_exist_message: 'Unrecognized command.',
  channels: ['nookbot-den']
)

discord.run :async

server = discord.servers[config['server_id']]
bot_start_time = Time.new

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

    class_role = server.create_role name: "class-#{class_id}", permissions: 0
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
    return "Invalid class id: #{class_id}" unless class_channel_names.include? class_id

    roles.push(server.roles.find { |r| r.name == "class-#{class_id}" })
  end
  event.user.modify_roles(roles, [], nil)
  return 'Done'
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
  return 'Done'
end

discord.command(:classes,
                description: 'Lists classes',
                usage: 'classes',
                aliases: %i[listclasses classlist]) do
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

discord.command(:shutdown,
                description: 'Gracefully shuts down the bot.',
                usage: 'shutdown') do |event|
  authorized = admin_or_teacher? event.user
  return "You don't have permission to use this command." unless authorized

  event.respond '💀'
  discord.stop
end

discord.command(:status,
                description: 'Prints current bot/system status.',
                usage: 'status') do
  time_format = '%-l:%M %p, %B %e, %Y (%Z)'

  uptime_file = File.open('/proc/uptime')
  system_start_time = Time.new - uptime_file.read.split(' ')[0].to_i
  uptime_file.close
  return "```Bot up since #{bot_start_time.strftime(time_format)}.\n"\
         "System up since #{system_start_time.strftime(time_format)}.\n"\
         "Running on #{`hostname -f`.chomp}.```"
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
  url = 'https://uselessfacts.jsph.pl/random.json?language=en'
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

discord.command(:mute, description: 'Mutes Spud', usage: 'mute @user') do |event, *mentions|
  authorized = admin_or_teacher? event.user
  return "You don't have permission to use this command." unless authorized

  return 'No users to mute.' if mentions.empty?

  muted_role = server.roles.find { |r| r.name == 'Muted' }

  return "You don't a muted role, what're you even trying to do?" if muted_role.nil?

  response = ''
  mentions.each do |mention|
    id = mention.tr('<@!>', '').to_i
    member = server.member(id)

    if member.nil?
      response += "#{mention} not found\n"
    else
      member.add_role(muted_role, "Muted by #{event.user.username}")
      response += "#{member.mention} muted\n"
    end
  end
  event.channel.send_embed do |embed|
    embed.description = response
  end
end

discord.command(:unmute, description: 'Unmutes Spud', usage: 'unmute @user') do |event, *mentions|
  authorized = admin_or_teacher? event.user
  return "You don't have permission to use this command." unless authorized

  return 'No users to mute.' if mentions.empty?

  muted_role = server.roles.find { |r| r.name == 'Muted' }

  return "You don't a muted role, what're you even trying to do?" if muted_role.nil?

  response = ''
  mentions.each do |mention|
    id = mention.tr('<@!>', '').to_i
    member = server.member(id)

    if member.nil?
      response += "#{mention} not found\n" unless member
    else
      member.remove_role(muted_role, "Unmuted by #{event.user.username}")
      response += "#{member.mention} unmuted\n"
    end
  end
  event.channel.send_embed do |embed|
    embed.description = response
  end
end

discord.listening = '!help'
discord.sync
