require 'discordrb'
require 'json'

puts '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'
puts 'THIS SCRIPT IS VERY DANGEROUS'
puts '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'
puts 'Running it on the wrong server or at the wrong time of year will make '\
  'a lot of people very angry!'
puts 'Are you sure you want to remove everyone from every class?'
puts 'Type "yes" to continue'

exit unless gets.chomp == 'yes'

config = JSON.parse(File.read('config.json'))
discord = Discordrb::Commands::CommandBot.new token: config['api_token'],
                                              prefix: '!'

discord.ready do
  server = discord.servers[config['server_id']]
  server.users.each do |user|
    user.roles.each do |role|
      if role.name.start_with? 'class-'
        puts "Removing #{role.name} from #{user.name}"
        user.remove_role role
      end
    end
  end
  server.channels.each do |channel|
    next unless channel.parent_id == config['class_category_id']

    hit_age_limit = false
    while channel.history(1).count != 0
      puts "Pruning from #{channel.name}..."
      begin
        if hit_age_limit
          channel.history(100).each(&:delete)
        else
          channel.prune 100, strict: true
        end
      rescue ArgumentError
        hit_age_limit = true
      end
    end
  end
  exit
end

discord.run
