require 'discordrb'
require 'net/https'
require 'json'
TOKEN = ENV['DISCORD_API_TOKEN']
SERVER_ID = 478810581273673746
CLASS_CATEGORY_ID = 478815208035581978

discord = Discordrb::Commands::CommandBot.new token: TOKEN, prefix: '!'
discord.run :async

server = discord.servers[SERVER_ID]

def is_admin_or_teacher(user)
  result = false
  user.roles.each do |role|
    if role.permissions.administrator || role.name == "Teacher" then
      result = true
    end
  end
  return result
end


discord.command(:createclass, description: 'Creates a new class chat', usage: 'createclass cs123') do |event, class_id_raw|
  if is_admin_or_teacher event.user
    class_id = class_id_raw.downcase.chomp
    class_role = server.create_role name: "class-#{ class_id }"
    everyone_role = server.roles.find { |r| r.name == '@everyone' }

    read_messages = Discordrb::Permissions.new
    read_messages.can_read_messages = true

    class_role_overwrite = Discordrb::Overwrite.new class_role, allow: read_messages
    everyone_role_overwrite = Discordrb::Overwrite.new everyone_role, deny: read_messages
    
    server.create_channel class_id, 0, permission_overwrites: [class_role_overwrite, everyone_role_overwrite], parent: CLASS_CATEGORY_ID
    return "Channel created"
  else
    return "You don't have permission to use this command."
  end
end


discord.command(:destroyclass, description: 'Destroys an existing class chat', usage: 'destroyclass cs123') do |event, class_id_raw|
  if is_admin_or_teacher event.user
    class_id = class_id_raw.downcase.chomp
    channel = server.channels.find { |r| r.name == class_id }
    if channel.parent_id != CLASS_CATEGORY_ID
      return "Not a valid class chat"
    end
    channel.delete
    server.roles.find { |r| r.name == "class-#{ class_id }" }.delete
    return "Channel deleted"
  else
    return "You don't have permission to use this command."
  end
end


discord.command(:joinclass, description: 'Adds you to a class chat', usage: 'joinclass cs123') do |event, class_id_raw|
  class_id = class_id_raw.downcase.chomp
  class_channel_names = server.channels.select { |c| c.parent_id == CLASS_CATEGORY_ID }.map {|c| c.name}
  if class_channel_names.include? class_id
    role = server.roles.select { |r| r.name == "class-#{ class_id }" }
    event.user.modify_roles(role, [], nil)
    return 'Done'
  else
    return 'Invalid class id'
  end
end


discord.command(:dropclass, description: 'Removes you from a class chat', usage: 'dropclass cs123') do |event, class_id_raw|
  class_id = class_id_raw.downcase.chomp
  class_channel_names = server.channels.select { |c| c.parent_id == CLASS_CATEGORY_ID }.map {|c| c.name}
  if class_channel_names.include? class_id
    role = server.roles.select { |r| r.name == "class-#{ class_id }" }
    event.user.modify_roles([], role, nil)
    return 'Done'
  else
    return 'Invalid class id'
  end
end

discord.command(:roll, description: 'Performs a dice roll', usage: 'roll 20') do |event, dice|
  highest_number = Integer(dice) rescue nil
  if highest_number
    return rand(1..highest_number)
  else
    return 'Proper usage is !roll 20'
   end
end

discord.command(:cat, description: "Gives random cat", usage: 'cat') do |event|
  url = 'https://aws.random.cat/meow'
  uri = URI(url)
  response = Net::HTTP.get(uri)
  random_kitty = JSON.parse(response)["file"]
  event.channel.send_embed do |embed|
   embed.image = Discordrb::Webhooks::EmbedImage.new(url: random_kitty)
  end
end

discord.command(:classes, description: 'Lists classes', usage: 'classes') do |event|
  message = "Currently available class channels:\n"
  server.channels.select { |c| c.parent_id == CLASS_CATEGORY_ID }.each do |c|
    message << "* #{ c.name }\n"
  end
  return message
end

discord.command(:source, description: 'Tells you where to find the source code', usage: 'source') do |event|
  "https://github.com/FineTralfazz/NookBot"
end

discord.sync
