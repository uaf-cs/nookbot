# NookBot
This bot is designed to manage the UAF Computer Science Discord server (primarily by adding people to class-specific roles).

## Running
(Assuming you have a working Docker installation already)

Copy `docker-compose.example.yaml` to `docker-compose.yaml` and update it with your dev server's information.
```shell
# Gets deps installed for your editor
npm install

# Build and start bot
docker-compose up --build
```

## Contributing
Code should be checked with `npm run lint` prior to commit.

[Past contributors](https://github.com/uaf-cs/NookBot/graphs/contributors)
