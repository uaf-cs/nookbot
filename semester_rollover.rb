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
  discord.servers[config['server_id']].users.each do |user|
    user.roles.each do |role|
      if role.name.start_with? 'class-'
        puts "Removing #{role.name} from #{user.name}"
        user.remove_role role
      end
    end
  end
  exit
end

discord.run
