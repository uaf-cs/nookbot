require 'discordrb'
require 'pry'

TOKEN = ENV['DISCORD_API_TOKEN']
SERVER_ID = 478810581273673746
CLASS_CATEGORY_ID = 478815208035581978

discord = Discordrb::Commands::CommandBot.new token: TOKEN, prefix: '!'
discord.run :async

server = discord.servers[SERVER_ID]

def is_admin(user)
  result = false
  user.roles.each do |role|
    if role.permissions.administrator then
      result = true
    end
  end
  return result
end


discord.command(:addclass, description: 'Adds you to a class chat', usage: 'addclass cs123') do |event, class_id|
  class_channel_names = server.channels.select { |c| c.parent_id == CLASS_CATEGORY_ID }.map {|c| c.name}
  if class_channel_names.include? class_id.downcase.chomp then
    role = server.roles.select { |r| r.name == "class-#{ class_id }" }
    event.user.modify_roles(role, [], nil)
    return 'Done'
  else
    return 'Invalid class id'
  end
end


discord.command(:dropclass, description: 'Removes you from a class chat', usage: 'dropclass cs123') do |event, class_id|
  class_channel_names = server.channels.select { |c| c.parent_id == CLASS_CATEGORY_ID }.map {|c| c.name}
  if class_channel_names.include? class_id.downcase.chomp then
    role = server.roles.select { |r| r.name == "class-#{ class_id }" }
    event.user.modify_roles([], role, nil)
    return 'Done'
  else
    return 'Invalid class id'
  end
end

discord.command(:classes, description: 'Lists classes', usage: 'classes') do |event|
  message = "Currently available class channels:\n"
  server.channels.select { |c| c.parent_id == CLASS_CATEGORY_ID }.each do |c|
    message << "* #{ c.name }\n"
  end
  return message
end

discord.sync