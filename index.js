/**
 * guildbotjs
 * Discord Bot for D&D related things 
 * Author Russell Johnson
 * Copyright (C) Russell Johnson 2019
 * 
 */

 const Discord = require("discord.js");

 const client = new Discord.Client();

 const loki = require("lokijs");

 // Read in our config json
 const config = require("./config.json");

 // Create the database
 var db = new loki("database.db");

 // Get the table?
 var userCollection = db.addCollection('users', {
     unique: ['id']
 });
 var fundCollection = db.addCollection('funds');

 /**
  * Handle when the client connects
  */
 client.on('ready', () => {
     console.log("==== guildbotjs ====");
     console.log("Bot logged in as ${client.user.tag}");
 });

function getUserInCollection(discordID)
{
    var result = userCollection.by("id", discordID);
    
    if(result === undefined)
    {
        userCollection.insert({ id: discordID, balance: 0 });
        result = userCollection.by("id", discordID);
    }

    return result;
}

 /**
  * @param {Message} msg Discord message object
  * @returns TRUE if the channel is listed in the config OR is a DM to the bot, FALSE otherwise
  */
function shouldListenToChannel(msg)
{
    if(msg.channel.type === "dm")
    {
        return true;
    }

    for(var i = 0; i < config.discord.listen_channels.length; i++)
    {
        if(config.discord.listen_channels[i] === msg.channel.name)
        {
            return true;
        }
    }

    return false;
}

 /**
  * Handle when people message the bot
  */
 client.on('message', msg => {

    // Don't listen to bots
    if(msg.author.bot)
    {
        return;
    }

    // Only listen to commands
    if(msg.content.indexOf("!") !== 0)
    {
        return;
    }

    // Check if is a DM or a channel we should listen to
    if(!shouldListenToChannel(msg))
    {
        return;
    }

    // Tokenize the commands
    const args = msg.content.slice(1).trim().split(" ");
    const command = args.shift().toLowerCase();

    const author = msg.author;
    const channel = msg.channel;

    if(command === "gold")
    {
        if(args.length === 0)
        {
            var result = getUserInCollection(author.id);

            channel.send(author.username + " your gold balance is: " + result.balance);
        }
    }
    else if(command === "dm")
    {
        if(args.length <= 0)
        {
            channel.send("!dm [args]");
            return;
        }

        if(args[0] === "gold")
        {
            if(args.length == 1)
            {
                channel.send("!dm gold [args]");
            }

            if(args[1] === "add")
            {
                var user = getUserInCollection(author.id);

                user.balance += 100;
                userCollection.update(user);
            }
        }
    }
    else
    {
        author.send("Could not find command! See !help");
    }
 });

 client.login(config.discord.token);