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
     console.log('Bot logged in as ${client.user.tag}');
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

function getDiscordUser(msg, username)
{
    
}

function getUserGold(id)
{
    var result = getUserInCollection(id);

    return result.balance;
}

function setUserGold(id, value)
{
    var user = getUserInCollection(id);

    user.balance = value;

    userCollection.update(user);
}

function addUserGold(id, amount)
{
    var result = getUserInCollection(id);

    result.balance += amount;

    userCollection.update(result);
}

function subtractUserGold(id, amount, doSaturation = false)
{
    var user = getUserInCollection(id);

    if(user.balance - amount < 0)
    {
        if(doSaturation)
        {
            user.balance = 0;
        }
        else
        {
            return amount - user.balance;
        }
    }
    else
    {
        user.balance -= amount;
    }

    userCollection.update(user);

    return 0;
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


function handleGoldCommand(msg, args)
{
    const author = msg.author;
    const channel = msg.channel;

    if(args.length == 0 || args[0] === "balance")
    {
        channel.send(author + " your balance is " + getUserGold(author.id) + " gold");
        return;
    }

    if(args[0] === "give")
    {
        if(args.length < 3)
        {
            channel.send("gold give [user] [amount]");
            return;
        }

        var target = msg.mentions.members.first();

        if(target === undefined)
        {
            channel.send(args[1] + " is not a user!");
            return;
        }

        const amount = parseInt(args[2]);

        if(amount === NaN)
        {
            channel.send(args[2] + " is not a number.");
            return;
        }

        if(amount < 0)
        {
            channel.send("The amount must be a positive number.");
            return;
        }

        const subResult = subtractUserGold(author.id, amount, false);

        if(subResult !== 0)
        {
            channel.send(author + " You must have " + subResult + " more gold before you can give to " + target);
            return;
        }

        addUserGold(target.id, amount);
        channel.send(author + " sent " + target +" " + amount + " gold.");
        target.send(author + " sent you " + amount + " gold.");

        return;
    }

    channel.send("!gold or !gold [arguments]");
}

function handleDmCommand(msg, args)
{
    const author = msg.author;
    const channel = msg.channel;

    if(args.length === 0)
    {
        channel.send("!dm [args]");
        return;
    }

    if(args[0] === "gold")
    {
        if(args.length < 2)
        {
            channel.send("!dm gold [user]");
            return;
        }

        const target = msg.mentions.members.first();

        if(target === undefined)
        {
            channel.send(args[1] + " is not a valid user!");
            return;
        }

        const targetBalance = getUserGold(target.id);

        channel.send(target + " has " + targetBalance + " gold.");

        return;
    }

    channel.send("!dm [args]");
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
        handleGoldCommand(msg, args);
    }
    else if(command === "dm")
    {
        handleDmCommand(msg, args);
    }
    else if(command === "test")
    {
        addUserGold(author.id, 10000);
    }
    else
    {
        channel.send("Could not find command! See !help");
    }
 });

 client.login(config.discord.token);