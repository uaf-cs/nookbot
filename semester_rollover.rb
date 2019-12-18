require 'discordrb'
require 'json'

puts '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'
puts 'THIS SCRIPT IS VERY DANGEROUS'
puts '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'
puts 'Running it on the wrong server or at the wrong time of year will make '\
  'a lot of people very angry!'
puts 'This will delete and recreate all class channels and roles, all history ' \
  'will be lost.'
puts 'Are you sure you want to do this?'
puts 'Type "yes" to continue'

exit unless gets.chomp == 'yes'

config = JSON.parse(File.read('config.json'))
discord = Discordrb::Commands::CommandBot.new token: config['api_token'],
prefix: '!'

discord.ready do
  server = discord.servers[config['server_id']]
  classes = []
  server.roles.each do |role|
    next unless role.name.start_with? 'class-'
    classes.push(role.name)
    role.delete 'Semester rollover'
  end

  server.channels.each do |channel|
    next unless channel.parent_id == config['class_category_id']
    channel.delete 'Semester rollover'
  end

  classes.each do |className|
    class_role = server.create_role name: className, permissions: 0, reason: 'Semester rollover'

    read_messages = Discordrb::Permissions.new
    read_messages.can_read_messages = true
    class_role_overwrite = Discordrb::Overwrite.new class_role,
    allow: read_messages
    everyone_role_overwrite = Discordrb::Overwrite.new config['server_id'],
    deny: read_messages

    className.slice!('class-')
    server.create_channel className, 0, permission_overwrites: [
      class_role_overwrite,
      everyone_role_overwrite
    ], parent: config['class_category_id']
  end
  exit
end

discord.run
